import { forwardRef } from 'react'

const PhoneFrame = forwardRef(function PhoneFrame({ children }, ref) {
  return (
    <div className="phone-wrap">
      <div className="phone-frame" ref={ref}>
        {children}
      </div>
    </div>
  )
})

export default PhoneFrame
