import { createFileRoute } from "@tanstack/react-router";

import { RoyalPrestigePage } from "@/components/invitation/RoyalPrestigePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wedding Invitation — Veer & Zara" },
      {
        name: "description",
        content: "You are cordially invited to celebrate our wedding ceremony.",
      },
    ],
  }),
  component: RoyalPrestigePage,
});
