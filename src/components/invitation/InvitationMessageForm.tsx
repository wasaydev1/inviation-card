import { useState } from "react";
import { Heart, Mail, Users } from "lucide-react";

type Labels = {
  title: string;
  yourName: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  attending: string;
  attendingPlaceholder: string;
  attendingYes: string;
  attendingNo: string;
  attendingMaybe: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sent: string;
};

type Props = {
  labels: Labels;
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

export function InvitationMessageForm({ labels }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="invitation-message-form mx-auto max-w-md text-center">
      <Mail className="mx-auto h-5 w-5 text-[#a34951]" strokeWidth={1.5} />
      <h2 className="font-dancing mt-3 text-4xl text-[#a34951] md:text-5xl">{labels.title}</h2>

      <div className="my-5">
        <SectionDivider />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
        <div>
          <label className="font-invitation-serif mb-1.5 block text-sm font-medium text-[#4a2a32]">
            {labels.yourName}
          </label>
          <input
            type="text"
            required
            disabled={submitted}
            placeholder={labels.namePlaceholder}
            className="invitation-form-field w-full"
          />
        </div>

        <div>
          <label className="font-invitation-serif mb-1.5 block text-sm font-medium text-[#4a2a32]">
            {labels.email}
          </label>
          <input
            type="email"
            required
            disabled={submitted}
            placeholder={labels.emailPlaceholder}
            className="invitation-form-field w-full"
          />
        </div>

        <div>
          <label className="font-invitation-serif mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#4a2a32]">
            <Users className="h-3.5 w-3.5 text-[#a34951]" strokeWidth={1.5} />
            {labels.attending}
          </label>
          <select required disabled={submitted} defaultValue="" className="invitation-form-field w-full">
            <option value="" disabled>
              {labels.attendingPlaceholder}
            </option>
            <option value="yes">{labels.attendingYes}</option>
            <option value="no">{labels.attendingNo}</option>
            <option value="maybe">{labels.attendingMaybe}</option>
          </select>
        </div>

        <div>
          <label className="font-invitation-serif mb-1.5 block text-sm font-medium text-[#4a2a32]">
            {labels.message}
          </label>
          <textarea
            rows={4}
            disabled={submitted}
            placeholder={labels.messagePlaceholder}
            className="invitation-form-field w-full resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitted}
          className="font-invitation-serif w-full rounded-lg bg-[#a34951] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#8f3d45] disabled:cursor-default disabled:opacity-80"
        >
          {submitted ? labels.sent : labels.send}
        </button>
      </form>
    </div>
  );
}
