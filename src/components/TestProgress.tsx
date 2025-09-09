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
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gradient-card rounded-2xl p-6 shadow-lg border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold">Testing Progress</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {currentTest} / {totalTests}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-3 mb-2" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Math.round(progress)}% Complete</span>
          <span>{totalTests - currentTest} remaining</span>
        </div>
      </div>

      {/* Current Test */}
      {currentUrl && (
        <div className="bg-gradient-card rounded-2xl p-6 shadow-lg border-2 border-primary/20 animate-pulse-glow">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full animate-bounce-subtle">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 break-all">
                {currentUrl}
              </h3>
              <p className="text-muted-foreground mb-4">
                {currentStatus || "Opening in new browser tab..."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold">
              <Timer className="h-4 w-4" />
              {elapsed.toFixed(2)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}