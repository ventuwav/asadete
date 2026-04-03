import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';
import Dashboard from './pages/Dashboard';
import ShareEvent from './pages/ShareEvent';
import HelpChat from './pages/HelpChat';
import OnboardingWizard from './pages/OnboardingWizard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem('asadete_onboarding_done') === '1'
  );

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={onboardingDone ? <CreateEvent /> : <OnboardingWizard onComplete={() => setOnboardingDone(true)} />} />
        <Route path="/e/:shareToken/share" element={<ShareEvent />} />
        <Route path="/e/:shareToken/join" element={<JoinEvent />} />
        <Route path="/ayuda" element={<HelpChat />} />
        <Route path="/e/:shareToken/ayuda" element={<HelpChat />} />
        <Route path="/e/:shareToken" element={<Dashboard />} />
      </Routes>
    </ErrorBoundary>
  );
}
