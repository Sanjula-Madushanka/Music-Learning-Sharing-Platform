import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MusicFeed from './components/MusicFeed';
import MusicDetail from './components/MusicDetail';
import UploadMusic from './components/UploadMusic';
import Navbar from './components/Navbar';
import Favorites from './components/favorites';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<MusicFeed />} />
          <Route path="/music/:id" element={<MusicDetail />} />
          <Route path="/upload" element={<UploadMusic />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;