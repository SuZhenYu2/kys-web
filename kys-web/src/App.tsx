import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GamePage } from '@/pages/GamePage';
import { ResourcePage } from '@/pages/ResourcePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/resources" element={<ResourcePage />} />
      </Routes>
    </Router>
  );
}