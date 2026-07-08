import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

/** Replace with your own images in `public/gallery/` when ready */
const GALLERY_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    alt: "Wedding floral arch",
  },
  {
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    alt: "Wedding reception setup",
  },
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    alt: "Wedding celebration",
  },
] as const;

const AUTO_ADVANCE_MS = 5000;

function GalleryDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#9b4d5c] text-[#9b4d5c]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
    </div>
  );
}

export function InvitationGallery() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % GALLERY_SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="invitation-gallery mx-auto max-w-2xl">
      <GalleryDivider />

      <div
        className="invitation-gallery-fade relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(155,77,92,0.12)]"
        aria-live="polite"
        aria-roledescription="carousel"
      >
        {GALLERY_SLIDES.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? "eager" : "lazy"}
            draggable={false}
            aria-hidden={index !== current}
            className={cn(
              "invitation-gallery-fade-image absolute inset-0 h-full w-full object-cover",
              index === current ? "invitation-gallery-fade-image--active" : "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {GALLERY_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setCurrent(index)}
            className={
              index === current
                ? "invitation-gallery-dot invitation-gallery-dot--active"
                : "invitation-gallery-dot"
            }
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
