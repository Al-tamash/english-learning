import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { requestPersistence } from '../storage/persistence';
import { SaveIndicator } from './SaveIndicator';

const links = [
  { to: '/', label: 'Aaj', end: true },
  { to: '/progress', label: 'Progress', end: false },
  { to: '/library', label: 'Library', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export function Layout() {
  useEffect(() => {
    void requestPersistence();
  }, []);

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-accent">Bol</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">Roz bolne ki practice</span>
            <SaveIndicator />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row">
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-surface md:static md:z-auto md:w-44 md:shrink-0 md:grid-cols-1 md:content-start md:gap-1 md:border-t-0 md:bg-transparent"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-3 text-xs font-medium transition md:flex-row md:justify-start md:rounded-xl md:px-3 md:py-2 md:text-sm ${
                  isActive
                    ? 'text-accent md:bg-accent md:text-accent-ink'
                    : 'text-muted md:hover:bg-surface md:hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
