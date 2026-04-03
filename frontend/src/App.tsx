import { Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';
import Dashboard from './pages/Dashboard';
import ShareEvent from './pages/ShareEvent';
import HelpChat from './pages/HelpChat';
import OnboardingWizard from './pages/OnboardingWizard';
import ErrorBoundary from './components/ErrorBoundary';

const onboardingDone = () => localStorage.getItem('asadete_onboarding_done') === '1';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={onboardingDone() ? <CreateEvent /> : <OnboardingWizard />} />
        <Route path="/e/:shareToken/share" element={<ShareEvent />} />
        <Route path="/e/:shareToken/join" element={<JoinEvent />} />
        <Route path="/ayuda" element={<HelpChat />} />
        <Route path="/e/:shareToken/ayuda" element={<HelpChat />} />
        <Route path="/e/:shareToken" element={<Dashboard />} />
      </Routes>
    </ErrorBoundary>
  );
}
