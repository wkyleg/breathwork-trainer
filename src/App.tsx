import { BrowserRouter, Route, Routes } from 'react-router';
import { NeuroProvider } from './neuro/NeuroProvider';
import { CalibratePage } from './pages/CalibratePage';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { SettingsPage } from './pages/SettingsPage';
import { SummaryPage } from './pages/SummaryPage';

export function App() {
  return (
    <NeuroProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calibrate" element={<CalibratePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </NeuroProvider>
  );
}
