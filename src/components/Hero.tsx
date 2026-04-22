import React from "react";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  onNavigate: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section
      id="inicio"
      className="min-h-screen flex items-center pt-32 pb-20 px-6"
    >
      <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>
          <p className="text-sm text-white/50 mb-4">
            Electric Mobility • Miami
          </p>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6">
            Electric <br />
            Performance <br />
            <span className="text-brand">Redefined</span>
          </h1>

          <p className="text-white/60 text-lg max-w-lg mb-10">
            Discover premium electric bikes, scooters and urban vehicles.
            Built for performance, designed for the future.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => onNavigate("catalogo")}
              className="bg-white text-black px-8 py-4 font-bold flex items-center gap-2"
            >
              View Catalog
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onNavigate("contacto")}
              className="border border-white/30 px-8 py-4 font-semibold text-white/80 hover:text-white"
            >
              Financing
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative">
          <img
            src="/IMG/electricBike2.jpeg"
            className="w-full object-contain"
          />
        </div>

      </div>
    </section>
  );
};

export default Hero;