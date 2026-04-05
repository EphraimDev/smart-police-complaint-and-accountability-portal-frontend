import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export interface SidebarItem {
  to: string;
  label: string;
  end?: boolean;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
}

/** NPF-styled fixed sidebar for the dashboard shell. */
export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-r border-primary-900 bg-primary-800 text-primary-100">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-primary-700/50 px-5 py-4">
        <Logo size="sm" showText={false} />
        <div className="leading-tight">
          <span className="block text-sm font-bold text-white">SPCAP</span>
          <span className="block text-[10px] font-medium text-accent-400">
            Nigeria Police Force
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
        aria-label="Dashboard"
      >
        {items.map(({ to, label, end, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-500/20 text-accent-300'
                  : 'text-primary-200 hover:bg-primary-700 hover:text-white'
              }`
            }
          >
            {icon && <span className="h-5 w-5 shrink-0">{icon}</span>}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer accent stripe */}
      <div className="h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
    </aside>
  );
}
