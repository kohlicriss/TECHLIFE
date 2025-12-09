import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyDetails from './pages/MyDetails';
import AllEmployees from './pages/AllEmployees';
import Shift from './pages/Shift';
// ...existing code...
<Router>
  <Routes>
    <Route path="/my-details" element={<MyDetails />} />
    <Route path="/employees" element={<AllEmployees />} />
    <Route path="/shift" element={<Shift />} />
  </Routes>
</Router>