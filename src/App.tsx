import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './i18n/LangContext';
import { FarmsProvider } from './farms/FarmsContext';
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
import MyFarmsPage from './pages/MyFarms';
import NewFarmPage from './pages/NewFarm';
import FarmDetailPage from './pages/FarmDetail';
import EditFarmPage from './pages/EditFarm';
import EditBoundaryPage from './pages/EditBoundary';

export default function App() {
  return (
    <LangProvider>
      <FarmsProvider>
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
              {/* My Farms */}
              <Route path="my-farms" element={<MyFarmsPage />} />
              <Route path="my-farms/new" element={<NewFarmPage />} />
              <Route path="my-farms/:id" element={<FarmDetailPage />} />
              <Route path="my-farms/:id/edit" element={<EditFarmPage />} />
              <Route path="my-farms/:id/edit-boundary" element={<EditBoundaryPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FarmsProvider>
    </LangProvider>
  );
}
