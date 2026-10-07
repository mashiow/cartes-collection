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
    bio: "Arriver en cours de route, aussi clescouille que l’autre, mais bon on l’aime bien quand même.",
  },
  {
    name: "Mashiow",
    image: "mashiow.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "Simplement le boss. (oui je me sauce car c’est moi je fais les cartes et alors ???)",
  },
  {
    name: "Ben de Twitch",
    image: "bentwitch.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Toujours dans le chat, prêt à bannir Anelyaa de Twitch au moindre faux pas. (Parrait-il a été créé par quelqu’un après son ban dans le chat...)",
  },
  {
    name: "Figurine POP Mitsuri",
    image: "popmitsuri.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Paraît-il que la figurine prend la poussière depuis l’achat, en vente sur Vinted soon.. (harceler Anelyaa pour la vendre)",
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
    bio: "Votre streameuse qui s’essaye à la musique... ouais bon oublions hyn, de toute façon le morceau a pu être entendu par peu de gens... légende ou vraie musique ? (INDICE : sur la page, il y a un petit bouton caché, cherche, tu auras une surprise !)",
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
    bio: "Anelyaa et Minox ont décidé de se marier... Mais n’ayant pas le budget, ils l’ont fait sur Roblox. Raison de plus de se moquer d’Anelyaa.",
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
    bio: "Sachez que sur la chaîne, ça arrive si souvent et que maintenant ça nous choque même plus. (Plus d’heure de crash, que de contenu)",
  },
  {
    name: "Jacob Elordi",
    image: "jacobelordi.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Le fameux Jacob... je t’ai jamais vu ni parlé mais j’en peux plus de toi, tout ça à cause d’Anelyaa qui parle H24 de toi mec.",
  },
  {
    name: "Manolo",
    image: "manolo.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Le fameux chien.",
  },
  {
    name: "Squid Game Minecraft",
    image: "squidgamemc.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Anelyaa au squid game, on pensait la voir mourir Premier jeu mais elle a survécu jusqu’à la corde à sauter quand même... déçu, impossible de la vanner du coup... (snif)",
  },
  {
    name: "Anelyaa miam miam",
    image: "anemiamiam.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "mhmmm cheeseburger please..",
  },
  {
    name: "Anelyoo",
    image: "anelyoo.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Fini Anelyaa, laissez place à Anelyoo, son remplaçant masculin.",
  },
  {
    name: "Anelyaa patiente",
    image: "anelyaapatiente.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "On ne sait pas trop ce qu'elle attend, mais je crois que...",
  },
  {
    name: "Tuto makeup",
    image: "tutomakeup.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Si tu veux devenir aussi horrible que son maquillage, tu es sur la bonne piste. (surtout si tu veux des grosses lèvres)",
  },
  {
    name: "Grystelite",
    image: "grystelite.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Anciennement un tigre, l’un des emblèmes de la chaîne, notre modérateur national qui déteste tout autant Anelyaa que moi.",
  },
  {
    name: "Pépère",
    image: "pepere.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Deuxième garde du corps d’Anelyaa (toujours pas volontaire mais forcé). Il est là une fois par mois, mais sans lui, le chat ne serait pas aussi drôle !",
  },
  {
    name: "Anelyaa Cars",
    image: "anelyaacars.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "VROUMMMM VROUMMMM Laissez place à la nouvelle carsette",
  },
  {
    name: "Ekyyxx",
    image: "ekyyxx.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "Le bras droit d’Anelyaa, mais on ne la connaît pas trop, le seul truc que je sais, c’est qu’elle fait de bons romans. Askip...",
  },
  {
    name: "Anelyaa vampire",
    image: "anelyaavampire.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Déjà, d'un, elle fait peur sur celle-ci et de deux, cachez vos pieds, elle croque dedans.",
  },
  {
    name: "Pyjama Hello Kitty",
    image: "pyjamahello.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "On l’a plus vu avec ce bas-là que des vêtements banals.",
  },
  {
    name: "Chips Oignon Caramel",
    image: "chipsoignoncaramelisé.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Non vous ne rêvez pas, y’a bien écrit oignons caramelisés et vinaigre balsamique.",
  },
  {
    name: "Anelyaa’costo",
    image: "anelyaacosto.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Les gros biscotos de anelyaa en sah ?",
  },
  {
    name: "Musique IA...",
    image: "musiqueia.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "On ne sait toujours pas pourquoi il y a une musique d'IA dans son serveur et on me dit dans les oreillettes que Manolo est représenté en chat...",
  },
  {
    name: "Obanai",
    image: "obanai.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Personnage de Demon Slayer, pilier du Serpent et l’amoureux de mitsuri (On m’a dit que Anelyaa appelait souvent son amoureux comme ça??)",
  },
  {
    name: "Mitsuri",
    image: "mitsuri.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "personnage De demon slayer, pilier de l’amour (et la plus belle mouhaha) finalement juste l’emblème de la chaîne",
  },
  {
    name: "Photo de profil",
    image: "photodeprofil.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Il n'y a rien de plus à ajouter, elle est là depuis le début hihi",
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