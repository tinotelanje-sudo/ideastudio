import React from 'react';
import { 
  Bug, 
  Play, 
  Pause, 
  SkipForward, 
  ArrowDown, 
  ArrowUp, 
  Square,
  Circle,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Breakpoint {
  id: string;
  line: number;
  enabled: boolean;
}

interface Variable {
  name: string;
  value: string;
  type: string;
}

interface DebuggerPanelProps {
  isDebugging: boolean;
  breakpoints: Breakpoint[];
  variables: Variable[];
  callStack: string[];
  onToggleBreakpoint: (id: string) => void;
  onRemoveBreakpoint: (id: string) => void;
  onStartDebug: () => void;
  onStopDebug: () => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onResume: () => void;
  onPause: () => void;
}

export const DebuggerPanel: React.FC<DebuggerPanelProps> = ({
  isDebugging,
  breakpoints,
  variables,
  callStack,
  onToggleBreakpoint,
  onRemoveBreakpoint,
  onStartDebug,
  onStopDebug,
  onStepOver,
  onStepInto,
  onStepOut,
  onResume,
  onPause
}) => {
  return (
    <div className="flex flex-col h-full bg-[#252526] text-[#cccccc] font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333333] bg-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <Bug size={14} className="text-[#858585]" />
          <span className="font-bold uppercase tracking-wider text-[10px]">Run and Debug</span>
        </div>
      </div>

      {/* Debug Controls Toolbar (Visible when debugging) */}
      {isDebugging && (
        <div className="flex items-center justify-center gap-1 p-2 bg-[#333333] border-b border-[#454545] shadow-lg">
          <button onClick={onResume} className="p-1.5 hover:bg-[#454545] rounded text-[#75beff]" title="Continue (F5)">
            <Play size={16} fill="currentColor" />
          </button>
          <button onClick={onPause} className="p-1.5 hover:bg-[#454545] rounded text-[#75beff]" title="Pause (F6)">
            <Pause size={16} fill="currentColor" />
          </button>
          <button onClick={onStepOver} className="p-1.5 hover:bg-[#454545] rounded text-[#75beff]" title="Step Over (F10)">
            <SkipForward size={16} />
          </button>
          <button onClick={onStepInto} className="p-1.5 hover:bg-[#454545] rounded text-[#75beff]" title="Step Into (F11)">
            <ArrowDown size={16} />
          </button>
          <button onClick={onStepOut} className="p-1.5 hover:bg-[#454545] rounded text-[#75beff]" title="Step Out (Shift+F11)">
            <ArrowUp size={16} />
          </button>
          <div className="w-px h-4 bg-[#454545] mx-1" />
          <button onClick={onStopDebug} className="p-1.5 hover:bg-[#454545] rounded text-[#f48771]" title="Stop (Shift+F5)">
            <Square size={16} fill="currentColor" />
          </button>
        </div>
      )}

      {!isDebugging && (
        <div className="p-4 flex flex-col gap-4">
          <button 
            onClick={onStartDebug}
            className="w-full py-2 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play size={14} fill="currentColor" />
            Start Debugging
          </button>
          <p className="text-[11px] text-[#858585] leading-relaxed">
            Connect your ESP32/Arduino via USB to enable hardware debugging. Ensure you have a JTAG debugger connected if required.
          </p>
        </div>
      )}

      {/* Variables Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="group">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#37373d] cursor-pointer">
            <ChevronDown size={14} />
            <span className="font-bold uppercase text-[10px]">Variables</span>
          </div>
          <div className="p-2 space-y-1">
            {variables.length > 0 ? (
              variables.map((v, i) => (
                <div key={i} className="flex items-start gap-2 hover:bg-[#2a2d2e] px-2 py-0.5 rounded group">
                  <span className="text-[#9cdcfe] font-mono">{v.name}:</span>
                  <span className="text-[#ce9178] font-mono break-all">{v.value}</span>
                  <span className="ml-auto text-[#858585] text-[9px] opacity-0 group-hover:opacity-100">{v.type}</span>
                </div>
              ))
            ) : (
              <div className="text-[#858585] italic px-2 py-1">No variables available</div>
            )}
          </div>
        </div>

        {/* Call Stack Section */}
        <div className="group border-t border-[#333333]">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#37373d] cursor-pointer">
            <ChevronDown size={14} />
            <span className="font-bold uppercase text-[10px]">Call Stack</span>
          </div>
          <div className="p-2">
            {callStack.length > 0 ? (
              callStack.map((frame, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded cursor-pointer",
                  i === 0 ? "bg-[#37373d] text-white" : "hover:bg-[#2a2d2e]"
                )}>
                  <Layers size={12} className="text-[#858585]" />
                  <span className="font-mono truncate">{frame}</span>
                </div>
              ))
            ) : (
              <div className="text-[#858585] italic px-2 py-1">Not running</div>
            )}
          </div>
        </div>

        {/* Breakpoints Section */}
        <div className="group border-t border-[#333333]">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#37373d] cursor-pointer">
            <ChevronDown size={14} />
            <span className="font-bold uppercase text-[10px]">Breakpoints</span>
          </div>
          <div className="p-2 space-y-1">
            {breakpoints.length > 0 ? (
              breakpoints.map((bp) => (
                <div key={bp.id} className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded group">
                  <input 
                    type="checkbox" 
                    checked={bp.enabled} 
                    onChange={() => onToggleBreakpoint(bp.id)}
                    className="w-3 h-3 accent-[#007acc]"
                  />
                  <Circle size={10} fill={bp.enabled ? "#f48771" : "transparent"} stroke="#f48771" />
                  <span className="flex-1 truncate">Blink.ino: line {bp.line}</span>
                  <button 
                    onClick={() => onRemoveBreakpoint(bp.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#454545] rounded text-[#858585] hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-[#858585] italic px-2 py-1">No breakpoints set</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
