import React from 'react';


import { Routes, Route } from "react-router-dom";
import ProjectDashboard from './ProjectDashBoard';
import ProjectDetails from './ProjectDetails';

function App() {
  return (
    <Routes>
      <Route path="/project-details/:project_id" element={<ProjectDetails />} />
      <Route path="/" element={<ProjectDashboard />} />
    </Routes>
  );
}

export default App;
  