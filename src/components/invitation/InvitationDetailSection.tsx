import type { LucideIcon } from "lucide-react";
import { Heart } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
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

export function InvitationDetailSection({ icon: Icon, title, description }: Props) {
  return (
    <div className="invitation-detail-section mx-auto max-w-xl text-center">
      <Icon className="mx-auto h-5 w-5 text-[#a34951]" strokeWidth={1.5} />
      <h2 className="font-dancing mt-3 text-4xl text-[#a34951] md:text-5xl">{title}</h2>

      <div className="my-5">
        <SectionDivider />
      </div>

      <p className="font-invitation-serif mx-auto max-w-lg text-sm leading-relaxed text-[#4a2a32]/85 md:text-base">
        {description}
      </p>
    </div>
  );
}
