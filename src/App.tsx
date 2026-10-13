import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './i18n/LangContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RiskMap from './pages/RiskMap';
import Climate from './pages/Climate';
import CropPlanner from './pages/CropPlanner';
import FarmPlanner from './pages/FarmPlanner';
import Advisory from './pages/Advisory';
import Notifications from './pages/Notifications';
import Extension from './pages/Extension';
import Methodology from './pages/Methodology';
import About from './pages/About';

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="risk-map" element={<RiskMap />} />
            <Route path="climate" element={<Climate />} />
            <Route path="crop-planner" element={<CropPlanner />} />
            <Route path="farm-planner" element={<FarmPlanner />} />
            <Route path="advisory" element={<Advisory />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="extension" element={<Extension />} />
            <Route path="methodology" element={<Methodology />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}
