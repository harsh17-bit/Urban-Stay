import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/authcontext.jsx'
import { AnimatePresence } from 'framer-motion'

// Layout Components
import Header from './components/Header'
import Footer from './components/footer'
import CookieConsentBanner from './components/cookieconsentbanner'

// Home Page Sections
import Hero from './components/hero.jsx'
import ExploreOptions from './components/ExploreOptions'
import TopCities from './components/TopCities'
import FeaturedProjects from './components/FeaturedProjects'
import CommercialSection from './components/CommercialSection'
import PopularTools from './components/PopularTools'
import BenefitsSection from './components/BenefitsSection'
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
import TermsOfService from "./pages/termsofservice.jsx"
import PrivacyPolicy from "./pages/privacypolicy.jsx"
import FAQ from "./pages/faq.jsx"
import Projects from "./pages/projects.jsx"


// Home Page Component with all sections
const HomePage = () => {
  return (
    <>
      <Hero />
      <ExploreOptions />
      <TopCities />
      <FeaturedProjects />
      <CommercialSection />
      <PopularTools />
      <BenefitsSection />
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
    const interval = setInterval(async()=>{
      try{
        const res=await fetch("/api/health");
        if(!res.ok){
          throw new Error("Server Down");
        }
      }
      catch
      {
        localStorage.removeItem("token");
        window.location.href="/login";
      }
    },60000);
    return () => clearInterval(interval);
  },[]);

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

          {/* Protected Routes */}
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
      
      {/* Floating Action Button (Step 8) */}
      <a 
        href="/post-property"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[var(--emerald)] to-[var(--pacific-cyan)] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
        title="Post Property"
      >
        <span className="text-2xl">+</span>
      </a>
      
      <Footer />
      <CookieConsentBanner />
      </div>
  </>
)
}

function App() {
  console.log('App component rendering');
  return (
    <BrowserRouter>
      <AuthProvider>  
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
