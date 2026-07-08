import { Clock, Heart } from "lucide-react";

export type TimelineItem = {
  title: string;
  time: string;
  description: string;
};

type Props = {
  title: string;
  items: TimelineItem[];
};

function TimelineDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#a34951] text-[#a34951]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
    </div>
  );
}

export function InvitationProgramTimeline({ title, items }: Props) {
  return (
    <div className="invitation-program-timeline mx-auto max-w-lg">
      <div className="text-center">
        <Clock className="mx-auto h-5 w-5 text-[#a34951]" strokeWidth={1.5} />
        <h2 className="font-dancing mt-3 text-4xl text-[#a34951] md:text-5xl">{title}</h2>
        <div className="my-5">
          <TimelineDivider />
        </div>
      </div>

      <div className="relative ml-2 pl-8">
        <div
          className="absolute left-[5px] w-px bg-[#a34951]/80"
          style={{ top: "0.5rem", bottom: "0.5rem" }}
          aria-hidden
        />

        <ul className="space-y-10">
          {items.map((item) => (
            <li key={item.title} className="relative">
              <span
                className="absolute -left-8 top-1.5 h-2.5 w-2.5 rounded-full bg-[#a34951]"
                aria-hidden
              />
              <h3 className="font-invitation-serif text-lg font-semibold text-[#a34951] md:text-xl">
                {item.title}
              </h3>
              <p className="font-invitation-serif mt-1 text-sm text-[#a34951]/75 md:text-base">
                {item.time}
              </p>
              <p className="font-invitation-serif mt-1.5 text-sm italic leading-relaxed text-[#6b4a52]/90 md:text-base">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
