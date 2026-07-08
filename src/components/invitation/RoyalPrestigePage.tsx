import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Heart, Volume2, VolumeX } from "lucide-react";

type Phase = "sealed" | "opening" | "overlay" | "revealed";

/** Overlay starts when curtain scene begins (~72% of video) */
function getVideoTiming(duration: number) {
  return { overlayAt: duration * 0.72 };
}

const OVERLAY_TO_CONTENT_MS = 900;

const COUPLE = {
  groom: {
    name: "Veer",
    parents: "Son of Mr. & Mrs. Khan",
    education: "M.Tech, Phd",
    profession: "Software Engineer",
  },
  bride: {
    name: "Zara",
    parents: "Daughter of Mr. & Mrs. Pathan",
    education: "B.Tech, MBA",
    profession: "Advocate, High Court",
  },
};

const EVENT = {
  date: "June 15, 2026",
  day: "Monday",
  time: "5:00 PM",
  venue: "The Grand Palace",
  address: "123 Royal Avenue, London",
};

const TIMELINE = [
  { title: "Guest Arrival", time: "Jun 15, 2026, 4:00 PM" },
  { title: "Wedding Ceremony", time: "Jun 15, 2026, 5:00 PM" },
  { title: "Cocktail Hour", time: "Jun 15, 2026, 6:30 PM" },
  { title: "Dinner Reception", time: "Jun 15, 2026, 7:00 PM" },
  { title: "Dance & Celebration", time: "Jun 15, 2026, 9:00 PM" },
];

const COPY = {
  en: {
    welcome: "We are honored to welcome you to\nthe Wedding ceremony of..",
    scroll: "Scroll",
    intro:
      "With hearts full of love and joy, we warmly invite you to share in the celebration of our union. Your presence would mean the world to us.",
    countdown: "Counting Down to Forever",
    program: "Program Timeline",
    venue: "Venue",
    viewMap: "View on Google Maps",
    dressCode: "Dress Code",
    womenDress: "Elegant formal attire in pastel or jewel tones",
    menDress: "Suit or traditional formal wear",
    women: "Women",
    men: "Men",
    gifts: "Your love, blessings, and presence are the greatest gifts we could ever ask for.",
    footer: "We can't wait to celebrate with you!",
  },
  ur: {
    welcome: "ہم آپ کو اپنی شادی کی تقریب میں خوش آمدید کہتے ہوئے اعزاز محسوس کرتے ہیں..",
    scroll: "نیچے دیکھیں",
    intro:
      "محبت اور خوشی سے بھرے دل کے ساتھ، ہم آپ کو اپنی شادی کی خوشی میں شامل ہونے کی دعوت دیتے ہیں۔ آپ کی موجودگی ہمارے لیے سب سے بڑی خوشی ہوگی۔",
    countdown: "ہمیشہ کے لیے الٹی گنتی",
    program: "تقریب کا شیڈول",
    venue: "مقام",
    viewMap: "گوگل میپ پر دیکھیں",
    dressCode: "لباس کا کوڈ",
    womenDress: "پیسٹل یا جیول ٹونز میں خوبصورت رسمی لباس",
    menDress: "سوٹ یا روایتی رسمی لباس",
    women: "خواتین",
    men: "مرد",
    gifts: "آپ کی محبت، دعائیں اور موجودگی ہمارے لیے سب سے بڑا تحفہ ہے۔",
    footer: "ہم آپ کے ساتھ جشن منانے کا بے صبری سے انتظار کر رہے ہیں!",
  },
};

