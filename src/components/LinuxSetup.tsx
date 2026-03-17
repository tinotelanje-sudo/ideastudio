import React, { useState } from 'react';
import { Terminal, Shield, Download, Monitor, Cpu, Info, CheckCircle2, Copy, Usb } from 'lucide-react';

interface LinuxSetupProps {
  onRequestDevice: () => void;
}

export const LinuxSetup = ({ onRequestDevice }: LinuxSetupProps) => {
  const [copied, setCopied] = useState(false);

  const udevRules = `# IDEAI STUDIOS WebUSB Rules
# Copy this to /etc/udev/rules.d/99-ideai-studios.rules
SUBSYSTEM=="usb", ATTR{idVendor}=="*", ATTR{idProduct}=="*", MODE="0666", GROUP="plugdev"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(udevRules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-y-auto p-6 custom-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-600/20 rounded-lg">
          <Monitor className="text-orange-400" size={24} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Linux & Bliss OS Support</h2>
          <p className="text-[10px] text-[#858585] uppercase tracking-widest">System Integration & Installation</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* PWA Installation */}
        <section className="bg-[#252526] border border-[#333333] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Download size={18} />
            <span className="text-xs font-bold uppercase">Install as App (PWA)</span>
          </div>
          <p className="text-xs text-[#cccccc] mb-4 leading-relaxed">
            IDEAI STUDIOS supports Progressive Web App technology. On Bliss OS or Linux, click the 
            <span className="text-white font-bold"> "Install" </span> icon in your browser's address bar to add it to your desktop or app drawer.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
            <CheckCircle2 size={14} />
            <span>Works offline after installation</span>
          </div>
        </section>

        {/* WebUSB Permissions */}
        <section className="bg-[#252526] border border-[#333333] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-orange-400">
            <Shield size={18} />
            <span className="text-xs font-bold uppercase">Linux WebUSB Setup (udev)</span>
          </div>
          <p className="text-xs text-[#cccccc] mb-4 leading-relaxed">
            To use hardware devices without root on Linux, you need to add udev rules. Run these commands in your terminal:
          </p>
          
          <div className="relative group">
            <pre className="bg-[#1e1e1e] p-3 rounded-lg text-[11px] font-mono text-orange-200 overflow-x-auto border border-[#333333]">
              {udevRules}
            </pre>
            <button 
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-1.5 bg-[#333333] hover:bg-[#444444] rounded text-white transition-colors"
            >
              {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[10px] text-[#858585] font-bold uppercase">Instructions:</p>
            <ol className="text-[11px] text-[#cccccc] list-decimal pl-4 space-y-1">
              <li>Copy the rules above.</li>
              <li>Run <code className="bg-[#333333] px-1 rounded">sudo nano /etc/udev/rules.d/99-ideai-studios.rules</code></li>
              <li>Paste and save (Ctrl+O, Enter, Ctrl+X).</li>
              <li>Run <code className="bg-[#333333] px-1 rounded">sudo udevadm control --reload-rules && sudo udevadm trigger</code></li>
            </ol>
          </div>
        </section>

        {/* Bliss OS Tips */}
        <section className="bg-[#252526] border border-[#333333] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <Cpu size={18} />
            <span className="text-xs font-bold uppercase">Bliss OS Optimization</span>
          </div>
          <ul className="text-xs text-[#cccccc] space-y-3">
            <li className="flex gap-2">
              <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
              <span>Enable <span className="text-white font-bold">"Desktop Mode"</span> in Bliss OS settings for the best IDE experience.</span>
            </li>
            <li className="flex gap-2">
              <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
              <span>Use <span className="text-white font-bold">Chrome or Edge</span> for full WebUSB and WebSerial support.</span>
            </li>
            <li className="flex gap-2">
              <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
              <span>Connect hardware via <span className="text-white font-bold">USB-OTG</span> if using a tablet or mobile device.</span>
            </li>
          </ul>
        </section>

        <button 
          onClick={onRequestDevice}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
        >
          <Usb size={20} />
          Request USB Device Access
        </button>
      </div>
    </div>
  );
};
