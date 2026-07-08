import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  title: string;
  invited: string;
  date: string;
  day: string;
  time: string;
};

const SIZE = 280;
const SCRATCH_BRUSH = 26;
const CLIP_ID = "scratch-heart-clip";
const REVEAL_THRESHOLD = 0.48;

const HEART_CLIP_PATH =
  "M0.5,0.28 C0.5,0.1 0.1,0.108 0.1,0.308 C0.1,0.508 0.5,0.788 0.5,0.868 C0.5,0.788 0.9,0.508 0.9,0.308 C0.9,0.108 0.5,0.1 0.5,0.28 Z";

function heartPathD(size = SIZE) {
  const cx = size * 0.5;
  const top = size * 0.1;
  const hw = size * 0.4;
  const y0 = top + hw * 0.45;
  return [
    `M ${cx} ${y0}`,
    `C ${cx} ${top}, ${cx - hw} ${top + hw * 0.02}, ${cx - hw} ${top + hw * 0.52}`,
    `C ${cx - hw} ${top + hw * 1.02}, ${cx} ${top + hw * 1.72}, ${cx} ${top + hw * 1.92}`,
    `C ${cx} ${top + hw * 1.72}, ${cx + hw} ${top + hw * 1.02}, ${cx + hw} ${top + hw * 0.52}`,
    `C ${cx + hw} ${top + hw * 0.02}, ${cx} ${top}, ${cx} ${y0}`,
    "Z",
  ].join(" ");
}

const HEART_SVG_PATH = heartPathD();

function traceHeartPath(ctx: CanvasRenderingContext2D) {
  const cx = SIZE * 0.5;
  const top = SIZE * 0.1;
  const hw = SIZE * 0.4;
  const y0 = top + hw * 0.45;

  ctx.beginPath();
  ctx.moveTo(cx, y0);
  ctx.bezierCurveTo(cx, top, cx - hw, top + hw * 0.02, cx - hw, top + hw * 0.52);
  ctx.bezierCurveTo(cx - hw, top + hw * 1.02, cx, top + hw * 1.72, cx, top + hw * 1.92);
  ctx.bezierCurveTo(cx, top + hw * 1.72, cx + hw, top + hw * 1.02, cx + hw, top + hw * 0.52);
  ctx.bezierCurveTo(cx + hw, top + hw * 0.02, cx, top, cx, y0);
  ctx.closePath();
}

