import { useState, useRef } from "react";
import { PerformanceHeader } from "@/components/PerformanceHeader";
import { LatencyMonitor } from "@/components/LatencyMonitor";
import { TestConfiguration, TestConfig } from "@/components/TestConfiguration";
import { TestProgress } from "@/components/TestProgress";
import { TestResults, TestResult } from "@/components/TestResults";
import { useToast } from "@/hooks/use-toast";
import { CapacitorHttp, Capacitor } from '@capacitor/core';

export default function PerformanceTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [currentStatus, setCurrentStatus] = useState<string>();
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<{ time: string; event: string }[]>([]);
  const openedWindowsRef = useRef<Window[]>([]);
  const isRunningRef = useRef(false);
  const { toast } = useToast();

  const addLog = (event: string) => {
    setLogs((prev) => [...prev, { time: new Date().toISOString(), event }]);
  };

  const testWebsite = async (url: string, timeout: number): Promise<TestResult> => {
    const startTime = performance.now();
    const wallStart = new Date().toISOString();
    const timeoutMs = timeout * 1000;

    // Check for internet connection immediately
    if (!navigator.onLine) {
      return {
        url,
        success: false,
        opened: false,
        error: 'No Internet Connection',
        startedAt: wallStart,
        endedAt: new Date().toISOString()
      };
    }

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      // Test network connectivity and download HTML
      // We use CapacitorHttp on native to ensure full HTML download and bypass CORS
      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.get({
          url,
          readTimeout: timeoutMs,
          connectTimeout: timeoutMs
        });

        if (response.status < 200 || response.status >= 400) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        // If successful, HTML body is downloaded in response.data
      } else {
        // Fallback for Web/Dev environment (limited by CORS)
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        await fetch(url, { 
          mode: 'no-cors', 
          method: 'GET', // Changed from HEAD to GET to attempt full download
          signal: controller.signal
        });
        clearTimeout(id);
      }

      // Try to open in new tab
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      if (newWindow) {
        openedWindowsRef.current.push(newWindow);
        window.focus();
        
        // Wait for page to load or timeout (Best effort for cross-origin)
        try {
          await new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
              try {
                if (newWindow.closed) {
                  clearInterval(checkInterval);
                  resolve(undefined);
                  return;
                }
                
                // Only works for same-origin
                if (newWindow.document.readyState === 'complete') {
                  clearInterval(checkInterval);
                  resolve(undefined);
                }
              } catch {
                // Cross-origin: We already verified HTML download via CapacitorHttp
                clearInterval(checkInterval);
                resolve(undefined);
              }
            }, 100);
            
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve(undefined);
            }, 3000); // Give it a moment to render visually
          });
        } catch {
          // Ignore
        }
        
        const totalTime = performance.now() - startTime;
        return { url, loadTime: totalTime / 1000, success: true, opened: true, startedAt: wallStart, endedAt: new Date().toISOString() };
      } else {
        // Window failed to open
        const totalTime = performance.now() - startTime;
        return { url, loadTime: totalTime / 1000, success: true, opened: false, startedAt: wallStart, endedAt: new Date().toISOString() };
      }
    } catch (error) {
      // If network test failed (including non-200 status on native)
      // Try to open the window anyway for visual confirmation of error
      try {
        const newWindow = window.open(url, '_blank', 'width=1200,height=800');
        if (newWindow) {
          openedWindowsRef.current.push(newWindow);
          window.focus();
        }
      } catch {
        // Ignore
      }

      return { 
        url, 
        success: false, 
        opened: false, 
        error: error instanceof Error ? error.message : 'Network test failed',
        startedAt: wallStart,
        endedAt: new Date().toISOString()
      };
    }
  };

  const handleStartTest = async (config: TestConfig) => {
    // Check for internet connection before starting
    if (!navigator.onLine) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      addLog("Test failed: No internet connection");
      return;
    }

    // Check if pop-ups are likely blocked
    const testWindow = window.open('', '_blank', 'width=1,height=1');
    if (!testWindow) {
      toast({
        title: "Pop-ups Blocked",
        description: "Pop-ups are blocked! Please allow pop-ups for this site to see websites open in browser tabs. The test will still measure network performance.",
        variant: "destructive",
      });
      addLog("Pop-ups blocked by browser");
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
    addLog(`Test started for ${config.websites.length} websites`);

    // const delayMs = config.delay * 1000; // Using timeout as the pacing mechanism instead of delay
    // const baseStart = performance.now();

    for (let i = 0; i < config.websites.length; i++) {
      if (!isRunningRef.current) break;

      const testStart = performance.now();
      const url = config.websites[i];
      setCurrentTest(i + 1);
      setCurrentUrl(url);
      setCurrentStatus(`Opening in browser tab... (${i + 1}/${config.websites.length})`);
      addLog(`Opening ${url}`);

      try {
        const result = await testWebsite(url, config.timeout);
        setResults(prev => [...prev, result]);
        addLog(`Success: ${url} opened=${result.opened} duration=${result.loadTime?.toFixed(2)}s`);
      } catch (error) {
        const errorResult: TestResult = {
          url,
          success: false,
          opened: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        setResults(prev => [...prev, errorResult]);
        addLog(`Error: ${url} - ${errorResult.error}`);
      }

      // Wait for the remainder of the timeout period before starting the next test
      if (i < config.websites.length - 1 && isRunningRef.current) {
        const testEnd = performance.now();
        const elapsed = testEnd - testStart;
        const timeoutMs = config.timeout * 1000;
        const waitMs = timeoutMs - elapsed;

        if (waitMs > 0) {
          setCurrentStatus(`Waiting ${(waitMs / 1000).toFixed(1)}s before next website...`);
          addLog(`Waiting ${(waitMs / 1000).toFixed(1)}s before next website`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
      }
    }

    setCurrentUrl(undefined);
    setCurrentStatus(undefined);
    setIsRunning(false);
    isRunningRef.current = false;
    addLog("Test completed");

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
    addLog("Test stopped by user");
    
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
            
            <TestResults results={results} logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}