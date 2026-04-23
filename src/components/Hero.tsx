import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[#09090a] px-6 pb-20 pt-32 md:pb-24 md:pt-36"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-12%] h-[420px] w-[420px] rounded-full bg-brand/12 blur-[130px]" />
        <div className="absolute bottom-[-18%] right-[-8%] h-[420px] w-[420px] rounded-full bg-white/[0.05] blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(57,255,20,0.08),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.05),transparent_18%),radial-gradient(circle_at_50%_80%,rgba(57,255,20,0.05),transparent_24%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,10,0.08),rgba(9,9,10,0.45)_55%,rgba(9,9,10,1))]" />
      </div>

      <div className="relative container mx-auto">
        <div className="grid items-center gap-14 xl:grid-cols-[1.02fr_0.98fr]">
          {/* LEFT */}
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/55 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Electric Mobility
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/55 backdrop-blur-xl">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                Miami
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-black leading-[0.93] text-white md:text-7xl xl:text-[6.7rem]">
              Electric
              <br />
              Motion,
              <br />
              <span className="text-brand">Reimagined</span>
            </h1>

            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/62 md:text-xl">
              Discover premium electric bikes, scooters and urban vehicles with a
              cleaner showroom feel, stronger design language and a more immersive
              buying experience.
            </p>

            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => onNavigate('catalogo')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-brand"
              >
                View Catalog
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('contacto')}
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.03] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.07]"
              >
                Financing
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition hover:bg-white/[0.045]">
                <div className="mb-3 inline-flex rounded-2xl border border-brand/20 bg-brand/10 p-2.5 text-brand">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Trusted quality
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/68">
                  Premium selection with support and after-sales confidence.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition hover:bg-white/[0.045]">
                <div className="mb-3 inline-flex rounded-2xl border border-brand/20 bg-brand/10 p-2.5 text-brand">
                  <Zap className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Financing ready
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/68">
                  Flexible options for clients ready to move faster.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition hover:bg-white/[0.045]">
                <div className="mb-3 inline-flex rounded-2xl border border-brand/20 bg-brand/10 p-2.5 text-brand">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Local showroom
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/68">
                  Based in Miami with a stronger premium brand presence.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.14),transparent_32%)] blur-3xl" />
            <div className="absolute left-[6%] top-[8%] h-[180px] w-[180px] rounded-full bg-white/[0.05] blur-[75px]" />
            <div className="absolute bottom-[10%] right-[8%] h-[220px] w-[220px] rounded-full bg-brand/10 blur-[95px]" />

            <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_48%)]" />

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Featured vehicle
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/75">
                    Premium electric urban ride
                  </p>
                </div>

                <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand">
                  New drop
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,#121316,#0c0d10)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.10),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_82%,rgba(57,255,20,0.09),transparent_28%)]" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
                <div className="absolute left-1/2 top-[15%] h-[70%] w-[70%] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[75px]" />

                <div className="absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
                <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

                {/* stronger blend over the image */}
                <div className="absolute inset-0 z-[5] bg-[radial-gradient(circle_at_center,transparent_34%,rgba(12,13,16,0.22)_62%,rgba(12,13,16,0.52)_100%)]" />

                <img
                  src="/IMG/electricBike2.jpeg"
                  alt="Electric vehicle"
                  className="relative z-10 mx-auto h-[430px] w-full object-contain px-6 py-8 mix-blend-lighten opacity-[0.96] saturate-[1.03] contrast-[1.02] md:h-[540px]"
                />

                <div className="absolute bottom-5 left-5 z-20 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Design focus
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/80">
                    Clean silhouette, urban comfort
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Category
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-white">E-Bike</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Market
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-white">Urban mobility</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-white">Available now</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/38">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Electric collection
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                Financing available
                <ChevronRight className="h-3.5 w-3.5 text-brand" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;