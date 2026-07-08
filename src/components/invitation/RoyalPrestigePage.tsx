import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Car, ChevronDown, Gift, Globe, Heart, Volume2, VolumeX } from "lucide-react";

import { ScratchToReveal } from "@/components/invitation/ScratchToReveal";
import { InvitationGallery } from "@/components/invitation/InvitationGallery";
import {
  getWeddingCountdownTarget,
  InvitationCountdown,
} from "@/components/invitation/InvitationCountdown";
import { InvitationClosing } from "@/components/invitation/InvitationClosing";
import { InvitationDetailSection } from "@/components/invitation/InvitationDetailSection";
import { InvitationDressCode } from "@/components/invitation/InvitationDressCode";
import { InvitationFooter } from "@/components/invitation/InvitationFooter";
import { InvitationMessageForm } from "@/components/invitation/InvitationMessageForm";
import { InvitationPreWeddingEvents } from "@/components/invitation/InvitationPreWeddingEvents";
import { InvitationProgramTimeline } from "@/components/invitation/InvitationProgramTimeline";

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
  date: "September 30, 2026",
  day: "Wednesday",
  time: "10:00 AM",
  venue: "The Grand Palace",
  address: "123 Royal Avenue, London",
};

const WEDDING_COUNTDOWN_TARGET = getWeddingCountdownTarget(EVENT.date, EVENT.time);

const TIMELINE = {
  en: [
    {
      title: "Guest Arrival",
      time: "September 30, 2026, 10:00 AM",
      description: "We Warmly welcome you.. !",
    },
    {
      title: "Wedding Ceremony",
      time: "September 30, 2026, 10:30 AM",
      description: "Your gracious presence is requested ❤️",
    },
    {
      title: "Reception",
      time: "October 2, 2026, 7:30 PM",
      description: "Your gracious presence is requested at the Reception at 7:30 PM onwards.",
    },
  ],
  ur: [
    {
      title: "مہمانوں کا استقبال",
      time: "30 ستمبر 2026، صبح 10:00 بجے",
      description: "ہم آپ کا گرم جوشی سے استقبال کرتے ہیں.. !",
    },
    {
      title: "شادی کی تقریب",
      time: "30 ستمبر 2026، صبح 10:30 بجے",
      description: "آپ کی باعزت موجودگی کی درخواست ہے ❤️",
    },
    {
      title: "استقبالیہ",
      time: "2 اکتوبر 2026، شام 7:30 بجے",
      description: "استقبالیہ میں شام 7:30 بجے سے آپ کی باعزت موجودگی کی درخواست ہے۔",
    },
  ],
};

const PRE_WEDDING_EVENTS = {
  en: [
    { title: "Mahendi", time: "Jun 27, 2026, 9:30 PM", location: "At Bride's House" },
    { title: "Haldi", time: "Jun 28, 2026, 8:30 PM", location: "At Groom's House" },
    { title: "Sangeet", time: "Jun 29, 2026, 9:00 PM", location: "At The Taj Mahal Palace" },
  ],
  ur: [
    { title: "مہندی", time: "27 جون 2026، رات 9:30 بجے", location: "دلہن کے گھر" },
    { title: "ہلدی", time: "28 جون 2026، رات 8:30 بجے", location: "دولہے کے گھر" },
    { title: "سنگیت", time: "29 جون 2026، رات 9:00 بجے", location: "تاج محل پیلس میں" },
  ],
};

