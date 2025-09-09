import { Info, AlertTriangle, Globe, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InfoAlerts() {
  return (
    <div className="space-y-4">
      <Alert className="border-info/20 bg-info/5">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-info-foreground/80">
          <strong className="text-info">How it works:</strong> Each website will open in a new browser tab (like real browsing). 
          The tool measures network request timing and connectivity. Please allow pop-ups for this site.
        </AlertDescription>
      </Alert>

      <Alert className="border-warning/20 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning-foreground/80">
          <strong className="text-warning">Browser Note:</strong> Your browser may block pop-ups by default. 
          Click "Allow" when prompted, or manually allow pop-ups for this site in your browser settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}