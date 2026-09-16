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

        const snap = await getDocs(collection(db, "videos"));



        if (!snap.empty) {
          const docs = snap.docs.map((d) => {
            const data = d.data();
            const description = (data.description || "").replace(
              "Ang matalinong pacing nito ay nagbibigay-daan para sa matingkad na mga detalye, na ginagawa kaming lumilipad sa dingding ng kuwento ng pamilya ng mga paghihirap sa bukid.",
              "Maingat ang takbo ng kuwento at malinaw ang mga detalye, kaya nasusubaybayan ang pamilya at ang kanilang mga paghihirap sa bukid.",
            );
            return { ...data, id: d.id, description };
          });

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
