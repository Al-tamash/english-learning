import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './app/Layout';
import { SessionScreen } from './screens/SessionScreen';

function Page({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Page title="Aaj" />} />
        <Route path="session" element={<SessionScreen />} />
        <Route path="progress" element={<Page title="Progress" />} />
        <Route path="library" element={<Page title="Library" />} />
        <Route path="settings" element={<Page title="Settings" />} />
      </Route>
    </Routes>
  );
}
