import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header>
        <h1>RFP-Pulse</h1>
        <nav>
          <ul className="flex gap-4">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/novo">Novo edital</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
