import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const id = window.setInterval(() => api.scrollNext(), 5000);
    return () => window.clearInterval(id);
  }, [api]);

  return (
    <div className="invitation-gallery mx-auto max-w-2xl">
      <GalleryDivider />

      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "center" }}
        className="mt-8 w-full"
      >
        <CarouselContent className="-ml-0">
          {GALLERY_SLIDES.map((slide) => (
            <CarouselItem key={slide.src} className="pl-0">
              <div className="invitation-gallery-slide overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(155,77,92,0.12)]">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-5 flex items-center justify-center gap-2">
        {GALLERY_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => api?.scrollTo(index)}
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
