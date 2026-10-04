"use client";

import { authClient } from "@/lib/auth-client";

export default function AuthButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <p>Chargement...</p>;

  if (!session) {
    return (
      <button
        onClick={() =>
          authClient.signIn.social({ provider: "discord", callbackURL: "/" })
        }
        className="rounded bg-[#454545] px-4 py-2 text-white hover:bg-[#5a5a5a]"
      >
        Se connecter avec Discord
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p>Salut {session.user.name} !</p>
      <button
        onClick={() => authClient.signOut()}
        className="rounded bg-[#454545] px-4 py-2 text-white hover:bg-[#5a5a5a]"
      >
        Se déconnecter
      </button>
    </div>
  );
}