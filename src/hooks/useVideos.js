import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { placeholderVideos } from "../data/placeholderVideos";

export function useVideos() {
  const [videos, setVideos] = useState(placeholderVideos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        console.log("Attempting to fetch from Firestore...");
        const snap = await getDocs(collection(db, "videos"));
        
        console.log("Firestore snapshot empty?", snap.empty);
        
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          console.log("Live videos found:", docs);
          setVideos(docs);
        } else {
          console.warn("Firestore 'videos' collection is empty.");
        }
      } catch (err) {
        console.error("CRITICAL ERROR fetching from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return { videos, loading };
}