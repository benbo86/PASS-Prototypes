// Employees / Customers / Funders switcher — shown only at Level 1 of either
// view (Timesheets() itself, and FunderList), never at Level 2 (matching
// VisitDetail/FunderDetail's existing no-toggle-at-L2 convention). Page-
// internal state (viewMode), not real navigation.
// A plain styled <select> (.rows-select from the UI Kit — the same "plain
// select" pattern Pagination's own rows-per-page control uses), per Ben's
// direct request to replace the earlier pill/segmented toggle with this
// smaller dropdown. Customers stays an inert placeholder — the real Customer
// timesheet view is already in production but was never built in this
// prototype repo — expressed here as a disabled <option> rather than a
// dimmed button, so it genuinely can't be selected rather than just looking
// unavailable.
export default function ViewToggle({ active, onSelectEmployees, onSelectFunders }) {
  const handleChange = (e) => {
    if (e.target.value === 'employees') onSelectEmployees();
    else if (e.target.value === 'funders') onSelectFunders();
  };

  return (
    <select className="rows-select ts-view-select" value={active} onChange={handleChange}>
      <option value="employees">Employees</option>
      <option value="customers" disabled>Customers</option>
      <option value="funders">Funders</option>
    </select>
  );
}
