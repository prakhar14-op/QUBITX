import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, Banknote, ArrowRight } from 'lucide-react';
import Dither from './components/Dither';
import { Navbar } from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import CreditReliabilityMesh from './components/CreditMesh';
import { HeroSection, HeroSplineBackground, HeroContent } from './components/ui/galaxy-interactive-hero-section';

// Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const terminalRef = useRef(null);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white font-sans selection:bg-[var(--cyber-green)] selection:text-black">

      {/* 1. Global Background (Fixed Spline Galaxy) */}
      <div className="fixed inset-0 z-0 bg-black">
        <HeroSplineBackground />
      </div>

      {/* Navbar (Fixed on top of background) */}
      <div className="relative z-50">
        <Navbar onNavigate={setCurrentView} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {currentView === 'demo' ? (
          <UserDashboard onBack={() => setCurrentView('home')} />
        ) : currentView === 'mesh' ? (
          <CreditReliabilityMesh onBack={() => setCurrentView('home')} />
        ) : (
          <>
            {/* Landing Page Content */}
            <div className="relative w-full h-screen pointer-events-none flex flex-col justify-center">
              <HeroContent />
            </div>

            {/* Main Content Scroll Wrapper */}
            <main className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 max-w-7xl mx-auto space-y-32 pb-24 bg-black/60 backdrop-blur-xl rounded-t-3xl border-t border-white/10 pt-24 mt-[-10vh]">


              {/* 3. 'How it Works' Section */}
              <section className="w-full" id="solution">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">The Agent Swarm</h2>
                  <p className="text-gray-300 text-lg">Three autonomous agents handling every transaction.</p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                >
                  {/* Card 1: Broker Agent */}
                  <GlassCard
                    icon={<Search className="w-8 h-8 text-[var(--cyber-green)]" />}
                    title="Broker Agent"
                    description="Verifies market prices and instantly generates purchase orders to ensure fair value."
                  />

                  {/* Card 2: Escrow Agent */}
                  <GlassCard
                    icon={<Lock className="w-8 h-8 text-[var(--neon-purple)]" />}
                    title="Escrow Agent"
                    description="Pays vendors directly via UPI. The borrower never touches the cash, preventing misuse."
                  />

                  {/* Card 3: Recovery Agent */}
                  <GlassCard
                    icon={<Banknote className="w-8 h-8 text-[var(--deep-blue)]" />}
                    title="Recovery Agent"
                    description="Auto-deducts repayment from harvest sales before settlement via smart contracts."
                  />
                </motion.div>
              </section>


              {/* 4. Demo/Dashboard Preview (Terminal) */}
              <section className="w-full max-w-4xl mx-auto pb-24" id="features">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold">Live Protocol Activity</h2>
                </motion.div>

                <motion.div
                  className="w-full rounded-xl overflow-hidden glass-panel border-opacity-20 shadow-2xl backdrop-blur-xl bg-black/60"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Terminal Header */}
                  <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/10 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <div className="ml-4 text-xs font-mono text-white/40">purpose-pay-node — v1.0.4</div>
                  </div>

                  {/* Terminal Content */}
                  <div className="p-6 font-mono text-sm md:text-base space-y-4 text-left h-80 overflow-y-auto custom-scrollbar" ref={terminalRef}>
                    <TerminalLine
                      timestamp="10:42:05"
                      source="USER"
                      message="Requested loan for 50kg Urea @ Market Rate"
                      color="text-white"
                    />
                    <TerminalLine
                      timestamp="10:42:06"
                      source="SYSTEM"
                      message="Initializing agent swarm..."
                      color="text-gray-400"
                    />
                    <TerminalLine
                      timestamp="10:42:08"
                      source="kBROKER"
                      message="Price verified at ₹600/bag. Vendor #99 confirmed availability."
                      color="text-[var(--cyber-green)]"
                    />
                    <TerminalLine
                      timestamp="10:42:09"
                      source="ESCROW"
                      message="Funding locked. UPI Transaction initiated to Vendor #99."
                      color="text-[var(--neon-purple)]"
                    />
                    <TerminalLine
                      timestamp="10:42:11"
                      source="ESCROW"
                      message="Payment Successful. Transaction ID: #TXN-998822."
                      color="text-[var(--neon-purple)]"
                    />
                    <TerminalLine
                      timestamp="10:42:12"
                      source="RECOVERY"
                      message="Repayment schedule generated linked to HarvestID #H-2024."
                      color="text-[var(--deep-blue)]"
                    />
                    <TerminalLine
                      timestamp="10:42:12"
                      source="SYSTEM"
                      message="Transaction Complete. Order ready for pickup."
                      color="text-green-400"
                    />
                    <div className="animate-pulse text-[var(--cyber-green)] mt-4">_</div>
                  </div>
                </motion.div>
              </section>

            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full py-8 text-center text-white/30 text-sm border-t border-white/5 bg-black/20 backdrop-blur-sm">
              <p>&copy; 2024 PurposePay. Built for the Hackathon.</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

// Sub-components
function GlassCard({ icon, title, description }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="glass-card flex flex-col items-start text-left group overflow-hidden relative"
    >
      <div className="p-3 rounded-lg bg-white/5 mb-4 group-hover:bg-[var(--cyber-green)]/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--cyber-green)] transition-colors text-white">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>

      {/* Hover Glow Effect */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[var(--cyber-green)]/10 rounded-full blur-[80px] group-hover:bg-[var(--cyber-green)]/30 transition-all duration-500" />
    </motion.div>
  );
}

function TerminalLine({ timestamp, source, message, color }) {
  return (
    <div className="flex flex-col md:flex-row gap-1 md:gap-4 md:items-start text-opacity-90">
      <span className="text-white/50 shrink-0 text-xs py-1">[{timestamp}]</span>
      <div className="flex gap-2">
        <span className={`font-bold shrink-0 w-20 ${color}`}>{`> ${source}:`}</span>
        <span className="text-gray-200">{message}</span>
      </div>
    </div>
  );
}
