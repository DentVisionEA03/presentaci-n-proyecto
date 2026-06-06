import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css'
import AdminDashboard from "./components/AdminDashboard";
import DentistDashboard from "./components/DentistDashboard";
import SecretaryDashboard from "./components/SecretaryDashboard";
import AppointmentPage from "./components/AppointmentPage";
import ContactPage from "./components/ContactPage";
import Home from "./components/Home";
import LaboratoryPage from "./components/LaboratoryPage";
import ProfilePage from "./components/ProfilePage";
import TopBar from "./components/Topbar";
import Navbar from "./components/Navbar";
import Slider from "./components/Slider";
import WhyChoose from "./components/WhyChoose";
import InfoCards from "./components/InfoCards";
import Valoracion from "./components/Valoracion";
import Tratamientos from "./components/Tratamientos";
import Testimonials from "./components/Testimonials";
import BlogCards from "./components/BlogCards";
import Footer from "./components/Footer";
import FranjaBlanca from "./components/FranjaBlanca";
import Login from "./components/Login_inicio_sesion";
import ServicesPage from "./components/ServicesPage";
import RegisterPage from "./components/RegisterPage";
import SpecialistsPage from "./components/SpecialistsPage";
import ChatBot from "./components/ChatBot";
//css
import "./styles/styles.css";
import "./styles/TopBar.css";
import "./styles/slider.css";
import "./styles/infoCards.css";
import "./styles/valoracion.css";
import "./styles/authApp.css";
import "./styles/chatbot.css";
import "./styles/secretary.css";

function LandingPage({ onLoginClick }) {
  return (
    <>
      <div className="layout">
        <TopBar onLoginClick={onLoginClick} />

        <Navbar />
        <FranjaBlanca />
      </div>
      <Slider />
      <WhyChoose />
      <InfoCards />
      <Valoracion />
      <Tratamientos />
      <Testimonials />
      <BlogCards />
      <Footer />
      {/*<main>
      </main>
      <Header />
       <Banner />*/}
    </>
  );
}

function AuthenticatedRoutes({  user }) {
  const isAdmin = user?.role === "admin";
  const isDentist = user?.role === "dentist";
  const isSecretary = user?.role === "secretary";
  const isNormalUser = !isAdmin && !isDentist && !isSecretary;

  // Admin routes
  if (isAdmin) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/laboratorio" element={<LaboratoryPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    );
  }

  // Dentist routes
  if (isDentist) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/agenda" replace />} />
          <Route path="/agenda" element={<DentistDashboard />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/agenda" replace />} />
        </Routes>
      </div>
    );
  }

  // Secretary routes
  if (isSecretary) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/facturacion" replace />} />
          <Route path="/facturacion" element={<SecretaryDashboard />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/facturacion" replace />} />
        </Routes>
      </div>
    );
  }

  // Normal user routes
  if (isNormalUser) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/especialistas" element={<SpecialistsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/citas" element={<AppointmentPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    );
  }

  return <Navigate to="/" replace />;
}

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, login, user } = useAuth();

  if (isAuthenticated) {
    return (
      <>
        <AuthenticatedRoutes isAuthenticated={isAuthenticated} user={user} />
        <ChatBot />
      </>
    );
  }

  if (showLogin) {
    return (
      <>
        <Login onLogin={login} onBack={() => setShowLogin(false)} />
        <ChatBot />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onLoginClick={() => setShowLogin(true)} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login onLogin={login} onBack={() => window.history.back()} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </>
  );
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

export default App;
