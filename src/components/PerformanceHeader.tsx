import { Activity, Globe, Zap } from "lucide-react";

export function PerformanceHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-t-3xl p-8 text-center text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Globe className="h-8 w-8" />
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-6 w-6 animate-pulse" />
            <Zap className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Website Performance Tool
        </h1>
        <p className="text-white/90 text-lg max-w-2xl mx-auto">
          Opens websites in real browser tabs and measures performance with real-time latency monitoring
        </p>
      </div>
    </div>
  );
}