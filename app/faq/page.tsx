import Link from "next/link";
import { BOOSTER_PRICE, RARITY_WEIGHTS } from "@/lib/booster";

// À adapter si tu changes les réglages du bot Discord
const DROP_MIN_COINS = 50;
const DROP_MAX_COINS = 150;
const DROP_EVERY = "1 à 3 heures";
// Facultatif : colle ici le lien d'invitation de ton serveur Discord
const DISCORD_INVITE_URL = "";

const rarityLabels: Record<string, string> = {
  COMMON: "Commune",
  RARE: "Rare",
  EPIC: "Épique",
  LEGENDARY: "Légendaire",
};

const rarityBadge: Record<string, string> = {
  COMMON: "bg-gray-600 text-white",
  RARE: "bg-blue-600 text-white",
  EPIC: "bg-purple-600 text-white",
  LEGENDARY: "bg-yellow-500 text-black",
};

function formatPercent(value: number) {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-gray-600 pt-6">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-xl leading-relaxed text-gray-100">
        {children}
      </div>
    </section>
  );
}

export default function FaqPage() {
  const total = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);
  const rates = RARITY_WEIGHTS.filter((r) => r.weight > 0);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Accueil
        </Link>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl bg-[#2b2b2b] p-6 text-white shadow-xl md:p-8">
        <h1 className="text-5xl font-bold">FAQ</h1>
        <p className="text-xl text-gray-300">
          Tout ce qu’il faut savoir pour bien commencer ta collection.
        </p>

        <Section title="Quel est le but du jeu ?">
          <p>
            Le but est de <strong>collectionner toutes les cartes Anetsuki</strong>.
            Chaque carte a son illustration, sa rareté et sa petite histoire.
          </p>
          <p>
            La page <strong>Collection</strong> te montre les cartes que tu as
            découvertes, en couleur, et celles qu’il te reste à trouver, grisées
            avec des « ??? ». Si tu obtiens plusieurs fois la même carte, un
            petit « x2 », « x3 »… apparaît : tes doublons sont parfaits pour les
            échanger avec les autres joueurs.
          </p>
        </Section>

        <Section title="Comment récupérer des pièces ?">
          <p>
            Les pièces se gagnent sur notre <strong>serveur Discord</strong>. Un
            bot y fait apparaître un <strong>drop</strong> au hasard, toutes les{" "}
            {DROP_EVERY}, dans le salon des drops. Il contient entre{" "}
            <strong>{DROP_MIN_COINS}</strong> et <strong>{DROP_MAX_COINS}</strong>{" "}
            pièces.
          </p>
          <p>
            Il suffit de cliquer sur le bouton <strong>Récupérer</strong> : le
            premier qui clique remporte les pièces ! Les admins peuvent aussi
            lancer des drops spéciaux quand ils veulent.
          </p>
          <p>
            Important : pour recevoir les pièces, tu dois t’être connecté au moins
            une fois sur ce site avec <strong>le même compte Discord</strong>.
          </p>
          {DISCORD_INVITE_URL && (
            <p>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Rejoindre le serveur Discord
              </a>
            </p>
          )}
        </Section>

        <Section title="Comment ouvrir un booster ?">
          <p>
            Connecte-toi, puis rends-toi sur la page <strong>Booster</strong>. Un
            booster coûte <strong>{BOOSTER_PRICE} pièces</strong> et contient une
            carte tirée au hasard, qui est ajoutée directement à ta collection.
          </p>
          <p>Le bouton est grisé tant que tu n’as pas assez de pièces.</p>
        </Section>

        <Section title="Quelles sont les chances d’obtenir chaque rareté ?">
          <p>Voici la probabilité de tirer chaque rareté dans un booster :</p>
          <div className="flex flex-col gap-2">
            {rates.map((r) => (
              <div
                key={r.rarity}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/30 px-4 py-2"
              >
                <span
                  className={`rounded-full px-3 py-1 text-base font-semibold ${rarityBadge[r.rarity]}`}
                >
                  {rarityLabels[r.rarity]}
                </span>
                <span className="text-xl">
                  {formatPercent((r.weight / total) * 100)}
                  <span className="ml-2 text-base text-gray-400">
                    (environ 1 sur {Math.round(total / r.weight)})
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-lg text-gray-300">
            Le jeu tire d’abord une rareté, puis une carte au hasard parmi celles
            de cette rareté : toutes les cartes d’une même rareté ont donc la même
            chance de sortir.
          </p>
        </Section>

        <Section title="Comment échanger des cartes ?">
          <p>
            Sur la page <strong>Échanges</strong>, choisis une de tes cartes à
            donner et la carte que tu cherches, puis publie ton offre. Ta carte
            est mise de côté tant que l’offre est ouverte, et un autre joueur qui
            possède la carte demandée peut l’accepter : l’échange se fait alors
            immédiatement.
          </p>
          <p>
            Tu peux annuler ton offre quand tu veux, et tu récupères ta carte.
          </p>
        </Section>

        <Section title="J’ai cliqué sur un drop mais je n’ai rien reçu">
          <p>
            Si le bot te répond de te connecter, c’est que ton compte Discord
            n’est pas encore lié au site : connecte-toi une fois avec le bouton
            « Se connecter avec Discord » de l’accueil, puis attends le prochain
            drop.
          </p>
          <p>
            Si le bot indique « trop tard », quelqu’un a cliqué avant toi. Le
            premier qui clique gagne !
          </p>
        </Section>

        <Section title="Crédit">
          <p>
            Anetski est un concept original créé par Mashiow et Anelyaa.
          </p>
          <p>
            - Développement (site & jeu) : Mashiow
            - Design du site : Mashiow
            - Design et rédaction des cartes : Mashiow et Anelyaa
            - Game Design : Filounote et Mashiow
          </p>
          </Section>

      </div>
    </main>
  );
}