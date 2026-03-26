'use client'

import React from 'react';
import { motion } from 'motion/react';
import {
  Layout,
  FileDown,
  Zap,
  Users,
  Music,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Footer } from './Footer';

interface LandingProps {
  onStart: () => void;
}

// Pre-configured rock band stage plot setup (to be replaced with 2D demo)
const LANDING_STAGE_PLOT: any = [
  {
    x: 51.88274108786931,
    y: 10.551932367149792,
    id: 'person-i0kaczwfs-1771633623189',
    type: 'person',
    label: 'Drummer',
    memberId: 'i0kaczwfs',
    isPeripheral: false,
  },
  {
    x: 16.89860079610786,
    y: 50.12151529961497,
    id: 'person-dvbxo4prq-1771633625433',
    type: 'person',
    label: 'Bassist',
    memberId: 'dvbxo4prq',
    isPeripheral: false,
  },
  {
    x: 13.437873406711919,
    y: 23.264631241643947,
    id: 'amp-dvbxo4prq-1771633625433-0-0',
    type: 'member',
    label: 'Amp',
    memberId: 'dvbxo4prq',
    isPeripheral: true,
    fromInstrumentIndex: 0,
  },
  {
    x: 11.207708476707701,
    y: 67.3378623188406,
    id: 'pedal-dvbxo4prq-1771633625433-0',
    type: 'member',
    label: 'Pedals',
    memberId: 'dvbxo4prq',
    isPeripheral: true,
    fromInstrumentIndex: 0,
  },
  {
    x: 80.82334073758153,
    y: 55.98383857450416,
    id: 'person-7bjtpzq6u-1771633627184',
    type: 'person',
    label: 'Guitarist',
    memberId: '7bjtpzq6u',
    isPeripheral: false,
  },
  {
    x: 88.25792489372168,
    y: 16.09921914823226,
    id: 'amp-7bjtpzq6u-1771633627184-0-0',
    type: 'member',
    label: 'Amp',
    memberId: '7bjtpzq6u',
    isPeripheral: true,
    fromInstrumentIndex: 0,
  },
  {
    x: 95.42902456688573,
    y: 51.17844202898555,
    id: 'pedal-7bjtpzq6u-1771633627184-0',
    type: 'member',
    label: 'Pedals',
    memberId: '7bjtpzq6u',
    isPeripheral: true,
    fromInstrumentIndex: 0,
  },
  {
    x: 52.2303298538215,
    y: 74.48438443116603,
    id: 'person-txa0opdqa-1771633629055',
    type: 'person',
    label: 'Lead Singer',
    memberId: 'txa0opdqa',
    isPeripheral: false,
  },
  {
    x: 42.23286807590819,
    y: 94.50649154589378,
    id: 'mon-1771633655806',
    type: 'monitor',
    label: 'Mon',
    rotation: 5.497787143782137,
    monitorNumber: 2,
  },
  {
    x: 62.20901930933085,
    y: 93.90473012031674,
    id: 'mon-1771633672914',
    type: 'monitor',
    label: 'Mon',
    rotation: 0.7853981633974492,
    monitorNumber: 2,
  },
  {
    x: 82.90382818881668,
    y: 88.08940428884725,
    id: 'mon-1771633693520',
    type: 'monitor',
    label: 'Mon',
    monitorNumber: 3,
  },
  {
    x: 64.96342206342266,
    y: 14.568559860433911,
    id: 'mon-1771633698897',
    type: 'monitor',
    label: 'Mon',
    rotation: 1.5707963267948983,
    monitorNumber: 4,
  },
  {
    x: 23.443045327536403,
    y: 88.17926649374002,
    id: 'mon-1771633713237',
    type: 'monitor',
    label: 'Mon',
    rotation: 0.3926990816987246,
    monitorNumber: 1,
  },
];

