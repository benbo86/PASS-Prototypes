export default function ScreenSlider({ secondaryActive, primary, secondary }) {
  return (
    <>
      <div className={`screen-slide ${secondaryActive ? 'slide-out-left' : 'slide-active'}`}>
        {primary}
      </div>
      <div className={`screen-slide ${secondaryActive ? 'slide-active' : 'slide-out-right'}`}>
        {secondary}
      </div>
    </>
  )
}
