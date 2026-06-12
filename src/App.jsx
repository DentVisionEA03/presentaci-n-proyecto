import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminDashboard from "./components/AdminDashboard";
import DentistDashboard from "./components/DentistDashboard";
import SecretaryDashboard from "./components/SecretaryDashboard";
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
import AppLayout from "./components/AppLayout";

//css
import "./styles/styles.css";
import "./styles/TopBar.css";
import "./styles/slider.css";
import "./styles/infoCards.css";
import "./styles/valoracion.css";
import "./styles/authApp.css";
import "./styles/chatbot.css";
import "./styles/secretary.css";
import AppointmentForm from "./components/AppointmentForm.jsx";

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
        </>
    );
}


function AppointmentPage() {
    const { user } = useAuth();
    return (
        <AppLayout>
            <AppointmentForm userId={user?.id} />
        </AppLayout>
    );
}

/**
 * AuthenticatedRoutes — usa `key={user?.role}` para forzar re-mount
 * completo del árbol de rutas cuando el rol del usuario cambia.
 * Esto garantiza que cada dashboard se renderice limpio al cambiar de rol.
 */
function AuthenticatedRoutes({ user }) {
    const role = user?.role;

    if (role === "admin") {
        return (
            <div className="app-shell" key="admin">
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

    if (role === "dentist") {
        return (
            <div className="app-shell" key="dentist">
                <Routes>
                    <Route path="/" element={<Navigate to="/agenda" replace />} />
                    <Route path="/agenda" element={<DentistDashboard />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/agenda" replace />} />
                </Routes>
            </div>
        );
    }

    if (role === "secretary") {
        return (
            <div className="app-shell" key="secretary">
                <Routes>
                    <Route path="/" element={<Navigate to="/facturacion" replace />} />
                    <Route path="/facturacion" element={<SecretaryDashboard />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/facturacion" replace />} />
                </Routes>
            </div>
        );
    }

    // Paciente / usuario normal
    return (
        <div className="app-shell" key="patient">
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

function AppContent() {
    const [showLogin, setShowLogin] = useState(false);
    const { isAuthenticated, login, user } = useAuth();

    if (isAuthenticated) {
        return (
            <>
                {/* key={user?.role} forces full re-render when role changes */}
                <AuthenticatedRoutes key={user?.role} user={user} />
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
                <Route
                    path="/login"
                    element={<Login onLogin={login} onBack={() => window.history.back()} />}
                />
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