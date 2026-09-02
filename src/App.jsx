// src/App.jsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BrowsePage from './pages/BrowsePage';
import SohbetPage from './pages/SohbetPage';

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/sohbet/:slug" element={<SohbetPage />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
