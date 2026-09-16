import { Routes, Route } from "react-router-dom";
import { ManualProvider } from "./components/ManualGuide";
import Home from "./pages/Home";
import VideoPage from "./pages/VideoPage";

export default function App() {
  return (
    <ManualProvider>
    <Routes>
      <Route path="/gabay" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/video/:id" element={<VideoPage />} />
    </Routes>
    </ManualProvider>
  );
}
