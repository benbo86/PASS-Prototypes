// Employees / Customers / Funders toggle — shown only at Level 1 of either
// view (Timesheets() itself, and FunderList), never at Level 2 (matching
// VisitDetail/FunderDetail's existing no-toggle-at-L2 convention). This is
// page-internal state (viewMode), not real navigation, so it's a plain
// button row rather than ScheduleNav (which navigates via real hrefs).
// A real segmented/pill toggle (filled active pill), not underline tabs —
// tabs read as "different pages," a toggle reads as "same data, different
// grouping," which is what switching Employees/Customers/Funders actually
// is here.
// Customers is an inert placeholder — the real Customer timesheet view is
// already in production but was never built in this prototype repo.
export default function ViewToggle({ active, onSelectEmployees, onSelectFunders }) {
  return (
    <div className="ts-view-toggle">
      <button
        className={`ts-view-toggle-btn ${active === 'employees' ? 'active' : ''}`}
        onClick={onSelectEmployees}
      >
        Employees
      </button>
      <button className="ts-view-toggle-btn" style={{ opacity: 0.4, cursor: 'default' }}>
        Customers
      </button>
      <button
        className={`ts-view-toggle-btn ${active === 'funders' ? 'active' : ''}`}
        onClick={onSelectFunders}
      >
        Funders
      </button>
    </div>
  );
}
