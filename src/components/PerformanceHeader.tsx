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
          <div className="flex items-center gap-1">
            <Activity className="h-5 w-5 md:h-6 md:w-6 animate-pulse" />
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
          Website Performance Tool
        </h1>
        <p className="text-white/90 text-sm md:text-lg max-w-2xl mx-auto px-2">
          Opens websites in real browser tabs and measures performance with real-time latency monitoring
        </p>
      </div>
    </div>
  );
}