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
  sending: string;
  sent: string;
  error: string;
};

type Props = {
  labels: Labels;
  subject?: string;
};

type FormState = {
  name: string;
  email: string;
  attending: string;
  message: string;
};

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim() ?? "";

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
      <Heart className="h-2.5 w-2.5 fill-[#a34951] text-[#a34951]" strokeWidth={0} />
      <div className="h-px w-16 bg-[#c9a0a8]/70" />
    </div>
  );
}

export function InvitationMessageForm({ labels, subject = "Wedding Invitation RSVP" }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    attending: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const submitted = status === "success";
  const sending = status === "sending";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitted || sending) return;

    if (!ACCESS_KEY) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject,
          name: form.name,
          email: form.email,
          attending: form.attending,
          message: form.message,
          from_name: "Wedding Invitation",
        }),
      });

      const data = (await response.json()) as { success?: boolean };

      if (!response.ok || !data.success) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === "error") setStatus("idle");
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
          <label htmlFor="invitation-name" className="font-invitation-serif mb-1.5 block text-sm font-medium text-[#4a2a32]">
            {labels.yourName}
          </label>
          <input
            id="invitation-name"
            name="name"
            type="text"
            required
            disabled={submitted || sending}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder={labels.namePlaceholder}
            className="invitation-form-field w-full"
          />
        </div>

        <div>
          <label htmlFor="invitation-email" className="font-invitation-serif mb-1.5 block text-sm font-medium text-[#4a2a32]">
            {labels.email}
          </label>
          <input
            id="invitation-email"
            name="email"
            type="email"
            required
            disabled={submitted || sending}
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder={labels.emailPlaceholder}
            className="invitation-form-field w-full"
          />
        </div>

        <div>
          <label htmlFor="invitation-attending" className="font-invitation-serif mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#4a2a32]">
            <Users className="h-3.5 w-3.5 text-[#a34951]" strokeWidth={1.5} />
            {labels.attending}
          </label>
          <select
            id="invitation-attending"
            name="attending"
            required
            disabled={submitted || sending}
            value={form.attending}
            onChange={(e) => updateField("attending", e.target.value)}
            className="invitation-form-field w-full"
          >
            <option value="" disabled>
              {labels.attendingPlaceholder}
            </option>
            <option value="yes">{labels.attendingYes}</option>
            <option value="no">{labels.attendingNo}</option>
            <option value="maybe">{labels.attendingMaybe}</option>
          </select>
        </div>

        <div>
          <label htmlFor="invitation-message" className="font-invitation-serif mb-1.5 block text-sm font-medium text-[#4a2a32]">
            {labels.message}
          </label>
          <textarea
            id="invitation-message"
            name="message"
            rows={4}
            disabled={submitted || sending}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder={labels.messagePlaceholder}
            className="invitation-form-field w-full resize-none"
          />
        </div>

        {status === "error" && (
          <p className="font-invitation-serif text-sm text-[#a34951]" role="alert">
            {labels.error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitted || sending}
          className="font-invitation-serif w-full rounded-lg bg-[#a34951] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#8f3d45] disabled:cursor-default disabled:opacity-80"
        >
          {submitted ? labels.sent : sending ? labels.sending : labels.send}
        </button>
      </form>
    </div>
  );
}
