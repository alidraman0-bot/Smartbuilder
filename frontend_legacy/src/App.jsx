import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import IdeaGenerator from './pages/IdeaGenerator';
import PlaceholderPage from './pages/Placeholder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="ideas" element={<IdeaGenerator />} />
          <Route path="research" element={<PlaceholderPage title="Research Market" />} />
          <Route path="plan" element={<PlaceholderPage title="Business Plan & PRD" />} />
          <Route path="build" element={<PlaceholderPage title="MVP Builder" />} />
          <Route path="deploy" element={<PlaceholderPage title="Deployment" />} />
          <Route path="monitor" element={<PlaceholderPage title="System Monitoring" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
