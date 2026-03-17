import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, CloudUpload, CheckCircle2, Loader2, Zap, Activity } from 'lucide-react';

interface BuildStatusOverlayProps {
  isVisible: boolean;
  progress: number;
  status: string;
  type: 'compile' | 'upload';
}

export const BuildStatusOverlay: React.FC<BuildStatusOverlayProps> = ({ isVisible, progress, status, type }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-[#151619] border border-[#262626] rounded-2xl p-8 shadow-2xl overflow-hidden relative tech-grid"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              {type === 'compile' ? <Cpu size={160} /> : <CloudUpload size={160} />}
            </div>

            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${type === 'compile' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {type === 'compile' ? <Cpu size={24} /> : <CloudUpload size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      {type === 'compile' ? 'System Compilation' : 'Hardware Upload'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${type === 'compile' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      <p className="text-[10px] text-[#858585] uppercase tracking-[0.2em] font-bold">
                        {type === 'compile' ? 'Building Binary Image' : 'Flashing Device Memory'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <span className={`text-3xl font-black font-mono leading-none ${type === 'compile' ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {Math.round(progress)}%
                  </span>
                  <span className="text-[8px] text-[#666666] uppercase font-bold tracking-tighter">Progress Vector</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#858585]">Execution State</span>
                    <span className="text-white flex items-center gap-2">
                      <Activity size={10} className={type === 'compile' ? 'text-blue-400' : 'text-emerald-400'} />
                      Active Process
                    </span>
                  </div>
                  <span className={type === 'compile' ? 'text-blue-400' : 'text-emerald-400'}>
                    {progress === 100 ? 'Verified' : 'Processing...'}
                  </span>
                </div>
                
                <div className="relative">
                  <div className="h-4 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#262626] p-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                      className={`h-full rounded-full relative ${type === 'compile' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                  {/* Tick marks */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-1">
                    {[0, 25, 50, 75, 100].map(tick => (
                      <div key={tick} className="flex flex-col items-center">
                        <div className="w-px h-1 bg-[#262626]" />
                        <span className="text-[7px] text-[#444444] font-mono">{tick}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-[#0a0a0a] rounded-xl p-4 border border-[#262626] flex items-center justify-between group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${type === 'compile' ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {progress < 100 ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#666666] uppercase font-bold">Current Task</span>
                    <span className="text-xs font-mono text-[#cccccc] tracking-tight">{status}</span>
                  </div>
                </div>
                <Zap size={14} className={progress === 100 ? "text-yellow-400" : "text-[#262626]"} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] text-[#666666] uppercase font-bold tracking-wider">Memory Map</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-white font-mono font-bold">42.4</span>
                    <span className="text-[10px] text-[#858585] font-mono">KB</span>
                    <span className="text-[10px] text-[#444444] font-mono mx-1">/</span>
                    <span className="text-[10px] text-[#858585] font-mono">512KB</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] text-[#666666] uppercase font-bold tracking-wider">Optimization</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-mono font-bold">LEVEL O3</span>
                    <div className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-bold rounded border border-blue-500/30">MAX</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom decorative bar */}
            <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${type === 'compile' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
