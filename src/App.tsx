import { Route, Routes } from 'react-router-dom';
import { Layout } from './app/Layout';
import { SessionScreen } from './screens/SessionScreen';
import { TodayScreen } from './screens/TodayScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TodayScreen />} />
        <Route path="session" element={<SessionScreen />} />
        <Route path="progress" element={<ProgressScreen />} />
        <Route path="library" element={<LibraryScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
    </Routes>
  );
}
