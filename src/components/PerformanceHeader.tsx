import { Activity, Globe, Zap } from "lucide-react";

export function PerformanceHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-t-3xl p-4 md:p-8 text-center text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="p-2 md:p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Globe className="h-6 w-6 md:h-8 md:w-8" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
          Vaibhi Web Open Test Tool
        </h1>
        <p className="text-white/90 text-sm md:text-lg max-w-2xl mx-auto px-2">
          Design by Rupak for testing web browser success rate.

        </p>
      </div>
    </div>
  );
}