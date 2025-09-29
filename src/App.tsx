
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Particles from './components/ui/Particles';
import SplashCursor from './components/ui/SplashCursor';
import CustomCursor from './components/ui/CustomCursor';
import { AuthProvider, ProtectedRoute } from './context/AuthProvider';
import LoginPage from './pages/private/LoginPage';
import AdminPage from './pages/private/AdminPage';
import AdminDashboardPage from './pages/private/AdminDashboardPage';
import ProjectsAdminPage from './pages/private/ProjectsAdminPage';
import SiteImagesPage from './pages/private/SiteImagesPage';
import ServicesAdminPage from './pages/private/ServicesAdminPage';

const AppContent = () => {
  const location = useLocation();
  const isPublicRoute = !location.pathname.startsWith('/private/');

  return (
    <div className="bg-black text-gray-100">
      {isPublicRoute && (
        <>
          <Particles 
            className="fixed top-0 left-0 w-full h-full z-0"
            particleCount={1000}
            particleSpread={20}
            speed={0.05}
            particleColors={['#ffffff', '#f0f0f0', '#e0e0e0']}
            moveParticlesOnHover={true}
            particleHoverFactor={0.5}
            alphaParticles={true}
            particleBaseSize={80}
            sizeRandomness={0.9}
            cameraDistance={25}
          />
          <SplashCursor />
          <CustomCursor />
        </>
      )}

      <div className={isPublicRoute ? "relative z-10" : ""}>
        {isPublicRoute && <Header />}
        <main>
          <Routes>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/work/:projectSlug" element={<ProjectDetailPage />} />
            <Route path="/private/login" element={<LoginPage />} />
            <Route 
              path="/private/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="projects" element={<ProjectsAdminPage />} />
              <Route path="services" element={<ServicesAdminPage />} />
              <Route path="images" element={<SiteImagesPage />} />
            </Route>
          </Routes>
        </main>
        {isPublicRoute && <Footer />}
      </div>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;