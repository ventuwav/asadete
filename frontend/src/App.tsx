import { Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';
import Dashboard from './pages/Dashboard';
import ShareEvent from './pages/ShareEvent';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateEvent />} />
      <Route path="/e/:shareToken/share" element={<ShareEvent />} />
      <Route path="/e/:shareToken/join" element={<JoinEvent />} />
      <Route path="/e/:shareToken" element={<Dashboard />} />
    </Routes>
  );
}
