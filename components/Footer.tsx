import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-[#f4a7c0] bg-[#2b2b2b]/95 px-6 py-8 text-center text-white">
      <p className="text-xl font-semibold tracking-widest">ANETSUKI</p>
      <p className="mt-1 text-gray-300">
        Concept original créé par Mashiow et Anelyaa.
      </p>
      <div className="mt-3 flex justify-center gap-6 text-lg">
        <Link href="/faq" className="underline">
          FAQ et contact
        </Link>
        <Link href="/classement" className="underline">
          Classement
        </Link>
      </div>
    </footer>
  );
}