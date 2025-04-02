import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Instructor from './pages/Instructor';
import Student from './pages/Student';
import VersionHistory from './pages/VersionHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/student" element={<Student />} />
        <Route path="/version-history" element={<VersionHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
