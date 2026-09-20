import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';

export function GroupLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
      }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