// --- Component: Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  asLink?: boolean;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const variants = {
      default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-colors duration-150',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200 transition-colors duration-150',
    };
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-12 rounded-md px-8 text-base',
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// --- Main Component ---
export const Landing: React.FC<LandingProps> = ({ onStart }) => {

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pb-32 md:pb-56">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 -left-40 md:left-1/4 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-32 md:right-1/4 -translate-y-1/2 w-[32rem] h-[32rem] bg-purple-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-48 md:right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 left-1/2 w-[40rem] h-[40rem] bg-purple-500/15 rounded-full blur-[120px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-50 flex flex-col items-center justify-start pt-24 flex-1 pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-indigo-400 text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              No Login Required
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
              Your Band Rider.
              <br />
              <span className="text-indigo-400">Done in 5 Minutes.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-200 mb-8 leading-relaxed">
              Drag, drop, and download. The fastest way to create professional stage plots and input lists for your next show.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-base h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
                onClick={onStart}
              >
                Create Your Rider
              </Button>
              <a href="/riders/bb5bb520-9f9f-4584-b549-da2be1fbff4d?share=f9055408-becc-4e06-a5bf-6a5a4801f0a2" target="_blank" rel="noopener noreferrer" className="pointer-events-auto">
                <Button
                  size="lg"
                  className="text-base h-12 px-8 bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-lg"
                >
                  View Example PDF
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900/30 border border-slate-800 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-48 md:-left-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 -right-40 md:right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-48 md:left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to get booked</h2>
            <p className="text-slate-400 text-lg">
              Stop using napkins and MS Paint. Give venues the professional documentation they expect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              title="Smart Input Lists"
              description="Automatically assigns standard mics (SM57, Beta52) and DI boxes based on your instrument selection."
            />
            <FeatureCard
              icon={<Layout className="w-6 h-6 text-indigo-400" />}
              title="Stage Designer"
              description="Visualize your setup with professional stage plots. Place monitors, power drops, and band members easily."
            />
            <FeatureCard
              icon={<FileDown className="w-6 h-6 text-emerald-400" />}
              title="Instant PDF Export"
              description="Download a complete technical packet with input list, stage plot, and rider notes in one click."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-pink-400" />}
              title="No Account Required"
              description="We don't want your data. Just build your plot, download it, and go play your show."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6 text-blue-400" />}
              title="Comprehensive Logistics"
              description="Include essential details like stage dimensions, show duration, soundcheck times, and social handles."
            />
            <FeatureCard
              icon={<Music className="w-6 h-6 text-purple-400" />}
              title="Gear Configuration"
              description="Specify Amps, DIs, or Direct lines for each member to ensure the venue is ready for your rig."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -right-48 md:right-1/3 w-96 h-96 bg-purple-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 -left-48 md:-left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From idea to rider in 5 minutes</h2>
            <p className="text-slate-400 text-lg">
              A simple workflow designed to get you back to practicing.
            </p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 border-t border-dashed border-slate-700 z-0" />

            <StepCard
              number="01"
              title="Band & Gear"
              description="Add members and define their rig—Amps, DIs, or Direct. We handle the channel assignment."
            />
            <StepCard
              number="02"
              title="Stage Layout"
              description="Switch to 3D view. Place risers, monitors, and power drops exactly where you need them."
            />
            <StepCard
              number="03"
              title="Rider Details"
              description="Add contact info, setlist duration, and other essential rider details."
            />
            <StepCard
              number="04"
              title="Download & Share"
              description="Download and share your complete technical packet with venues and promoters."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border border-slate-800">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-indigo-600 px-6 py-16 md:px-16 md:py-20 text-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to sound check?</h2>
              <p className="text-indigo-100 text-lg mb-10">
                Join thousands of musicians who use Miked.live to communicate professionally with venues.
              </p>
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center border border-slate-800 bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg font-semibold rounded-md shadow-xl transition-colors duration-100"
              >
                Start Building Now
              </button>
              <p className="mt-6 text-sm text-indigo-200 opacity-80">
                No credit card required • No login • Free to use
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- Helper Components ---
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-colors duration-150 group">
      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl font-bold text-indigo-500 mb-6 shadow-xl shadow-black/50">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 max-w-xs mx-auto">{description}</p>
    </div>
  );
}
