import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Labels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type Props = {
  title: string;
  target: Date;
  labels: Labels;
};

function useCountdown(target: Date): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

function CountdownDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#a34951] text-[#a34951]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
    </div>
  );
}

function CountdownUnit({
  label,
  value,
  pad = true,
}: {
  label: string;
  value: number;
  pad?: boolean;
}) {
  const display = pad ? String(value).padStart(2, "0") : String(value);

  return (
    <div className="flex flex-col items-center">
      <div className="invitation-countdown-box flex aspect-square w-full max-w-[88px] items-center justify-center sm:max-w-[104px]">
        <span className="font-invitation-display text-3xl font-bold leading-none text-[#4a2a32] sm:text-4xl md:text-5xl">
          {display}
        </span>
      </div>
      <span className="font-invitation-serif mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#a34951] sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function InvitationCountdown({ title, target, labels }: Props) {
  const countdown = useCountdown(target);

  return (
    <div className="invitation-countdown mx-auto max-w-xl text-center">
      <h2 className="font-dancing text-4xl text-[#a34951] md:text-5xl">{title}</h2>

      <div className="my-5">
        <CountdownDivider />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <CountdownUnit label={labels.days} value={countdown.days} pad={false} />
        <CountdownUnit label={labels.hours} value={countdown.hours} />
        <CountdownUnit label={labels.minutes} value={countdown.minutes} />
        <CountdownUnit label={labels.seconds} value={countdown.seconds} />
      </div>
    </div>
  );
}

export function getWeddingCountdownTarget(date: string, time: string): Date {
  return new Date(`${date} ${time}`);
}
