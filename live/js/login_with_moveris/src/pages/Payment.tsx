import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
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
            <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          </div>
          <CardTitle className="text-2xl">Verification Complete!</CardTitle>
          <CardDescription>Your identity has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/50 border">
              <h3 className="font-semibold mb-2">Selected Plan</h3>
              <p className="text-2xl font-bold text-primary">Premium Trading</p>
              <p className="text-sm text-muted-foreground">Full access to all features</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Fee</span>
                <span className="font-semibold">$99.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup Fee</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">$99.00/month</span>
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Proceed to Payment
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
