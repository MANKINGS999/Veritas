import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Eye, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-black text-white py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>TruthGuard</span>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-primary hover:bg-white/10"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white border-none"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100 via-background to-background -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-sm font-medium border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI-Powered Detection Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black">
            Detect Fake News & <br />
            <span className="text-primary">Morphed Images</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify the truth in seconds. Our advanced AI cross-checks global news networks and analyzes image patterns to expose manipulation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white text-lg px-8 h-14"
              onClick={() => navigate("/auth")}
            >
              Start Verifying Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 h-14 border-2"
            >
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/5 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<AlertTriangle className="h-10 w-10 text-primary" />}
            title="Fake News Detection"
            description="Cross-reference articles with CNN, ABC, Reuters, and other major networks instantly."
          />
          <FeatureCard 
            icon={<Eye className="h-10 w-10 text-primary" />}
            title="Image Forensics"
            description="Detect deepfakes and morphed images using pixel-level pattern analysis."
          />
          <FeatureCard 
            icon={<Lock className="h-10 w-10 text-primary" />}
            title="Secure Verification"
            description="Your checks are private and secure. We prioritize truth and privacy."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>TruthGuard</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2024 TruthGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-xl border shadow-sm hover:shadow-md transition-all"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}