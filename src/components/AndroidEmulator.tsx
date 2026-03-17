import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Play, 
  RotateCcw, 
  Power, 
  Volume2, 
  VolumeX,
  Wifi,
  Battery,
  Signal,
  Home,
  ChevronLeft,
  Square,
  Download,
  Terminal as TerminalIcon
} from 'lucide-react';

interface AndroidEmulatorProps {
  code: string;
  language: string;
}

export const AndroidEmulator: React.FC<AndroidEmulatorProps> = ({ code, language }) => {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [appInstalled, setAppInstalled] = useState(false);

  const handlePower = () => {
    if (!isPoweredOn) {
      setIsBooting(true);
      setLogs(prev => [...prev, "[System] Booting Android 14..."]);
      setTimeout(() => {
        setIsBooting(false);
        setIsPoweredOn(true);
        setLogs(prev => [...prev, "[System] Android System Ready."]);
      }, 3000);
    } else {
      setIsPoweredOn(false);
      setAppInstalled(false);
      setLogs(prev => [...prev, "[System] Shutting down..."]);
    }
  };

  const handleBuildAndRun = async () => {
    if (!isPoweredOn) {
      setLogs(prev => [...prev, "\x1b[31m[Error] Emulator must be powered on to install apps.\x1b[0m"]);
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);
    setLogs(prev => [...prev, "\x1b[34m[Gradle] Starting build process...\x1b[0m"]);

    const steps = [
      "Configuring projects...",
      "Resolving dependencies...",
      "Compiling Kotlin source files...",
      "Generating DEX files...",
      "Packaging APK...",
      "Signing APK...",
      "Installing APK to emulator..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
      setBuildProgress(((i + 1) / steps.length) * 100);
      setLogs(prev => [...prev, `[Gradle] ${steps[i]}`]);
    }

    setIsBuilding(false);
    setAppInstalled(true);
    setLogs(prev => [...prev, "\x1b[32m[Success] App installed and launched.\x1b[0m"]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden">
      <div className="p-3 border-b border-[#262626] flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#858585] uppercase tracking-wider">
          <Smartphone size={14} className="text-blue-400" />
          Android Emulator
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePower}
            className={`p-1.5 rounded transition-colors ${isPoweredOn ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-[#858585] hover:text-white hover:bg-[#262626]'}`}
            title={isPoweredOn ? "Power Off" : "Power On"}
          >
            <Power size={14} />
          </button>
          <button 
            onClick={() => setLogs([])}
            className="p-1.5 text-[#858585] hover:text-white hover:bg-[#262626] rounded transition-colors"
            title="Clear Logs"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">
        {/* Phone Frame */}
        <div className="relative w-[280px] h-[560px] bg-[#1a1a1a] rounded-[40px] border-[8px] border-[#333] shadow-2xl flex flex-col overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#333] rounded-b-2xl z-20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#111]" />
          </div>

          {/* Screen */}
          <div className="flex-1 bg-black relative flex flex-col">
            <AnimatePresence>
              {!isPoweredOn && !isBooting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-10"
                >
                  <div className="text-[#333] flex flex-col items-center gap-2">
                    <Power size={48} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Powered Off</span>
                  </div>
                </motion.div>
              )}

              {isBooting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-white font-bold text-2xl tracking-tighter"
                  >
                    ANDROID
                  </motion.div>
                  <div className="mt-8 w-32 h-1 bg-[#222] rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-128, 128] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-full h-full bg-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {isPoweredOn && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Status Bar */}
                  <div className="h-6 px-6 flex items-center justify-between text-[10px] text-white/80">
                    <span>12:48</span>
                    <div className="flex items-center gap-1.5">
                      <Signal size={10} />
                      <Wifi size={10} />
                      <Battery size={10} />
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 p-4 flex flex-col">
                    {appInstalled ? (
                      <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col gap-4 text-black">
                        <div className="h-12 bg-blue-600 rounded-xl flex items-center px-4 text-white font-bold shadow-lg">
                          My Kotlin App
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <Smartphone size={40} />
                          </div>
                          <h2 className="text-xl font-bold">Welcome!</h2>
                          <p className="text-xs text-gray-500">
                            This is a live preview of your Kotlin code running on Android 14.
                          </p>
                          <div className="w-full p-3 bg-gray-50 rounded-lg text-left">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Active Code</div>
                            <div className="text-[9px] font-mono text-gray-600 line-clamp-4">
                              {code}
                            </div>
                          </div>
                        </div>
                        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                          Interact
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="grid grid-cols-4 gap-4 w-full px-2">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/10 rounded-xl animate-pulse" />
                          ))}
                        </div>
                        <div className="mt-auto mb-8 text-center">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">No App Installed</p>
                          <p className="text-[9px] text-white/20 mt-1">Build and Run to see your code</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Bar */}
                  <div className="h-12 flex items-center justify-around text-white/60">
                    <ChevronLeft size={20} />
                    <Home size={18} />
                    <Square size={14} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button 
            onClick={handleBuildAndRun}
            disabled={isBuilding || !isPoweredOn}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isBuilding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {isBuilding ? 'Building APK...' : 'Build & Run'}
          </button>
          
          {isBuilding && (
            <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${buildProgress}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Emulator Logs */}
      <div className="h-40 border-t border-[#262626] flex flex-col bg-[#050505]">
        <div className="h-8 bg-[#111] flex items-center px-4 text-[10px] font-bold text-[#858585] uppercase tracking-widest border-b border-[#262626]">
          <TerminalIcon size={12} className="mr-2" />
          Logcat / Build Output
        </div>
        <div className="flex-1 p-3 font-mono text-[10px] overflow-y-auto scrollbar-hide">
          {logs.map((log, i) => (
            <div key={i} className="mb-1 text-[#cccccc]">
              <span className="text-[#555] mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          {isBuilding && <div className="text-blue-400 animate-pulse">_</div>}
        </div>
      </div>
    </div>
  );
};
