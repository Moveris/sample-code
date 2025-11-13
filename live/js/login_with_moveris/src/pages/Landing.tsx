import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Traiders</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Smart Trading with
              <span className="text-primary"> AI-Powered</span> Verification
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience secure, verified trading with advanced identity verification and personalized trading strategies.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/register")} className="group">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure Verification</h3>
            <p className="text-muted-foreground">
              AI-powered identity verification ensures your account security
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Smart Trading</h3>
            <p className="text-muted-foreground">
              Personalized strategies based on your risk profile and goals
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Instant Processing</h3>
            <p className="text-muted-foreground">
              Quick onboarding and real-time verification
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Traiders. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