const COPY = {
  en: {
    welcome: "We are honored to welcome you to\nthe Wedding ceremony of..",
    scroll: "Scroll",
    intro:
      "We are honored to welcome you to the Wedding ceremony of Veer & Zara. As they begin their journey together in faith and love, we thank you for being part of this blessed occasion.",
    countdown: "Counting Down to Forever",
    scratchTitle: "Scratch to Reveal",
    invited: "You're Invited!",
    program: "Program Timeline",
    venue: "Venue",
    viewMap: "View on Google Maps",
    dressCode: "Dress Code",
    preWeddingEvents: "Pre-Wedding Events",
    transportation: "Transportation",
    transportationDesc:
      "Shuttle service will be available from the city center to the venue. Pickup point: Central Station at 3:30 PM.",
    accommodation: "Accommodation",
    accommodationDesc:
      "Special rates at The Taj Mahal Palace (5 min from venue). Use code WEDDING2026 when booking.",
    womenDress: "Elegant formal attire in pastel or jewel tones",
    menDress: "Suit or traditional formal wear",
    women: "Women",
    men: "Men",
    gifts: "Gifts",
    giftsDesc: "Your love, blessings, and presence are the greatest gifts we could ever ask for.",
    sendMessage: "Send a Message",
    yourName: "Your Name",
    namePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    attending: "Will you be attending?",
    attendingPlaceholder: "Select...",
    attendingYes: "Yes, I'll be there",
    attendingNo: "Sorry, can't make it",
    attendingMaybe: "Not sure yet",
    message: "Your Message",
    messagePlaceholder: "Write your wishes...",
    send: "Send Message",
    sent: "Message Sent!",
    closing: "We can't wait to celebrate with you!",
    credits: "Created with Zareqia • Create your own wedding invitation",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  ur: {
    welcome: "ہم آپ کو اپنی شادی کی تقریب میں خوش آمدید کہتے ہوئے اعزاز محسوس کرتے ہیں..",
    scroll: "نیچے دیکھیں",
    intro:
      "ہم آپ کو ویر اور زارا کی شادی کی تقریب میں خوش آمدید کہتے ہوئے اعزاز محسوس کرتے ہیں۔ جیسے وہ ایمان اور محبت میں اپنا سفر ایک ساتھ شروع کرتے ہیں، اس مبارک موقع کا حصہ بننے کے لیے ہم آپ کے شکر گزار ہیں۔",
    countdown: "ہمیشہ کے لیے الٹی گنتی",
    scratchTitle: "کھرچ کر دیکھیں",
    invited: "آپ مدعو ہیں!",
    program: "تقریب کا شیڈول",
    venue: "مقام",
    viewMap: "گوگل میپ پر دیکھیں",
    dressCode: "لباس کا کوڈ",
    preWeddingEvents: "شادی سے پہلے کی تقریبات",
    transportation: "نقل و حمل",
    transportationDesc:
      "شہر کے مرکز سے مقام تک شٹل سروس دستیاب ہوگی۔ پک اپ پوائنٹ: سینٹرل اسٹیشن، شام 3:30 بجے۔",
    accommodation: "قیام",
    accommodationDesc:
      "تاج محل پیلس میں خصوصی نرخ (مقام سے 5 منٹ)۔ بکنگ کے وقت WEDDING2026 کوڈ استعمال کریں۔",
    womenDress: "پیسٹل یا جیول ٹونز میں خوبصورت رسمی لباس",
    menDress: "سوٹ یا روایتی رسمی لباس",
    women: "خواتین",
    men: "مرد",
    gifts: "تحائف",
    giftsDesc: "آپ کی محبت، دعائیں اور موجودگی ہمارے لیے سب سے بڑا تحفہ ہے۔",
    sendMessage: "پیغام بھیجیں",
    yourName: "آپ کا نام",
    namePlaceholder: "آپ کا پورا نام",
    email: "ای میل",
    emailPlaceholder: "you@example.com",
    attending: "کیا آپ شرکت کریں گے؟",
    attendingPlaceholder: "منتخب کریں...",
    attendingYes: "جی ہاں، میں آؤں گا/گی",
    attendingNo: "معذرت، نہیں آ سکتا/سکتی",
    attendingMaybe: "ابھی یقین نہیں",
    message: "آپ کا پیغام",
    messagePlaceholder: "اپنی دعائیں لکھیں...",
    send: "پیغام بھیجیں",
    sent: "پیغام بھیج دیا گیا!",
    closing: "ہم آپ کے ساتھ جشن منانے کا بے صبری سے انتظار کر رہے ہیں!",
    credits: "Zareqia کے ساتھ بنایا گیا • اپنی شادی کی دعوت نامہ بنائیں",
    days: "دن",
    hours: "گھنٹے",
    minutes: "منٹ",
    seconds: "سیکنڈ",
  },
};

export function RoyalPrestigePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const phaseRef = useRef<Phase>("sealed");
  const timingRef = useRef({ overlayAt: 4.5 });
  const [phase, setPhase] = useState<Phase>("sealed");
  const [muted, setMuted] = useState(true);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const t = COPY[lang];

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
          <InvitationSection className="invitation-welcome-section !px-6 !py-20 md:!py-28">
            <WelcomeDivider />
            <p className="font-invitation-serif mx-auto mt-8 max-w-2xl text-center text-base italic leading-relaxed text-white/95 md:text-lg">
              {lang === "en"
                ? `We are honored to welcome you to the Wedding ceremony of ${COUPLE.groom.name} & ${COUPLE.bride.name}. As they begin their journey together in faith and love, we thank you for being part of this blessed occasion.`
                : t.intro}{" "}
              <Heart className="mb-0.5 inline h-3.5 w-3.5 fill-[#f5b8c4] text-[#f5b8c4]" strokeWidth={0} />
            </p>
            <div className="mt-8">
              <WelcomeDivider />
            </div>
          </InvitationSection>

          <InvitationSection className="bg-[#fdeef4]">
            <ScratchToReveal
              title={t.scratchTitle}
              invited={t.invited}
              date={EVENT.date}
              day={EVENT.day}
              time={EVENT.time}
            />
          </InvitationSection>

          <InvitationSection className="bg-[#fdf2f2]">
            <InvitationGallery />
          </InvitationSection>

          <InvitationSection className="bg-[#fde9ea]">
            <InvitationCountdown
              title={t.countdown}
              target={WEDDING_COUNTDOWN_TARGET}
              labels={{
                days: t.days,
                hours: t.hours,
                minutes: t.minutes,
                seconds: t.seconds,
              }}
            />
          </InvitationSection>

          <InvitationSection className="bg-[#fde2e4]">
            <InvitationProgramTimeline title={t.program} items={TIMELINE[lang]} />
          </InvitationSection>

          <InvitationSection className="bg-[#FDF2F2]">
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

          <InvitationSection className="bg-[#fce4ec]">
            <InvitationDressCode
              title={t.dressCode}
              women={{ title: t.women, description: t.womenDress }}
              men={{ title: t.men, description: t.menDress }}
            />
          </InvitationSection>

          <InvitationSection className="bg-[#fde9ea]">
            <InvitationPreWeddingEvents title={t.preWeddingEvents} events={PRE_WEDDING_EVENTS[lang]} />
          </InvitationSection>

          <InvitationSection className="bg-[#fde2e4]">
            <InvitationDetailSection
              icon={Car}
              title={t.transportation}
              description={t.transportationDesc}
            />
          </InvitationSection>

          <InvitationSection className="bg-[#fff9fa]">
            <InvitationDetailSection
              icon={Building2}
              title={t.accommodation}
              description={t.accommodationDesc}
            />
          </InvitationSection>

          <InvitationSection className="bg-[#f8e1e7]">
            <InvitationDetailSection icon={Gift} title={t.gifts} description={t.giftsDesc} />
          </InvitationSection>

          <InvitationSection className="bg-[#fdf5f5]">
            <InvitationMessageForm
              labels={{
                title: t.sendMessage,
                yourName: t.yourName,
                namePlaceholder: t.namePlaceholder,
                email: t.email,
                emailPlaceholder: t.emailPlaceholder,
                attending: t.attending,
                attendingPlaceholder: t.attendingPlaceholder,
                attendingYes: t.attendingYes,
                attendingNo: t.attendingNo,
                attendingMaybe: t.attendingMaybe,
                message: t.message,
                messagePlaceholder: t.messagePlaceholder,
                send: t.send,
                sent: t.sent,
              }}
            />
          </InvitationSection>

          <InvitationSection className="bg-[#f7e1e5] !py-20 md:!py-28">
            <InvitationClosing
              message={t.closing}
              coupleNames={`${COUPLE.groom.name} & ${COUPLE.bride.name}`}
            />
          </InvitationSection>

          <InvitationFooter coupleNames={`${COUPLE.groom.name} & ${COUPLE.bride.name}`} credits={t.credits} />
        </div>
      )}
    </div>
  );
}

function WelcomeDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#f5b8c4]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#f5b8c4] text-[#f5b8c4]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#f5b8c4]/70" />
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
