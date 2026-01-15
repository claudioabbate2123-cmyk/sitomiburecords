"use client";

import Link from "next/link";

export default function CorsiPage() {
  return (
    <section className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-12">Corsi</h1>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

        {/* Pianoforte latino */}
        <Link
          href="/didattica/corsi/pianoforte-latino"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-4">
            <img
              src="/pianofortelatino.JPG"
              alt="Pianoforte latino"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold group-hover:text-white transition">
              Pianoforte latino
            </h2>
            <p className="text-sm text-neutral-400">
              Claudio Abbate
            </p>
          </div>
        </Link>

        {/* Congas */}
        <Link
          href="/didattica/corsi/congas"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-4">
            <img
              src="/congas.JPG"
              alt="Congas"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold">Congas</h2>
            <p className="text-sm text-neutral-400">
              Fabrizio Pironi
            </p>
          </div>
        </Link>

        {/* Cubase */}
        <Link
          href="/didattica/corsi/cubase"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-4">
            <img
              src="/cubaseproduzione.JPG"
              alt="Cubase produzione musicale"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold">
              Cubase – Produzione musicale
            </h2>
            <p className="text-sm text-neutral-400">
              Claudio Abbate
            </p>
          </div>
        </Link>

        {/* Basso latino */}
        <Link
          href="/didattica/corsi/basso-latino"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-4">
            <img
              src="/bassolatino.JPG"
              alt="Basso latino"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold">
              Basso latino
            </h2>
            <p className="text-sm text-neutral-400">
              Michele Ferretti
            </p>
          </div>
        </Link>

        {/* Batteria timba */}
        <Link
          href="/didattica/corsi/batteria-timba"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-4">
            <img
              src="/batteriatimba.JPG"
              alt="Batteria timba cubana"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold">
              Batteria nella timba cubana
            </h2>
            <p className="text-sm text-neutral-400">
              Manuel Flores
            </p>
          </div>
        </Link>

        {/* DJ */}
        <Link
          href="/didattica/corsi/dj"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-4">
            <img
              src="/djcourse.JPG"
              alt="Corso DJ"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-lg font-semibold">
              Corso di DJ
            </h2>
            <p className="text-sm text-neutral-400">
              Fabrizio Pironi
            </p>
          </div>
        </Link>

      </div>
    </section>
  );
}
