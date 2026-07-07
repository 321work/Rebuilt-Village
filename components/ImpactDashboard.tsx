import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, Heart, PieChart, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import type { SanityImpactStat } from '../services/sanityService';
import { getImpactStats } from '../services/sanityService';

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, Users, Zap, Shield, PieChart, Heart, Star, Award,
};

// Fallback used when Firestore is empty or unavailable.
const FALLBACK_METRICS: SanityImpactStat[] = [
  { _id: 'f1', label: 'Direct Program Flow', value: '85%', description: 'Efficiency Ratio', icon: 'TrendingUp', order: 0 },
  { _id: 'f2', label: 'Youth Reached', value: '450+', description: 'Scholarships Awarded', icon: 'Users', order: 1 },
  { _id: 'f3', label: 'Stories Preserved', value: '12', description: 'Local Narratives', icon: 'Zap', order: 2 },
  { _id: 'f4', label: 'Verified Status', value: '501(c)(3)', description: 'Tax Exempt', icon: 'Shield', order: 3 },
];

export const ImpactDashboard: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [metrics, setMetrics] = useState<SanityImpactStat[]>(FALLBACK_METRICS);

  useEffect(() => {
    getImpactStats().then((stats) => {
      if (stats.length > 0) setMetrics(stats);
    }).catch(() => { /* keep fallback */ });
  }, []);

  return (
    <div className="bg-surface border border-border overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      
      <div className="relative p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-4 font-bold opacity-60">
              Operational Transparency
            </p>
            <h2 className="text-4xl md:text-5xl font-serif italic text-text tracking-tight">
              Radical <em className="text-primary not-italic">Impact.</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-border group-hover:w-20 transition-all duration-700" />
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => {
            const Icon = ICON_MAP[metric.icon ?? ''] ?? TrendingUp;
            return (
              <motion.div
                key={metric._id}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReduced ? 0 : idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-primary opacity-60" />
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.2em]">
                    {metric.label}
                  </span>
                </div>
                <div className="text-4xl md:text-5xl font-bold font-display tracking-tighter text-text">
                  {metric.value}
                </div>
                <p className="font-mono text-[10px] text-text-muted italic opacity-40 uppercase tracking-widest">
                  {metric.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 pt-8 border-t border-border grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl font-serif italic text-text mb-4 leading-snug">
              Every dollar is mapped to a frame of student work.
            </h3>
            <p className="text-sm text-text-muted leading-relaxed font-light">
              We operate with zero-waste principles. Our administrative overhead is covered by separate corporate grants, 
              ensuring your community donations go directly to gear, labs, and mentorship.
            </p>
          </div>
          <div className="bg-background/40 border border-border p-8 relative flex flex-col justify-between">
             <div className="flex items-center justify-between mb-8">
               <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Where the Money Goes</span>
               <PieChart size={18} className="text-primary opacity-[0.85]" />
             </div>
             
             {/* Large unified impact bar */}
             <div className="w-full h-8 flex rounded-sm overflow-hidden mb-8 shadow-inner shadow-black/50">
                <motion.div 
                  initial={{ width: 0 }} whileInView={{ width: '60%' }} transition={{ duration: 1.2, ease: "easeOut" }} viewport={{ once: true }}
                  className="h-full bg-primary relative group cursor-pointer"
                  title="60% - Student Gear & Labs"
                />
                <motion.div 
                  initial={{ width: 0 }} whileInView={{ width: '25%' }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} viewport={{ once: true }}
                  className="h-full bg-[#1e293b] border-l border-black/20 cursor-pointer"
                  title="25% - Professional Mentorship"
                />
                <motion.div 
                  initial={{ width: 0 }} whileInView={{ width: '15%' }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }} viewport={{ once: true }}
                  className="h-full bg-border border-l border-black/20 cursor-pointer"
                  title="15% - Community Screenings"
                />
             </div>

             <div className="space-y-4">
                {[
                  { label: 'Student Gear & Labs', pct: '60%', color: 'bg-primary' },
                  { label: 'Professional Mentorship', pct: '25%', color: 'bg-[#1e293b]' },
                  { label: 'Community Screenings', pct: '15%', color: 'bg-border' },
                ].map((item, i) => (
                  <motion.div 
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }} viewport={{ once: true }}
                    className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] group hover:bg-white/5 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-sm ${item.color} shadow-sm shadow-black/50`} />
                      <span className="text-text group-hover:text-primary transition-colors">{item.label}</span>
                    </div>
                    <span className="text-text-muted font-bold">{item.pct}</span>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
