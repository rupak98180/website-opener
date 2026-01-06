import { CheckCircle, XCircle, ExternalLink, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface TestResult {
  url: string;
  loadTime?: number;
  success: boolean;
  opened: boolean;
  error?: string;
  startedAt?: string;
  endedAt?: string;
}

interface TestResultsProps {
  results: TestResult[];
  logs?: { time: string; event: string }[];
}

export function TestResults({ results, logs = [] }: TestResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  const openedTests = results.filter(r => r.opened);

  const getStatusIcon = (result: TestResult) => {
    if (!result.success) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (result.opened) {
      return <ExternalLink className="h-5 w-5 text-info" />;
    }
    return <CheckCircle className="h-5 w-5 text-success" />;
  };

  const getStatusBadge = (result: TestResult) => {
    if (!result.success) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (result.opened) {
      return <Badge className="bg-info text-info-foreground">Opened</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">Success</Badge>;
  };

  const getLoadTimeColor = (ms?: number) => {
    if (!ms) return "text-muted-foreground";
    if (ms < 200) return "text-success";
    if (ms < 1000) return "text-warning";
    return "text-destructive";
  };

  const handleExport = async () => {
    const resultRows = results.map((r) => ({
      URL: r.url,
      StartedAt: r.startedAt || "",
      EndedAt: r.endedAt || "",
      DurationSeconds: typeof r.loadTime === "number" ? r.loadTime.toFixed(2) : "",
      Success: r.success ? "Yes" : "No",
      Opened: r.opened ? "Yes" : "No",
      Error: r.error || "",
    }));

    const logRows = logs.map((l) => ({ Time: l.time, Event: l.event }));

    const wb = XLSX.utils.book_new();
    const wsResults = XLSX.utils.json_to_sheet(resultRows);
    XLSX.utils.book_append_sheet(wb, wsResults, "Results");
    const wsLogs = XLSX.utils.json_to_sheet(logRows);
    XLSX.utils.book_append_sheet(wb, wsLogs, "Logs");

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `web-open-test-${ts}.xlsx`;

    if (Capacitor.isNativePlatform()) {
      try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: wbout,
          directory: Directory.Documents,
        });

        await Share.share({
          title: 'Test Results',
          text: 'Here are the test results',
          url: savedFile.uri,
          dialogTitle: 'Share Test Results',
        });
      } catch (e: any) {
        console.error('Error saving file', e);
        alert('Error saving file: ' + (e.message || e));
      }
    } else {
      XLSX.writeFile(wb, fileName);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Statistics */}
      {successfulTests.length > 0 && (
        <div className="bg-gradient-secondary rounded-2xl p-4 md:p-6 text-white shadow-success">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
            <h3 className="text-lg md:text-xl font-semibold">Test Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold">{successfulTests.length}</div>
              <div className="text-xs md:text-sm opacity-90">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold">{failedTests.length}</div>
              <div className="text-xs md:text-sm opacity-90">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold">{openedTests.length}</div>
              <div className="text-xs md:text-sm opacity-90">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold">
                {successfulTests.length > 0 
                  ? (successfulTests.reduce((sum, r) => sum + (r.loadTime || 0), 0) / successfulTests.length).toFixed(2)
                  : 0
                }s
              </div>
              <div className="text-xs md:text-sm opacity-90">Avg Response</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Results */}
      <div className="bg-gradient-card rounded-2xl p-4 md:p-6 shadow-lg border border-border/50">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold">Test Results</h3>
          </div>
          <Button onClick={handleExport} className="text-sm md:text-base">Export Excel</Button>
        </div>

        <div className="space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-background/50 rounded-xl p-3 md:p-4 border border-border/30 hover:border-border/60 transition-colors"
            >
              <div className="flex items-start gap-2 md:gap-3">
                <div className="mt-1">
                  {getStatusIcon(result)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 md:mb-2 flex-wrap">
                    <span className="font-medium text-foreground truncate text-sm md:text-base">
                      {result.url}
                    </span>
                    {getStatusBadge(result)}
                  </div>
                  
                  {result.success ? (
                    <div className={`text-xs md:text-sm font-medium ${getLoadTimeColor(result.loadTime)}`}>
                      {Capacitor.isNativePlatform() ? "Load Time" : "Load Time"}: {result.loadTime?.toFixed(2)}s
                      {result.opened && (
                        <span className="text-info ml-2 block md:inline">(Opened in browser tab)</span>
                      )}
                      {result.startedAt && result.endedAt && (
                        <div className="text-muted-foreground mt-1">
                          Start: {new Date(result.startedAt).toLocaleString()} · End: {new Date(result.endedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-destructive">
                      <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="break-words">{result.error}</span>
                      {result.startedAt && result.endedAt && (
                        <span className="text-muted-foreground block md:inline ml-2">Start: {new Date(result.startedAt).toLocaleString()} · End: {new Date(result.endedAt).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
