import { useState, useRef } from "react";
import { PerformanceHeader } from "@/components/PerformanceHeader";
import { InfoAlerts } from "@/components/InfoAlerts";
import { LatencyMonitor } from "@/components/LatencyMonitor";
import { TestConfiguration, TestConfig } from "@/components/TestConfiguration";
import { TestProgress } from "@/components/TestProgress";
import { TestResults, TestResult } from "@/components/TestResults";
import { useToast } from "@/hooks/use-toast";

export default function PerformanceTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [currentStatus, setCurrentStatus] = useState<string>();
  const [results, setResults] = useState<TestResult[]>([]);
  const openedWindowsRef = useRef<Window[]>([]);
  const isRunningRef = useRef(false);
  const { toast } = useToast();

  const testWebsite = async (url: string, timeout: number): Promise<TestResult> => {
    const startTime = performance.now();
    const timeoutMs = timeout * 1000;

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      // Test network connectivity
      const fetchStart = performance.now();
      await Promise.race([
        fetch(url, { mode: 'no-cors', method: 'HEAD' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)
        )
      ]);
      const networkTime = performance.now() - fetchStart;

      // Try to open in new tab and wait for load
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      if (newWindow) {
        openedWindowsRef.current.push(newWindow);
        
        // Wait for page to load or timeout
        try {
          await new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
              try {
                if (newWindow.closed) {
                  clearInterval(checkInterval);
                  resolve(undefined);
                  return;
                }
                // Check if page is loaded (this will throw if cross-origin)
                if (newWindow.document.readyState === 'complete') {
                  clearInterval(checkInterval);
                  resolve(undefined);
                }
              } catch {
                // Cross-origin, wait for estimated load time
                clearInterval(checkInterval);
                setTimeout(resolve, 3000); // Wait 3 seconds for load
              }
            }, 100);
            
            // Timeout after specified time
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve(undefined);
            }, timeoutMs);
          });
        } catch {
          // Ignore load check errors
        }
        
        const totalTime = performance.now() - startTime;
        return { url, loadTime: totalTime / 1000, success: true, opened: true }; // Convert to seconds
      } else {
        return { url, loadTime: networkTime / 1000, success: true, opened: false }; // Convert to seconds
      }
    } catch (error) {
      // Try opening the URL anyway
      try {
        const newWindow = window.open(url, '_blank', 'width=1200,height=800');
        if (newWindow) {
          openedWindowsRef.current.push(newWindow);
          
          // Wait for estimated load time
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const estimatedTime = performance.now() - startTime;
          return { url, loadTime: estimatedTime / 1000, success: true, opened: true }; // Convert to seconds
        } else {
          return { 
            url, 
            success: false, 
            opened: false, 
            error: 'Unable to open website and network test failed' 
          };
        }
      } catch {
        return { 
          url, 
          success: false, 
          opened: false, 
          error: error instanceof Error ? error.message : 'Network error' 
        };
      }
    }
  };

  const handleStartTest = async (config: TestConfig) => {
    // Check if pop-ups are likely blocked
    const testWindow = window.open('', '_blank', 'width=1,height=1');
    if (!testWindow) {
      toast({
        title: "Pop-ups Blocked",
        description: "Pop-ups are blocked! Please allow pop-ups for this site to see websites open in browser tabs. The test will still measure network performance.",
        variant: "destructive",
      });
    } else {
      testWindow.close();
    }

    setIsRunning(true);
    isRunningRef.current = true;
    setCurrentTest(0);
    setTotalTests(config.websites.length);
    setResults([]);
    openedWindowsRef.current = [];

    toast({
      title: "Test Started",
      description: `Testing ${config.websites.length} websites in browser tabs...`,
    });

    for (let i = 0; i < config.websites.length; i++) {
      if (!isRunningRef.current) break;

      const url = config.websites[i];
      setCurrentTest(i + 1);
      setCurrentUrl(url);
      setCurrentStatus(`Opening in browser tab... (${i + 1}/${config.websites.length})`);

      try {
        const result = await testWebsite(url, config.timeout);
        setResults(prev => [...prev, result]);
      } catch (error) {
        const errorResult: TestResult = {
          url,
          success: false,
          opened: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        setResults(prev => [...prev, errorResult]);
      }

      // Delay between tests (except for the last one)
      if (isRunningRef.current && i < config.websites.length - 1) {
        setCurrentStatus(`Waiting ${config.delay}s before next website...`);
        await new Promise(resolve => setTimeout(resolve, config.delay * 1000));
      }
    }

    setCurrentUrl(undefined);
    setCurrentStatus(undefined);
    setIsRunning(false);
    isRunningRef.current = false;

    toast({
      title: "Test Completed",
      description: "All websites have been tested!",
    });
  };

  const handleStopTest = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setCurrentUrl(undefined);
    setCurrentStatus(undefined);
    
    toast({
      title: "Test Stopped",
      description: "Website testing has been stopped.",
    });
  };


  // Clean up opened windows on unmount
  const cleanupWindows = () => {
    openedWindowsRef.current.forEach(window => {
      if (window && !window.closed) {
        window.close();
      }
    });
    openedWindowsRef.current = [];
  };

  // Handle page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupWindows);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-6xl p-2 md:p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-border/20">
          <PerformanceHeader />
          
          <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            <InfoAlerts />
            
            <LatencyMonitor isRunning={isRunning} />
            
            <TestConfiguration
              onStartTest={handleStartTest}
              onStopTest={handleStopTest}
              isRunning={isRunning}
            />
            
            <TestProgress
              isRunning={isRunning}
              currentTest={currentTest}
              totalTests={totalTests}
              currentUrl={currentUrl}
              currentStatus={currentStatus}
            />
            
            <TestResults results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}