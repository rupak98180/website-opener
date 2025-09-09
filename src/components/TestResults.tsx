import { CheckCircle, XCircle, ExternalLink, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TestResult {
  url: string;
  loadTime?: number;
  success: boolean;
  opened: boolean;
  error?: string;
}

interface TestResultsProps {
  results: TestResult[];
}

export function TestResults({ results }: TestResultsProps) {
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

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {successfulTests.length > 0 && (
        <div className="bg-gradient-secondary rounded-2xl p-6 text-white shadow-success">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Test Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{successfulTests.length}</div>
              <div className="text-sm opacity-90">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{failedTests.length}</div>
              <div className="text-sm opacity-90">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{openedTests.length}</div>
              <div className="text-sm opacity-90">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {successfulTests.length > 0 
                  ? Math.round(successfulTests.reduce((sum, r) => sum + (r.loadTime || 0), 0) / successfulTests.length)
                  : 0
                }ms
              </div>
              <div className="text-sm opacity-90">Avg Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Results */}
      <div className="bg-gradient-card rounded-2xl p-6 shadow-lg border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Test Results</h3>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-background/50 rounded-xl p-4 border border-border/30 hover:border-border/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(result)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground truncate">
                      {result.url}
                    </span>
                    {getStatusBadge(result)}
                  </div>
                  
                  {result.success ? (
                    <div className={`text-sm font-medium ${getLoadTimeColor(result.loadTime)}`}>
                      Network Time: {result.loadTime?.toFixed(2)}ms
                      {result.opened && (
                        <span className="text-info ml-2">(Opened in browser tab)</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      {result.error}
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