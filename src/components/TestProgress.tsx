import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Globe, Timer, Activity } from "lucide-react";

interface TestProgressProps {
  isRunning: boolean;
  currentTest: number;
  totalTests: number;
  currentUrl?: string;
  currentStatus?: string;
}

export function TestProgress({ 
  isRunning, 
  currentTest, 
  totalTests, 
  currentUrl, 
  currentStatus 
}: TestProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  const progress = totalTests > 0 ? (currentTest / totalTests) * 100 : 0;

  useEffect(() => {
    if (isRunning && currentUrl) {
      setLoadStartTime(performance.now());
      setElapsed(0);
    }
  }, [currentUrl, isRunning]);

  useEffect(() => {
    if (isRunning && loadStartTime) {
      const interval = setInterval(() => {
        setElapsed((performance.now() - loadStartTime) / 1000);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [isRunning, loadStartTime]);

  if (!isRunning) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress Bar */}
      <div className="bg-gradient-card rounded-2xl p-4 md:p-6 shadow-lg border border-border/50">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span className="font-semibold text-sm md:text-base">Testing Progress</span>
          </div>
          <Badge variant="outline" className="text-xs md:text-sm">
            {currentTest} / {totalTests}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2 md:h-3 mb-2" />
        
        <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
          <span>{Math.round(progress)}% Complete</span>
          <span>{totalTests - currentTest} remaining</span>
        </div>
      </div>

      {/* Current Test */}
      {currentUrl && (
        <div className="bg-gradient-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-primary/20 animate-pulse-glow">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full animate-bounce-subtle">
              <Globe className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 break-all px-2">
                {currentUrl}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 px-2">
                {currentStatus || "Opening in new browser tab..."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 md:px-4 md:py-2 rounded-full font-semibold text-sm md:text-base">
              <Timer className="h-3 w-3 md:h-4 md:w-4" />
              {elapsed.toFixed(2)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}