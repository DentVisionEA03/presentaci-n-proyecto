import TopBar from "./components/Topbar";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Slider from "./components/Slider";
import WhyChoose from "./components/WhyChoose";
import InfoCards from "./components/InfoCards";
import Valoracion from "./components/Valoracion";
import Tratamientos from "./components/Tratamientos";
import Testimonials from "./components/Testimonials";
import BlogCards from "./components/BlogCards";
import Footer from "./components/Footer";
import FranjaBlanca from "./components/FranjaBlanca";
//css
import "./styles/styles.css";
import "./styles/TopBar.css";
import "./styles/slider.css";
import "./styles/infoCards.css";
import "./styles/valoracion.css";

function App() {
  return (
    <>
      <div className="layout">
        <TopBar />

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

export default App;
