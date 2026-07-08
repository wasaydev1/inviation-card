import { Heart, Shirt } from "lucide-react";

type DressColumn = {
  title: string;
  description: string;
};

type Props = {
  title: string;
  women: DressColumn;
  men: DressColumn;
};

function DressCodeDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#a34951] text-[#a34951]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
    </div>
  );
}

function DressColumnBlock({ title, description }: DressColumn) {
  return (
    <div className="text-center">
      <h3 className="font-invitation-serif text-base font-semibold uppercase tracking-[0.12em] text-[#a34951] md:text-lg">
        {title}
      </h3>
      <p className="font-invitation-serif mx-auto mt-3 max-w-[220px] text-sm leading-relaxed text-[#4a2a32]/85 md:text-base">
        {description}
      </p>
    </div>
  );
}

export function InvitationDressCode({ title, women, men }: Props) {
  return (
    <div className="invitation-dress-code mx-auto max-w-2xl text-center">
      <Shirt className="mx-auto h-5 w-5 text-[#a34951]" strokeWidth={1.5} />
      <h2 className="font-dancing mt-3 text-4xl text-[#a34951] md:text-5xl">{title}</h2>

      <div className="my-5">
        <DressCodeDivider />
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-8">
        <DressColumnBlock title={women.title} description={women.description} />
        <DressColumnBlock title={men.title} description={men.description} />
      </div>
    </div>
  );
}