function drawGlitterHeart(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.save();
  traceHeartPath(ctx);
  ctx.clip();

  const glow = ctx.createRadialGradient(SIZE * 0.38, SIZE * 0.32, 8, SIZE * 0.5, SIZE * 0.5, SIZE * 0.52);
  glow.addColorStop(0, "#f2cdd4");
  glow.addColorStop(0.35, "#dea0ad");
  glow.addColorStop(0.7, "#c87888");
  glow.addColorStop(1, "#a85a6a");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 2200; i++) {
    const px = Math.random() * SIZE;
    const py = Math.random() * SIZE;
    const roll = Math.random();
    const r = Math.random() * 1.6 + 0.35;
    let color: string;
    if (roll < 0.45) color = `rgba(255,255,255,${Math.random() * 0.65 + 0.2})`;
    else if (roll < 0.75) color = `rgba(255,220,228,${Math.random() * 0.5 + 0.15})`;
    else color = `rgba(120,70,82,${Math.random() * 0.35 + 0.1})`;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 90; i++) {
    const px = Math.random() * SIZE;
    const py = Math.random() * SIZE;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.35})`;
    ctx.beginPath();
    ctx.arc(px, py, Math.random() * 2.2 + 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.save();
  traceHeartPath(ctx);
  ctx.strokeStyle = "#7a3340";
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

function getScratchPercent(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;

  traceHeartPath(ctx);
  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
  let cleared = 0;
  let heart = 0;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!ctx.isPointInPath(x, y)) continue;
      heart++;
      if (data[(y * SIZE + x) * 4 + 3]! < 80) cleared++;
    }
  }

  return heart > 0 ? cleared / heart : 0;
}

function getPoint(canvas: HTMLCanvasElement, e: React.PointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2.8 + Math.random() * 2.2}s`,
        size: 4 + Math.random() * 6,
        rotate: Math.random() * 360,
        color: ["#e8a0b0", "#c97888", "#9b4d5c", "#f5d0d8", "#b85c6e"][i % 5],
        shape: i % 3 === 0 ? "rect" : "circle",
      })),
    [],
  );

  return (
    <div className="scratch-confetti pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`scratch-confetti-piece scratch-confetti-piece--${p.shape}`}
          style={{
            left: p.left,
            width: p.shape === "circle" ? p.size : p.size * 0.35,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function RevealedHeart({
  invited,
  date,
  day,
  time,
}: {
  invited: string;
  date: string;
  day: string;
  time: string;
}) {
  const patternId = useMemo(() => `heart-grid-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <div className="scratch-reveal-complete-heart relative mx-auto aspect-square w-full max-w-[300px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="rgba(255,252,253,0.95)" />
            <path
              d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2"
              stroke="rgba(185,130,145,0.22)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <path
          d={HEART_SVG_PATH}
          fill={`url(#${patternId})`}
          stroke="#8b4555"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="font-dancing text-2xl italic text-[#b85c6e] md:text-3xl">{invited}</p>
        <p className="font-invitation-display mt-2 text-xl font-bold text-[#3d2a30] md:text-2xl">
          {date}
        </p>
        <p className="font-invitation-serif mt-1 text-base italic text-[#b85c6e] md:text-lg">
          {day}
        </p>
        <p className="font-invitation-serif mt-2 text-sm text-[#5c4a42]">{time}</p>
      </div>
    </div>
  );
}

export function ScratchToReveal({ title, invited, date, day, time }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchingRef = useRef(false);
  const completeRef = useRef(false);
  const [complete, setComplete] = useState(false);

  const markComplete = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    setComplete(true);
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || completeRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGlitterHeart(ctx);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || completeRef.current) return;
    if (getScratchPercent(canvas) >= REVEAL_THRESHOLD) markComplete();
  }, [markComplete]);

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || completeRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, SCRATCH_BRUSH, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      checkProgress();
    },
    [checkProgress],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    scratchingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getPoint(e.currentTarget, e);
    scratch(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!scratchingRef.current || completeRef.current) return;
    const { x, y } = getPoint(e.currentTarget, e);
    scratch(x, y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    scratchingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const clipStyle = { clipPath: `url(#${CLIP_ID})`, WebkitClipPath: `url(#${CLIP_ID})` };

  if (complete) {
    return (
      <div className="scratch-reveal scratch-reveal--complete relative overflow-hidden py-6">
        <Confetti />

        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#c9a0a8]/60" />
            <Heart className="h-2.5 w-2.5 fill-[#9b4d5c] text-[#9b4d5c]" strokeWidth={0} />
            <div className="h-px w-16 bg-[#c9a0a8]/60" />
          </div>

          <div className="scratch-reveal-complete-enter">
            <RevealedHeart invited={invited} date={date} day={day} time={time} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scratch-reveal text-center">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
            <path d={HEART_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      <h2 className="font-dancing text-4xl text-[#9b4d5c] md:text-5xl">{title}</h2>

      <div className="my-4 flex items-center justify-center gap-3">
        <div className="h-px w-16 bg-[#c9a0a8]/60" />
        <Heart className="h-2.5 w-2.5 fill-[#9b4d5c] text-[#9b4d5c]" strokeWidth={0} />
        <div className="h-px w-16 bg-[#c9a0a8]/60" />
      </div>

      <div className="scratch-reveal-heart relative mx-auto aspect-square w-full max-w-[280px]">
        <div
          className="scratch-reveal-content absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
          style={clipStyle}
          aria-hidden
        >
          <p className="font-invitation-display text-lg font-semibold">{date}</p>
        </div>

        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="scratch-reveal-canvas absolute inset-0 h-full w-full cursor-crosshair touch-none"
          style={clipStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onDoubleClick={markComplete}
          aria-label={title}
        />
      </div>

      <p className="font-invitation-serif mt-4 text-xs text-[#9b7a82]">
        Scratch the heart to reveal the date
      </p>
    </div>
  );
}
