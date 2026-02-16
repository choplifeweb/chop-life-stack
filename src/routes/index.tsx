import { createFileRoute } from "@tanstack/react-router";

import { CursorProvider } from "@/components/Animations";
import { PublicLayout } from "@/components/Common/PublicLayout";
import { VideoHero } from "@/components/Common/VideoHero";

export const Route = createFileRoute("/")({
  component: Homepage,
  head: () => ({
    meta: [
      {
        title: "Home - Chop Life",
      },
    ],
  }),
});

function Homepage() {
  return (
    <CursorProvider>
      <PublicLayout>
        <VideoHero
          videoSrc="/assets/videos/chop_life.mp4"
          posterSrc="/assets/videos/party.mp4"
          titleLines={[
            "The CHOP LIFE Experience",
            "is a family reunion and",
            "cultural oasis disguised",
            "as a party.",
          ]}
          ctaText="Enter experience"
          ctaLink="/experience-gallery"
          leftLabel="UPLIFT"
          rightLabel="/UNIFY"
          videoDuration="1:25"
        />
      </PublicLayout>
    </CursorProvider>
  );
}
