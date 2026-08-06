import SegmentedToggle from '../../../Components/SegmentedToggle'

// Timesheets / Unpublished toggle — sits immediately to the left of the
// Employees/Customers/Funders ViewToggle. Purely decorative for now —
// "Timesheets" always renders as the active segment. Wire this up for real
// once there's an actual published/unpublished distinction to switch
// between. Uses the shared Components/SegmentedToggle.jsx (this toggle was
// the original inline implementation the shared component was extracted
// from, once customer-profile/service-agreement/ needed the same look).
export default function PublishToggle() {
  return (
    <SegmentedToggle
      options={[
        { value: 'timesheets', label: 'Timesheets' },
        { value: 'unpublished', label: 'Unpublished' },
      ]}
      value="timesheets"
    />
  )
}
