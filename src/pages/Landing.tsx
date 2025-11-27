import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldCheck, AlertTriangle, Eye, Lock, ArrowRight, CheckCircle2, Zap, Globe, Fingerprint, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black text-foreground flex flex-col overflow-hidden selection:bg-primary/30">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Floating Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl px-6"
      >
        <div className="backdrop-blur-xl bg-background/60 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center">
              <img 
                src="https://harmless-tapir-303.convex.cloud/api/storage/c989714f-70fe-4287-9b3a-f925f590d191" 
                alt="Veritas Logo" 
                className="h-[140%] w-[140%] object-cover object-top opacity-90 mix-blend-screen"
              />
            </div>
            <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
              Veritas
            </span>
          </div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                className="hidden md:flex text-muted-foreground hover:text-white hover:bg-white/5 rounded-full"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className="hidden md:flex text-muted-foreground hover:text-white hover:bg-white/5 rounded-full"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
            <Button 
              className="bg-primary hover:bg-primary/90 text-white border-none rounded-full px-6 shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-all duration-300"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            >
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 min-h-screen">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto space-y-8 flex flex-col items-center relative z-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium backdrop-blur-md cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">AI-Powered Detection Live</span>
          </motion.div>
          
          <div className="relative w-full flex flex-col items-center">
            <h1 className="relative z-10 text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]">
              <span className="block">Uncover the</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Hidden Truth
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The world's most advanced AI for detecting <span className="text-white font-medium">deepfakes</span> and <span className="text-white font-medium">misinformation</span>. Verify reality in milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 w-full max-w-md mx-auto">
            <Button 
              size="lg" 
              className="group relative bg-white text-black hover:bg-white/90 text-lg px-8 h-14 rounded-full overflow-hidden transition-all"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isAuthenticated ? "Go to Dashboard" : "Start Verifying"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 h-14 rounded-full border-white/20 bg-transparent hover:bg-white/5 hover:text-white backdrop-blur-sm transition-all"
            >
              View Live Demo
            </Button>
          </div>
        </motion.div>

        {/* Floating UI Elements */}
        <motion.div style={{ y: y1 }} className="absolute top-40 left-[10%] hidden lg:block">
          <FloatingCard icon={<AlertTriangle className="text-orange-500" />} title="Fake News" status="Detected" color="text-orange-500" />
        </motion.div>
        <motion.div style={{ y: y2 }} className="absolute bottom-40 right-[10%] hidden lg:block">
          <FloatingCard icon={<CheckCircle2 className="text-green-500" />} title="Verified Source" status="Confirmed" color="text-green-500" />
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Military-Grade Analysis</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Our proprietary algorithms analyze millions of data points to separate fact from fiction.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            <BentoCard 
              className="md:col-span-2"
              icon={<Globe className="h-8 w-8 text-primary" />}
              title="Global Network Scanning"
              description="Real-time cross-referencing against 50,000+ verified news sources worldwide."
              bgImage="radial-gradient(circle at top right, rgba(229, 9, 20, 0.15), transparent)"
            />
            <BentoCard 
              className="md:col-span-1"
              icon={<Fingerprint className="h-8 w-8 text-blue-400" />}
              title="Pixel Forensics"
              description="Detect invisible manipulation artifacts in images."
              bgImage="radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.15), transparent)"
            />
            <BentoCard 
              className="md:col-span-1"
              icon={<Zap className="h-8 w-8 text-yellow-400" />}
              title="Instant Results"
              description="Get verification scores in under 200ms."
              bgImage="radial-gradient(circle at top left, rgba(250, 204, 21, 0.15), transparent)"
            />
            <BentoCard 
              className="md:col-span-2"
              icon={<Activity className="h-8 w-8 text-green-400" />}
              title="AI Pattern Recognition"
              description="Advanced neural networks trained to spot deepfake signatures and synthetic media generation."
              bgImage="radial-gradient(circle at bottom right, rgba(74, 222, 128, 0.15), transparent)"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8 p-12 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to find the truth?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of journalists, researchers, and truth-seekers using Veritas today.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-white/90 text-lg px-10 h-16 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 font-bold text-xl">
            <img 
              src="https://harmless-tapir-303.convex.cloud/api/storage/c989714f-70fe-4287-9b3a-f925f590d191" 
              alt="Veritas Logo" 
              className="h-10 w-10 object-cover object-top opacity-80 hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(220,38,38,0.3)] rounded-full" 
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Veritas</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Veritas Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FloatingCard({ icon, title, status, color }: { icon: React.ReactNode, title: string, status: string, color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl w-64">
      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
        <p className={`text-sm font-bold ${color}`}>{status}</p>
      </div>
    </div>
  );
}

function BentoCard({ className, icon, title, description, bgImage }: { className?: string, icon: React.ReactNode, title: string, description: string, bgImage?: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`group relative p-8 rounded-3xl border border-white/10 bg-card overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: bgImage }}
      />
      <div className="relative z-10 mb-6 p-3 w-fit rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
        {icon}
      </div>
      <div className="relative z-10 space-y-2">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}