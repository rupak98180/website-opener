import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, Settings, Globe, Clock, Timer } from "lucide-react";

interface TestConfigurationProps {
  onStartTest: (config: TestConfig) => void;
  onStopTest: () => void;
  isRunning: boolean;
}

export interface TestConfig {
  websites: string[];
  timeout: number;
  delay: number;
}

export function TestConfiguration({ onStartTest, onStopTest, isRunning }: TestConfigurationProps) {
  const [websites, setWebsites] = useState(`https://cnn.com
https://github.com
https://stackoverflow.com
https://youtube.com
https://bbc.com
https://reuters.com
https://apnews.com
https://nytimes.com
https://washingtonpost.com
https://theguardian.com`);
  const [timeout, setTimeout] = useState(10);
  const [delay, setDelay] = useState(3);

  const handleStart = () => {
    const websiteList = websites
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (websiteList.length === 0) {
      alert('Please enter at least one website URL');
      return;
    }

    onStartTest({
      websites: websiteList,
      timeout,
      delay
    });
  };

  return (
    <div className="bg-gradient-card rounded-2xl p-4 md:p-6 shadow-lg border border-border/50">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Test Configuration</h3>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="websites" className="flex items-center gap-2 text-sm md:text-base">
            <Globe className="h-3 w-3 md:h-4 md:w-4" />
            Website URLs (one per line)
          </Label>
          <Textarea
            id="websites"
            value={websites}
            onChange={(e) => setWebsites(e.target.value)}
            placeholder="https://example.com
https://google.com
https://github.com"
            className="min-h-[100px] md:min-h-[120px] font-mono text-xs md:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeout" className="flex items-center gap-2 text-sm md:text-base">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              Timeout (seconds)
            </Label>
            <Input
              id="timeout"
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(Number(e.target.value))}
              min={5}
              max={30}
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay" className="flex items-center gap-2 text-sm md:text-base">
              <Timer className="h-3 w-3 md:h-4 md:w-4" />
              Delay between sites (seconds)
            </Label>
            <Input
              id="delay"
              type="number"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              min={1}
              max={10}
              className="text-sm md:text-base"
            />
          </div>
        </div>

        <div className="pt-2 md:pt-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-4 md:py-6 text-base md:text-lg shadow-glow transition-all"
            >
              <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Start Browser Tab Testing
            </Button>
          ) : (
            <Button
              onClick={onStopTest}
              variant="destructive"
              className="w-full font-semibold py-4 md:py-6 text-base md:text-lg"
            >
              <Square className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Stop Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}