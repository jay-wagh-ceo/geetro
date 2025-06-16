
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import MusicPlayer from "@/components/MusicPlayer";

type AudioStoryRow = Database["public"]["Tables"]["audio_stories"]["Row"];

export default function StoryPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<AudioStoryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("audio_stories")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setStory(data as AudioStoryRow);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-10 relative">
      {/* Back Button */}
      <div className="w-full flex items-center sticky z-30 top-0 bg-background py-4 px-4 border-b border-muted">
        <button
          className="hover-scale rounded-lg bg-card px-2 py-1 flex items-center gap-2"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft size={22} />
          <span className="font-semibold">Back</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {loading ? (
          <div className="mt-12 text-lg">Loading...</div>
        ) : !story ? (
          <div className="mt-12 text-lg text-muted-foreground">Story not found.</div>
        ) : (
          <div className="w-full flex justify-center py-8 px-2">
            <div className="w-full max-w-xs glass-card rounded-2xl shadow-2xl">
              <MusicPlayer
                audioUrl={story.audio_url || ""}
                coverUrl={story.cover_image_url || ""}
                title={story.title || ""}
                artist={story.uploaded_by || ""}
                variant="mobile-modal"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
