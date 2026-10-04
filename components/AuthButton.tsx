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
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
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
        className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
      >
        Se déconnecter
      </button>
    </div>
  );
}