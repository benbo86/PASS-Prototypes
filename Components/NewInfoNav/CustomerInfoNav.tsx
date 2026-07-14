import { Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import customerPhoto from '../../imports/david_f.jpg';
import { useScrolled } from '../../hooks/useScrolled';

export function CustomerInfo() {
  const { pathname } = useLocation();
  const scrolled = useScrolled();

  const inactiveTabClass =
    'px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 whitespace-nowrap border-b-2 border-transparent hover:border-gray-300 transition-colors';

  const activeTabClass =
    'px-4 py-3 text-sm whitespace-nowrap border-b-2 bg-purple-50 text-[rgb(154,38,214)] border-[rgb(154,38,214)]';

  const tabClass = (path: string) =>
    pathname === path ? activeTabClass : inactiveTabClass;

  return (
    <div className={`bg-white border-b border-gray-200 transition-[margin] duration-300 ${scrolled ? '-mt-12' : 'mt-0'}`}>
      <div className="px-4">
        <div className={`flex gap-4 transition-all duration-300 ${scrolled ? 'py-1.5 items-center' : 'py-4 items-start'}`}>
          {/* Avatar */}
          <div
            className={`rounded-full flex-shrink-0 bg-cover bg-center bg-gray-300 transition-all duration-300 ${scrolled ? 'h-9 w-9' : 'h-16 w-16'}`}
            style={{ backgroundImage: `url(${customerPhoto})` }}
          />

          <div className="flex-1 min-w-0">
            {/* Name and Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-gray-900 font-semibold">Mr Arthur Barrington</h2>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded inline-flex items-center gap-1">
                <Heart size={12} fill="currentColor" />
                <span>DNACPR</span>
              </span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                <span>HIGH RISK</span>
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ backgroundColor: '#B7DDA8', color: '#2D5F1E' }}
              >
                ACTIVE
              </span>
            </div>

            {/* Full details — two rows, shown when not scrolled */}
            <div className={`transition-all duration-300 overflow-hidden ${scrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-32 opacity-100 mt-1'}`}>
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                <span><span className="text-gray-500">Tel:</span> <span className="text-gray-700">0121 353 4695</span></span>
                <span className="text-gray-300">•</span>
                <span><span className="text-gray-500">Mob:</span> <span className="text-gray-700">07980 077250 (David)</span></span>
                <span className="text-gray-300">•</span>
                <span><span className="text-gray-500">DOB:</span> <span className="text-gray-700">22/07/1937</span></span>
                <span className="text-gray-300">•</span>
                <span><span className="text-gray-500">NHS:</span> <span className="text-gray-700">488 754 3816</span></span>
              </div>
              <div className="text-gray-700 text-[16px]">
                91 Westwood Road, Sutton Coldfield, B73 6UJ
              </div>
            </div>

            {/* Condensed single line — shown when scrolled */}
            <div className={`transition-all duration-300 overflow-hidden ${scrolled ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}>
              <p className="text-sm text-gray-600 truncate">
                0121 353 4695 &nbsp;·&nbsp; 07980 077250 (David) &nbsp;·&nbsp; DOB: 22/07/1937 &nbsp;·&nbsp; 91 Westwood Road, Sutton Coldfield, B73 6UJ
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200 -mx-4 px-4">
          <nav className="flex gap-1 overflow-x-auto">
            <a href="#" className={inactiveTabClass}>Dashboard</a>
            <Link to="/customers/caremanagement" className={tabClass('/customers/caremanagement')}>Care Management</Link>
            <Link to="/customers/carenotes" className={tabClass('/customers/carenotes')}>Care Notes</Link>
            <Link to="/customers/marchart" className={tabClass('/customers/marchart')}>MAR Chart</Link>
            <a href="#" className={inactiveTabClass}>Timeline</a>
            <Link to="/customers/documents" className={tabClass('/customers/documents')}>Documents</Link>
            <a href="#" className={inactiveTabClass}>About Me</a>
            <Link to="/customers/details" className={tabClass('/customers/details')}>Details</Link>
            <a href="#" className={inactiveTabClass}>Checklists</a>
            <Link to="/customers" className={pathname === '/customers' || pathname === '/' ? activeTabClass : inactiveTabClass}>Rostering</Link>
            <a href="#" className={inactiveTabClass}>Communications</a>
            <a href="#" className={inactiveTabClass}>Medical History</a>
            <a href="#" className={inactiveTabClass}>Customer File</a>
          </nav>
        </div>
      </div>
    </div>
  );
}
