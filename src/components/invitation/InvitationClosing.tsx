type Props = {
  message: string;
  coupleNames: string;
};

function OrnamentalDivider() {
  return (
    <svg
      className="mx-auto h-4 w-48 text-[#a34951]/45 sm:w-64"
      viewBox="0 0 256 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 8 C 32 2, 64 14, 96 8 S 160 2, 192 8 S 224 14, 252 8"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InvitationClosing({ message, coupleNames }: Props) {
  return (
    <div className="invitation-closing mx-auto max-w-xl px-4 text-center">
      <OrnamentalDivider />
      <p className="font-dancing mt-6 text-3xl leading-snug text-[#a34951] md:text-4xl">{message}</p>
      <p className="font-dancing mt-4 text-2xl text-[#a34951]/90 md:text-3xl">{coupleNames}</p>
      <div className="mt-6">
        <OrnamentalDivider />
      </div>
    </div>
  );
}