function useCountdown(target: Date) {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setParts({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return parts;
}

export function RoyalPrestigePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const phaseRef = useRef<Phase>("sealed");
  const timingRef = useRef({ overlayAt: 4.5 });
  const [phase, setPhase] = useState<Phase>("sealed");
  const [muted, setMuted] = useState(true);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const t = COPY[lang];
  const countdown = useCountdown(new Date("2026-06-15T17:00:00"));

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const openEnvelope = useCallback(() => {
    if (phaseRef.current !== "sealed") return;
    const video = videoRef.current;
    if (!video) return;
    setPhaseSafe("opening");
    void video.play();
  }, [setPhaseSafe]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    timingRef.current = getVideoTiming(video.duration);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || phaseRef.current !== "opening") return;
    if (video.currentTime >= timingRef.current.overlayAt) {
      setPhaseSafe("overlay");
    }
  }, [setPhaseSafe]);

  const handleVideoEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (phaseRef.current === "opening") setPhaseSafe("overlay");
    else if (phaseRef.current !== "revealed") setPhaseSafe("revealed");
    video.pause();
  }, [setPhaseSafe]);

  useEffect(() => {
    if (phase !== "overlay") return;
    const id = window.setTimeout(() => setPhaseSafe("revealed"), OVERLAY_TO_CONTENT_MS);
    return () => window.clearTimeout(id);
  }, [phase, setPhaseSafe]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.pause();
  }, []);

  return (
    <div data-invitation-page className="invitation-page min-h-screen bg-[#f8f4f1] text-[#3d2f2a]">
      <section className="relative h-dvh w-full overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src="/royal-prestige.mp4"
          muted={muted}
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />

        {phase === "sealed" && (
          <button
            type="button"
            onClick={openEnvelope}
            className="absolute inset-0 z-20 cursor-pointer bg-transparent"
            aria-label="Tap to open"
          />
        )}

        <div
          className={`invitation-hero-overlay invitation-hero-overlay-enter pointer-events-none absolute inset-0 z-10 ${
            phase === "overlay" || phase === "revealed" ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="absolute right-4 top-4 z-30 flex gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setLang((l) => (l === "en" ? "ur" : "en"))}
          className="absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#5c4a42] shadow-md backdrop-blur-sm transition hover:bg-white"
        >
          <Globe className="h-4 w-4" />
          {lang === "en" ? "Urdu" : "English"}
        </button>

        {phase === "revealed" && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
            <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center">
              <div className="invitation-hero-rise-item invitation-hero-rise-delay-1 mb-3">
                <Heart
                  className="mx-auto fill-[#f5e6e0] text-[#f5e6e0]"
                  size={26}
                  strokeWidth={0}
                />
              </div>

              <p
                data-invitation-message
                className="invitation-hero-rise-item invitation-hero-rise-delay-2 invitation-hero-cream invitation-hero-welcome-shadow mb-3 whitespace-pre-line font-dancing text-2xl md:text-4xl"
              >
                {t.welcome}
              </p>

              <div className="invitation-hero-rise-item invitation-hero-rise-delay-3 my-3 flex items-center justify-center gap-3">
                <div className="h-px w-16 bg-[rgba(245,230,224,0.45)]" />
                <Heart className="h-2.5 w-2.5 fill-[#f5e6e0] text-[#f5e6e0]" strokeWidth={0} />
                <div className="h-px w-16 bg-[rgba(245,230,224,0.45)]" />
              </div>

              <h1 className="invitation-hero-rise-item invitation-hero-rise-delay-4 invitation-hero-cream invitation-hero-name-shadow font-dancing text-6xl leading-none md:text-9xl">
                {COUPLE.groom.name}
                <p
                  data-couple-subtext="groom"
                  className="mx-auto mt-1 mb-3 max-w-md px-4 text-center text-sm italic leading-snug whitespace-pre-line drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] md:text-base"
                >
                  {COUPLE.groom.parents}
                  {"\n"}
                  {COUPLE.groom.education}
                  {"\n"}
                  {COUPLE.groom.profession}
                </p>
              </h1>

              <p
                data-couple-amp
                className="invitation-hero-rise-item invitation-hero-rise-delay-5 invitation-hero-amp my-2 font-dancing text-3xl md:text-4xl"
              >
                &
              </p>

              <h1 className="invitation-hero-rise-item invitation-hero-rise-delay-6 invitation-hero-cream invitation-hero-name-shadow font-dancing text-6xl leading-none md:text-9xl">
                {COUPLE.bride.name}
                <p
                  data-couple-subtext="bride"
                  className="mx-auto mt-1 mb-3 max-w-md px-4 text-center text-sm italic leading-snug whitespace-pre-line drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] md:text-base"
                >
                  {COUPLE.bride.parents}
                  {"\n"}
                  {COUPLE.bride.education}
                  {"\n"}
                  {COUPLE.bride.profession}
                </p>
              </h1>
            </div>

            <div className="invitation-hero-rise-item invitation-hero-rise-delay-7 absolute bottom-10 flex flex-col items-center gap-1.5">
              <span className="invitation-hero-scroll">{t.scroll}</span>
              <ChevronDown className="h-4 w-4 animate-bounce text-[#f5e6e0]/75" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </section>

      {phase === "revealed" && (
        <div className="relative z-10">
          <InvitationSection className="bg-[#faf7f4]">
            <p className="font-invitation-serif mx-auto max-w-2xl text-center text-lg italic leading-relaxed text-[#5c4a42] md:text-xl">
              {t.intro}
            </p>
          </InvitationSection>

          <InvitationSection className="bg-[#f3ebe4]">
            <h2 className="font-invitation-serif text-center text-3xl font-medium text-[#4a3a34] md:text-4xl">
              {t.countdown}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <CountdownUnit label="Days" value={countdown.days} />
              <CountdownUnit label="Hours" value={countdown.hours} />
              <CountdownUnit label="Minutes" value={countdown.minutes} />
              <CountdownUnit label="Seconds" value={countdown.seconds} />
            </div>
          </InvitationSection>

          <InvitationSection className="bg-[#faf7f4]">
            <h2 className="font-invitation-serif text-center text-3xl font-medium text-[#4a3a34] md:text-4xl">
              {t.program}
            </h2>
            <div className="mx-auto mt-10 max-w-xl space-y-4">
              {TIMELINE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#e8ddd4] bg-white/70 px-5 py-4 text-center shadow-sm"
                >
                  <div className="font-invitation-serif text-lg font-medium text-[#4a3a34]">{item.title}</div>
                  <div className="mt-1 text-sm text-[#7a655c]">{item.time}</div>
                </div>
              ))}
            </div>
          </InvitationSection>

          <InvitationSection className="bg-[#f3ebe4]">
            <h2 className="font-invitation-serif text-center text-3xl font-medium text-[#4a3a34] md:text-4xl">
              {t.venue}
            </h2>
            <div className="mt-8 text-center">
              <p className="font-invitation-script text-4xl text-[#8b6f5c] md:text-5xl">{EVENT.venue}</p>
              <p className="font-invitation-serif mt-3 text-[#5c4a42]">{EVENT.address}</p>
              <p className="font-invitation-serif mt-2 text-sm text-[#7a655c]">
                {EVENT.date} · {EVENT.day} · {EVENT.time}
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="font-invitation-serif mt-6 inline-block rounded-full border border-[#c9b5a8] bg-white/80 px-6 py-2.5 text-sm text-[#5c4a42] transition hover:bg-white"
              >
                {t.viewMap}
              </a>
            </div>
          </InvitationSection>

          <InvitationSection className="bg-[#faf7f4]">
            <h2 className="font-invitation-serif text-center text-3xl font-medium text-[#4a3a34] md:text-4xl">
              {t.dressCode}
            </h2>
            <div className="mx-auto mt-10 grid max-w-2xl gap-6 md:grid-cols-2">
              <DressCard title={t.women} description={t.womenDress} />
              <DressCard title={t.men} description={t.menDress} />
            </div>
          </InvitationSection>

          <InvitationSection className="bg-[#f3ebe4]">
            <p className="font-invitation-serif mx-auto max-w-xl text-center text-lg italic leading-relaxed text-[#5c4a42]">
              {t.gifts}
            </p>
          </InvitationSection>

          <ScrollRevealSection className="bg-[#ebe2da] px-6 py-14 text-center">
            <p className="font-invitation-script text-4xl text-[#8b6f5c] md:text-5xl">
              {COUPLE.groom.name} & {COUPLE.bride.name}
            </p>
            <p className="font-invitation-serif mt-4 text-[#5c4a42]">{t.footer}</p>
          </ScrollRevealSection>
        </div>
      )}
    </div>
  );
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function InvitationSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`invitation-scroll-reveal px-6 py-16 md:px-10 md:py-24 ${visible ? "invitation-scroll-reveal-visible" : ""} ${className}`}
    >
      <div className="mx-auto max-w-4xl">{children}</div>
    </section>
  );
}

function ScrollRevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`invitation-scroll-reveal ${visible ? "invitation-scroll-reveal-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e8ddd4] bg-white/80 px-4 py-6 text-center shadow-sm">
      <div className="font-invitation-script text-4xl text-[#8b6f5c] md:text-5xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="font-invitation-serif mt-2 text-xs uppercase tracking-widest text-[#7a655c]">
        {label}
      </div>
    </div>
  );
}

function DressCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#e8ddd4] bg-white/80 p-6 text-center shadow-sm">
      <h3 className="font-invitation-serif text-xl font-medium text-[#4a3a34]">{title}</h3>
      <p className="font-invitation-serif mt-3 text-sm leading-relaxed text-[#7a655c]">{description}</p>
    </div>
  );
}
