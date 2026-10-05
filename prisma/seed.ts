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
    bio: "Minox alias le chouchou des nanas, p’tit musicien dans l’âme (bro copie juste luther), mais impossible de ne pas l’aimer !",
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