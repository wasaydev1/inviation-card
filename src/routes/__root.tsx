import { Outlet, Link, createRootRoute, HeadContent } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f4f1] px-4">
      <div className="max-w-md text-center">
        <h1 className="font-invitation-script text-6xl text-[#8b6f5c]">404</h1>
        <p className="font-invitation-serif mt-4 text-[#5c4a42]">This page does not exist.</p>
        <Link
          to="/"
          className="font-invitation-serif mt-6 inline-block rounded-full border border-[#c9b5a8] bg-white px-6 py-2.5 text-sm text-[#5c4a42] transition hover:bg-[#faf7f4]"
        >
          Back to invitation
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wedding Invitation" },
      { name: "description", content: "You are cordially invited to our wedding ceremony." },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
