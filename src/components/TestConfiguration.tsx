import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, Settings, Globe, Clock, Timer } from "lucide-react";

// Add this import at the top of the file
import { OverlayPermission } from '../lib/overlay-permission';

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
  const [websites, setWebsites] = useState(`https://www.indiatoday.in/
https://cnn.com
https://github.com
https://stackoverflow.com
https://bbc.com
https://reuters.com
https://apnews.com
https://nytimes.com
https://washingtonpost.com
https://theguardian.com`);
  const [timeout, setTimeout] = useState(10);
  const [delay, setDelay] = useState(5);

  const websitePool = [
    "https://google.com",
    "https://bbc.com",
    "https://cnn.com",
    "https://twitter.com",
    "https://github.com",
    "https://stackoverflow.com",
    "https://wikipedia.org",
    "https://bbc.com",
    "https://cnn.com",
    "https://nytimes.com",
    "https://theguardian.com",
    "https://washingtonpost.com",
    "https://reuters.com",
    "https://apnews.com",
    "https://bloomberg.com",
    "https://aljazeera.com",
    "https://yahoo.com",
    "https://microsoft.com",
    "https://apple.com",
    "https://amazon.com",
    "https://apnews.com",
    "https://spotify.com",
    "https://reddit.com",
    "https://medium.com",
    "https://producthunt.com",
    "https://news.ycombinator.com",
    "https://cloudflare.com",
    "https://discord.com",
    "https://slack.com",
    "https://zoom.us",
    "https://whatsapp.com",
    "https://telegram.org",
    "https://linkedin.com",
    "https://paypal.com",
    "https://stripe.com",
    "https://shopify.com",
    "https://salesforce.com",
    "https://openai.com",
    "https://npmjs.com",
    "https://pypi.org",
    "https://rust-lang.org",
    "https://go.dev",
    "https://kotlinlang.org",
    "https://android.com",
    "https://developer.apple.com",
    "https://ubuntu.com",
    "https://debian.org",
    "https://archlinux.org",
    "https://docker.com",
    "https://kubernetes.io",
    "https://grafana.com",
    "https://prometheus.io",
    "https://elastic.co",
    "https://mozilla.org",
    "https://firefox.com",
    "https://opera.com",
    "https://edge.microsoft.com",
    "https://selenium.dev",
  ];

  const generateBundle = (count: number) => {
    const shuffled = [...websitePool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    setWebsites(selected.join("\n"));
  };

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
          <div className="flex flex-wrap gap-2">
            {[10, 20, 30].map((size) => (
              <Button key={size} variant="outline" className="px-3 py-2 text-sm" onClick={() => generateBundle(size)}>
                {size} URLs
              </Button>
            ))}
          </div>
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
            <Label className="flex items-center gap-2 text-sm md:text-base">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              Timeout (seconds)
            </Label>
            <div className="flex flex-wrap gap-2">
              {[10,20,30,40,50,60].map((t) => (
                <Button
                  key={t}
                  variant={timeout === t ? "default" : "outline"}
                  onClick={() => setTimeout(t)}
                  className="px-3 py-2 text-sm"
                >
                  {t}
                </Button>
              ))}
            </div>
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

// Add this function to your component
const requestOverlayPermission = async () => {
  try {
    const { value } = await OverlayPermission.requestPermission();
    if (value) {
      console.log('Overlay permission granted');
      // Continue with your app logic
    } else {
      console.log('Overlay permission denied');
      // Handle the case when permission is denied
    }
  } catch (error) {
    console.error('Error requesting overlay permission:', error);
  }
};

// Call this function when appropriate, for example in a useEffect or button click
// useEffect(() => {
//   requestOverlayPermission();
// }, []);