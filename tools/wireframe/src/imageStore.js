import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../Components/firebase'

// Pasted/dropped images. Each image is its own Firestore doc in
// `wireframe_images` (doc id = the element's imageId), never stored inside
// the wireframe_saves doc itself: a Firestore doc caps at 1MiB, so two or
// three screenshots inline would break the shared save. The wireframe
// only references images by id.
//
// In memory, an image element also carries `src` (the data URL) so
// rendering, undo/redo, copy/paste and duplicate all work with no special
// cases. `src` is stripped before anything is written (stripImageSrc) and
// put back on load (hydrateImages).

const MAX_DIMENSION = 1600
// Comfortably under Firestore's 1MiB doc limit once field names and the
// timestamp are added. A data URL is ASCII, so length ≈ bytes.
const MAX_DATA_URL_LENGTH = 900_000
// Largest size an image is first placed at on the canvas (canvas px).
// A retina screenshot is often 2000-3000px wide, which would land far
// bigger than the viewport at natural size.
const MAX_PLACED_SIZE = 800

function encode(canvas, mime, quality) {
  return canvas.toDataURL(mime, quality)
}

// Downscales to MAX_DIMENSION and re-encodes as WebP (keeps transparency,
// small for UI screenshots). Safari can't encode WebP from a canvas and
// silently returns PNG instead, so that case falls back to JPEG on a
// white background. Shrinks further until it fits MAX_DATA_URL_LENGTH.
export async function compressImage(blob) {
  const bitmap = await createImageBitmap(blob)
  let scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  for (let attempt = 0; attempt < 8; attempt++) {
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, w, h)
    let dataUrl = encode(canvas, 'image/webp', 0.85)
    if (!dataUrl.startsWith('data:image/webp')) {
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      dataUrl = encode(canvas, 'image/jpeg', 0.85)
    }
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) {
      bitmap.close?.()
      return { dataUrl, width: w, height: h }
    }
    scale *= 0.75
  }
  bitmap.close?.()
  throw new Error('Image is too large to add')
}

// Size an image is first placed at, keeping its aspect ratio.
export function placedSize(width, height) {
  const ratio = Math.min(1, MAX_PLACED_SIZE / Math.max(width, height))
  return { w: Math.round(width * ratio), h: Math.round(height * ratio) }
}

export function imageIdsOf(elements) {
  return [...new Set(elements.filter((el) => el.type === 'image' && el.imageId).map((el) => el.imageId))]
}

export function stripImageSrc(elements) {
  return elements.map((el) => {
    if (el.type !== 'image') return el
    const { src, ...rest } = el
    return rest
  })
}

// { imageId: dataUrl } for every image element that has its data loaded.
export function collectImageData(elements) {
  const map = {}
  elements.forEach((el) => {
    if (el.type === 'image' && el.imageId && el.src) map[el.imageId] = el.src
  })
  return map
}

// Uploads any image not already known to be in Firestore. `uploaded` is a
// Set of imageIds, updated in place so the same image isn't re-sent on
// every save.
export async function uploadImages(elements, uploaded) {
  const data = collectImageData(elements)
  const pending = Object.entries(data).filter(([id]) => !uploaded.has(id))
  for (const [id, dataUrl] of pending) {
    await setDoc(doc(db, 'wireframe_images', id), { dataUrl, createdAt: serverTimestamp() })
    uploaded.add(id)
  }
}

// Puts `src` back on image elements. `known` is an optional
// { imageId: dataUrl } map (e.g. from a local file load); anything not in
// it is fetched from Firestore. An image that can't be found keeps
// src: null and renders as a placeholder rather than breaking the load.
// Returns the hydrated elements plus the ids found in Firestore.
export async function hydrateImages(elements, known = {}) {
  const ids = imageIdsOf(elements)
  const found = { ...known }
  const fromCloud = new Set()
  await Promise.all(ids.filter((id) => !found[id]).map(async (id) => {
    try {
      const snap = await getDoc(doc(db, 'wireframe_images', id))
      if (snap.exists()) {
        found[id] = snap.data().dataUrl
        fromCloud.add(id)
      }
    } catch {
      // Unreachable or not permitted: leave it as a placeholder.
    }
  }))
  const hydrated = elements.map((el) => (el.type === 'image' ? { ...el, src: found[el.imageId] || null } : el))
  return { elements: hydrated, fromCloud }
}

// After a shared wireframe is deleted: removes each of its images from
// wireframe_images unless another shared wireframe (`otherWireframes`, the
// live wireframe_saves list minus the deleted one) still references it.
export async function deleteUnusedImages(deletedElements, otherWireframes) {
  const stillUsed = new Set(otherWireframes.flatMap((w) => imageIdsOf(w.elements || [])))
  const toDelete = imageIdsOf(deletedElements).filter((id) => !stillUsed.has(id))
  await Promise.all(toDelete.map((id) => deleteDoc(doc(db, 'wireframe_images', id))))
  return toDelete
}
