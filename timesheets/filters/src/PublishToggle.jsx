// Timesheets / Unpublished toggle — sits immediately to the left of the
// Employees/Customers/Funders ViewToggle, same .ts-view-toggle* styling.
// Purely decorative for now: no props, no state, no onClick — "Timesheets"
// always renders as the active segment. Wire this up for real once there's
// an actual published/unpublished distinction to switch between.
export default function PublishToggle() {
  return (
    <div className="ts-view-toggle">
      <button className="ts-view-toggle-btn active">Timesheets</button>
      <button className="ts-view-toggle-btn">Unpublished</button>
    </div>
  );
}
