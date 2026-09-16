import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import VideoReel from "../components/VideoReel";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
      <Hero />
      <VideoReel />
      </main>
      <Footer />
    </>
  );
}
