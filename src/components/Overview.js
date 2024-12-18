import React from 'react';

function Overview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <img
          src="https://via.placeholder.com/300"
          alt="Memorial"
          className="rounded-lg shadow-md"
        />
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">In Loving Memory</h2>
        <p className="text-gray-600">1950 - 2024</p>
        <p className="text-gray-700 max-w-2xl mx-auto">
          A beautiful soul who touched countless lives with kindness, wisdom, and love.
          Their legacy lives on in the hearts of all who knew them.
        </p>
      </div>
    </div>
  );
}

export default Overview; 