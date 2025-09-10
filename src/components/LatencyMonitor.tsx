import { useState, useEffect } from "react";
import { Wifi, Server, Zap, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LatencyMonitorProps {
  isRunning: boolean;
}

export function LatencyMonitor({ isRunning }: LatencyMonitorProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [server, setServer] = useState("https://httpbin.org/get");
  const [isError, setIsError] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);

  const serverPresets = [
    { name: "HTTPBin", url: "https://httpbin.org/get" },
    { name: "JSONPlaceholder", url: "https://jsonplaceholder.typicode.com/posts/1" },
    { name: "GitHub API", url: "https://api.github.com" },
    { name: "HTTPStat", url: "https://httpstat.us/200" },
    { name: "ReqRes", url: "https://reqres.in/api/users" },
  ];

  const updateLatency = async () => {
    setIsError(false);
    const start = performance.now();
    
    try {
      await fetch(server, { mode: 'cors' });
      const result = Math.round(performance.now() - start);
      setLatency(result);
      setLatencyHistory(prev => [...prev.slice(-19), result]); // Keep last 20 readings
    } catch {
      // Fallback method
      const img = new Image();
      const imgStart = performance.now();
      img.onload = img.onerror = () => {
        const result = Math.round(performance.now() - imgStart);
        setLatency(result);
        setLatencyHistory(prev => [...prev.slice(-19), result]); // Keep last 20 readings
      };
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      setIsError(true);
    }
  };

  const getLatencyStatus = (ms: number | null) => {
    if (!ms) return "text-muted-foreground";
    if (ms < 100) return "text-success";
    if (ms < 300) return "text-warning";
    return "text-destructive";
  };

  const getLatencyLabel = (ms: number | null) => {
    if (!ms) return "Testing...";
    if (ms < 100) return "Excellent";
    if (ms < 300) return "Good";
    return "Slow";
  };

  useEffect(() => {
    if (isRunning || isMonitoring) {
      updateLatency();
      const interval = setInterval(updateLatency, 2000); // Every 2 seconds for more responsive monitoring
      return () => clearInterval(interval);
    }
  }, [server, isRunning, isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    setLatencyHistory([]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  return (
    <div className="bg-gradient-card rounded-2xl p-4 md:p-6 shadow-lg border border-border/50">
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wifi className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Latency Monitor</h3>
        </div>
        
        <div className="flex items-center gap-2 flex-1 max-w-full md:max-w-md w-full md:w-auto">
          <Server className="h-4 w-4 text-muted-foreground hidden md:block" />
          <Input
            type="text"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="Enter server URL"
            className="flex-1 text-sm"
          />
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            size="sm"
            className={`${isMonitoring 
              ? 'bg-destructive hover:bg-destructive/80' 
              : 'bg-primary hover:bg-primary-hover'
            } text-primary-foreground px-2 md:px-4`}
          >
            <Zap className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline ml-1">
              {isMonitoring ? 'Stop' : 'Test'}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6 justify-center md:justify-start">
        {serverPresets.map((preset) => (
          <Button
            key={preset.name}
            onClick={() => setServer(preset.url)}
            variant="outline"
            size="sm"
            className="text-xs px-2 py-1"
          >
            {preset.name}
          </Button>
        ))}
      </div>

      <div className="text-center p-4 md:p-6 bg-background/50 rounded-xl border border-border/30">
        <div className={`text-3xl md:text-4xl font-bold mb-2 ${getLatencyStatus(latency)}`}>
          {latency ? `${latency} ms` : "-- ms"}
        </div>
        <div className="text-xs md:text-sm text-muted-foreground mb-1">Network Latency</div>
        <div className={`text-xs md:text-sm font-medium ${getLatencyStatus(latency)}`}>
          {getLatencyLabel(latency)}
        </div>
        {isError && (
          <div className="text-xs text-warning mt-2">
            Using fallback measurement
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2 truncate px-2">
          Testing: {server}
        </div>
        
        {/* Latency History Graph */}
        {latencyHistory.length > 1 && (isMonitoring || isRunning) && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Latency History</div>
            <div className="flex items-end justify-center gap-1 h-16 bg-background/30 rounded-lg p-2">
              {latencyHistory.map((value, index) => {
                const height = Math.max(4, (value / Math.max(...latencyHistory)) * 48);
                return (
                  <div
                    key={index}
                    className={`w-1 rounded-sm ${getLatencyStatus(value).replace('text-', 'bg-')}`}
                    style={{ height: `${height}px` }}
                    title={`${value}ms`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg: {(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length).toFixed(0)}ms
              | Min: {Math.min(...latencyHistory)}ms
              | Max: {Math.max(...latencyHistory)}ms
            </div>
          </div>
        )}
        
        {(isRunning || isMonitoring) && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={stopMonitoring}
              variant="outline"
              size="sm"
              className="text-xs md:text-sm"
            >
              <Square className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Stop Monitor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}