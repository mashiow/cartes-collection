import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const cards = [
  {
    name: "Anelyaa PO CONTENTE",
    image: "anelyaapocontente.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "C'est rien, elle a juste perdu sur valorant...",
  },
  {
    name: "Anelyaa Pommaléfique",
    image: "anelyaapommalefique.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Faites attention, si elle se met à distribuer des pommes, fuyez.",
  },
  {
    name: "Anelyaa + Jacob",
    image: "anelyaajacob.png",
    rarity: "LEGENDARY",
    series: "Série 1",
    bio: "Horriblement fan, que quelqu’un réagisse parce qu’elle va nous mordre à force...",
  },
  {
    name: "F*ck",
    image: "fck.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Alors, soit t'as insulté son chien, soit son niveau Valorant, soit Jacob, sinon y’a pas d’autre raison pour qu’elle te fasse un doigt.",
  },
  {
    name: "Ventipuff",
    image: "ventipuff.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Un ventilo qui tire sur une puff, qui l'eût cru ?",
  },
  {
    name: "Obs",
    image: "obs.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "-C’est le machin la ! -Le logiciel ? -Oui mais il sert a faire les trucs la ! -Oui les streams quoi ? -OUII VOILAAAAA !!!!",
  },
  {
    name: "Filou",
    image: "filou.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "N’aime pas anelyaa, mais au moins avec lui on rigole, il est actif 3 fois dans l’année après c’est ciao !",
  },
  {
    name: "Minox",
    image: "minox.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "minox alias le chouchou des nanas (aussi celui d’ane ??), p’tit musicien dans l’âme (bro copie juste luther), mais impossible de ne pas l’aimer !",
  },
  {
    name: "Clestylva",
    image: "clestylva.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "Arriver en cours de route, aussi clescouille que l’autre, mais bon on l’aime bien quand même",
  },
  {
    name: "Mashiow",
    image: "mashiow.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "Simplement le boss. (oui je me sauce car c’est moi je fait les cartes et alors ???)",
  },
  {
    name: "Ben de Twitch",
    image: "bentwitch.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Toujours dans le chat, prêt à bannir Anelyaa de Twitch au moindre faux pas (Parrait-il a été créé par quelqu’un après son ban dans le chat...)",
  },
  {
    name: "Figurine POP Mitsuri",
    image: "popmitsuri.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Paraît-il que la figurine prend la poussière depuis l’achat, en vente sur Vinted soon (harceler Anelyaa pour la vendre)",
  },
  {
    name: "Peluche Mitsuri",
    image: "peluchemitsuri.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Alors ça ressemble plus à un monstre horrifique qu’à une peluche mais passons...",
  },
  {
    name: "Seconde Dame",
    image: "secondedame.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Votre streameuse qui s’essaye à la musique... ouais bon oublions hyn, de toute façon le morceau a pu être entendu par peu de gens... légende ou vraie musique ?",
  },
   {
    name: "Valorant",
    image: "valorant.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Le fameux Valorant, l’un des jeux principaux de la chaîne, mais bon vu le niveau d’Anelyaa pas besoin de s’éterniser dessus....",
  },
  {
    name: "Le mariage Roblox",
    image: "mariageroblox.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Anelyaa et Minox ont décidé de se marier... Mais n’ayant pas le budget, ils l’ont fait sur Roblox. Raison de plus de se moquer d’Anelyaa",
  },
  {
    name: "Send biceps (please)",
    image: "sendbiceps.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "L’image parle d’elle même, send biceps please.",
  },
  {
    name: "Crash Twitch",
    image: "crash.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Sachez que sur la chaîne, ça arrive si souvent et que maintenant ça nous choque même plus (Plus d’heure de crash, que de contenu)",
  },











] as const;

async function main() {
  for (const c of cards) {
    const imageUrl = `/cards/${c.image}`;
    const existing = await prisma.card.findFirst({ where: { name: c.name } });

    if (existing) {
      await prisma.card.update({
        where: { id: existing.id },
        data: { imageUrl, rarity: c.rarity, series: c.series, bio: c.bio },
      });
    } else {
      await prisma.card.create({
        data: {
          name: c.name,
          imageUrl,
          rarity: c.rarity,
          series: c.series,
          bio: c.bio,
        },
      });
    }
  }
  console.log(`${cards.length} cartes à jour !`);
}

main().finally(() => prisma.$disconnect());