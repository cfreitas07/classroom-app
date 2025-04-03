import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Instructor from './pages/Instructor';
import Student from './pages/Student';
import VersionHistory from './pages/VersionHistory';
import TermsOfUse from './pages/TermsOfUse';
import TestPage from './pages/TestPage';
import Test2Page from './pages/Test2Page';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/student" element={<Student />} />
        <Route path="/version-history" element={<VersionHistory />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test2" element={<Test2Page />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 