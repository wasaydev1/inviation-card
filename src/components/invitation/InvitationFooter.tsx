type Props = {
  coupleNames: string;
  credits?: string;
};

export function InvitationFooter({ coupleNames, credits }: Props) {
  return (
    <footer className="invitation-footer border-t border-[#e8c4ca]/40 bg-[#fdf5f5] px-6 py-10 text-center">
      <p className="font-dancing text-2xl text-[#a34951] md:text-3xl">{coupleNames}</p>
      <p className="font-invitation-serif mt-4 text-xs text-[#4a2a32]/60 md:text-sm">{credits}</p>
    </footer>
  );
}
