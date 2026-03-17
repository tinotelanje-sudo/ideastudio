import React, { useState } from 'react';
import { Cpu, CheckCircle2, Usb, Info, RefreshCw, ChevronRight, Settings, Download, Shield } from 'lucide-react';
import { BOARD_LIBRARIES } from '../constants/libraries';

interface BoardsManagerProps {
  connectedDevice: USBDevice | null;
  onRequestDevice: () => void;
}

export const BoardsManager = ({ connectedDevice, onRequestDevice }: BoardsManagerProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-emerald-400" size={20} />
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Boards & Drivers</h2>
          </div>
          <button 
            onClick={handleRefresh}
            className={cn("p-1.5 hover:bg-[#333333] rounded transition-colors text-[#858585] hover:text-white", isRefreshing && "animate-spin")}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Connected Device Section */}
        <div className="p-4 border-b border-[#333333]">
          <h3 className="text-[10px] font-bold text-[#858585] uppercase tracking-widest mb-3">Connected Device</h3>
          {connectedDevice ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Usb className="text-emerald-400" size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{connectedDevice.productName || 'Unknown Device'}</div>
                  <div className="text-[10px] text-[#858585]">{connectedDevice.manufacturerName}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] mt-2 pt-2 border-t border-emerald-500/10">
                <span className="text-emerald-400 font-bold uppercase tracking-tighter">Status: Active</span>
                <span className="text-[#858585]">SN: {connectedDevice.serialNumber || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#252526] border border-dashed border-[#3c3c3c] rounded-lg p-6 text-center">
              <Usb className="mx-auto text-[#454545] mb-2" size={24} />
              <p className="text-[10px] text-[#858585] mb-4">No device detected via WebUSB</p>
              <button 
                onClick={onRequestDevice}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all"
              >
                CONNECT DEVICE
              </button>
            </div>
          )}
        </div>

        {/* Installed Board Drivers Section */}
        <div className="p-4">
          <h3 className="text-[10px] font-bold text-[#858585] uppercase tracking-widest mb-3">Installed Board Drivers</h3>
          <div className="space-y-2">
            {BOARD_LIBRARIES.map((board, index) => (
              <div key={board.id} className="bg-[#252526] border border-[#333333] rounded-lg p-3 hover:border-[#454545] transition-colors group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-md",
                      index === 0 ? "bg-blue-500/20 text-blue-400" : "bg-[#333333] text-[#858585]"
                    )}>
                      <Cpu size={14} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#cccccc] group-hover:text-white">{board.name}</div>
                      <div className="text-[9px] text-[#666666]">{board.description}</div>
                    </div>
                  </div>
                  {index === 0 ? (
                    <div className="text-emerald-400">
                      <CheckCircle2 size={14} />
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-[#454545] group-hover:text-[#858585]" />
                  )}
                </div>
              </div>
            ))}
            
            <button className="w-full mt-4 py-2 border border-dashed border-[#3c3c3c] hover:border-[#454545] text-[#858585] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Download size={14} />
              Install More Drivers
            </button>
          </div>
        </div>

        {/* System Info Section */}
        <div className="p-4 mt-auto">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex items-start gap-3">
            <Shield className="text-blue-400 shrink-0" size={14} />
            <div>
              <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Security Note</div>
              <p className="text-[9px] text-[#858585] leading-relaxed">
                Board drivers are sandboxed within the IDE environment. WebUSB access is required for direct hardware communication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
