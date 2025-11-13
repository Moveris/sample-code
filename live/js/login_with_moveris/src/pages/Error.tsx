import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Traiders</span>
          </div>
          <div className="mb-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          </div>
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>We were unable to verify your identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold mb-2 text-destructive">Why did this happen?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>The video quality may have been too low</li>
              <li>AI-generated or manipulated video was detected</li>
              <li>The document did not match the live video</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/onboarding")}>
              Try Again
            </Button>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Error;
