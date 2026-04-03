import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e1a16',
            color: '#faf7f4',
            borderRadius: '1rem',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#1c7327', secondary: '#faf7f4' } },
          error: { iconTheme: { primary: '#cc5b0a', secondary: '#faf7f4' } },
        }}
      />
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
