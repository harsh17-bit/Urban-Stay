import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/authcontext.jsx'
import { AnimatePresence } from 'framer-motion'
import { API_URL } from './services/api'


// Layout Components
import Header from './components/Header'
import Footer from './components/footer'
import CookieConsentBanner from './components/cookieconsentbanner'

// Home Page Sections
import Hero from './components/hero.jsx'
import ExploreOptions from './components/ExploreOptions'
import TopCities from './components/TopCities'
import FeaturedProjects from './components/FeaturedProjects'
import PopularTools from './components/PopularTools'
import TestimonialsSection from './components/TestimonialsSection'

// Pages
import PropertyDetails from "./pages/propertydetails.jsx"
import Login from "./pages/login.jsx"
import Register from "./pages/register.jsx";
import ForgotPassword from "./pages/forgotpassword.jsx";
import ResetPassword from "./pages/resetpassword.jsx";
import SearchResults from "./pages/searchresults.jsx"
import UserDashboard from "./pages/userdashboard.jsx"
import SellerDashboard from "./pages/sellerdashboard.jsx"
import AdminDashboard from "./pages/admindashboard.jsx"
import PostProperty from "./pages/postproperty.jsx"
import EditProperty from "./pages/postproperty.jsx"
import TermsOfService from "./pages/termsofservice.jsx"
import PrivacyPolicy from "./pages/privacypolicy.jsx"
import FAQ from "./pages/faq.jsx"
import Projects from "./pages/projects.jsx"
import InquiryDetails from "./pages/InquiryDetails.jsx"
import AboutUs from "./pages/AboutUs.jsx"
import EMICalculator from "./pages/EMICalculator.jsx"


// Home Page Component with all sections
const HomePage = () => {
  return (
    <>
      <Hero />
      <ExploreOptions />
      <TopCities />
      <PopularTools />
      <FeaturedProjects />
      <TestimonialsSection />
    </>
  )
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Dashboard Router - redirects to appropriate dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'seller':
      return <SellerDashboard />;
    default:
      return <UserDashboard />;
  }
};

function AppContent() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        if (!res.ok) {
          throw new Error("Server Down");
        }
      }
      catch {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>

      <div className='app relative min-h-screen'>
        <Header />
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/properties" element={<SearchResults />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/emi-calculator" element={<EMICalculator />} />

              {/* Protected Routes */}
              <Route
                path="/edit-property/:id"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <EditProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inquiry/:id"
                element={
                  <ProtectedRoute>
                    <InquiryDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-property"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <PostProperty />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  )
}

function App() {
  return (

    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>

  );
}

export default App
