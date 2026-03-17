import React from 'react';
import { Activity, Cpu, Database, Globe, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const SystemStatusPanel = () => {
  const stats = [
    { label: 'CPU Usage', value: '12%', icon: Cpu, color: 'text-blue-400' },
    { label: 'Memory', value: '1.2GB / 4GB', icon: Database, color: 'text-emerald-400' },
    { label: 'AI Latency', value: '45ms', icon: Zap, color: 'text-orange-400' },
    { label: 'Network', value: 'Stable', icon: Globe, color: 'text-blue-400' },
    { label: 'Security', value: 'Verified', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Processors', value: '8 Cores', icon: Activity, color: 'text-purple-400' },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-6 overflow-y-auto bg-[#0a0a0a]">
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold text-[#858585] uppercase tracking-widest">System Intelligence</h3>
        <p className="text-[10px] text-[#666666]">Real-time hardware & AI diagnostics</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 glass-panel rounded-lg flex items-center justify-between group hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md bg-white/5 ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#858585] font-medium">{stat.label}</span>
                <span className="text-xs text-white font-bold">{stat.value}</span>
              </div>
            </div>
            <div className="w-12 h-1 bg-[#262626] rounded-full overflow-hidden">
              <div className={`h-full bg-current ${stat.color}`} style={{ width: '60%' }} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={14} className="text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase">Kernel Status</span>
        </div>
        <p className="text-[9px] text-[#858585] leading-relaxed">
          All systems operational. AI Copilot is synchronized with local hardware drivers.
        </p>
      </div>
    </div>
  );
};
