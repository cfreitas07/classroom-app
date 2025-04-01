import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to Classroom App</h1>
      <div className="space-y-8">
        <Link 
          to="/instructor" 
          className="block w-64 px-6 py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          I'm an Instructor
        </Link>
        <Link 
          to="/student" 
          className="block w-64 px-6 py-3 text-center text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          I'm a Student
        </Link>
      </div>
    </div>
  );
}

export default Home;
  