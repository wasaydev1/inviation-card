import { PartyPopper, Heart } from "lucide-react";

export type PreWeddingEvent = {
  title: string;
  time: string;
  location: string;
};

type Props = {
  title: string;
  events: PreWeddingEvent[];
};

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#a34951] text-[#a34951]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
    </div>
  );
}

export function InvitationPreWeddingEvents({ title, events }: Props) {
  return (
    <div className="invitation-prewedding mx-auto max-w-xl text-center">
      <PartyPopper className="mx-auto h-5 w-5 text-[#a34951]" strokeWidth={1.5} />
      <h2 className="font-dancing mt-3 text-4xl text-[#a34951] md:text-5xl">{title}</h2>

      <div className="my-5">
        <SectionDivider />
      </div>

      <div className="mx-auto mt-10 space-y-10">
        {events.map((ev) => (
          <div key={ev.title}>
            <h3 className="font-invitation-serif text-xl font-semibold text-[#a34951] md:text-2xl">
              {ev.title}
            </h3>
            <p className="font-invitation-serif mt-2 text-sm text-[#4a2a32]/70 md:text-base">
              {ev.time}
            </p>
            <p className="font-invitation-serif mt-1 text-sm text-[#4a2a32]/65 md:text-base">
              {ev.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

