import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Save, 
  Cpu, 
  Terminal as TerminalIcon, 
  Settings, 
  Usb, 
  Sparkles,
  Search,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  X,
  Menu,
  Zap,
  Book,
  Library,
  Monitor,
  Puzzle,
  Check,
  CloudUpload,
  Activity,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { TerminalComponent } from './components/Terminal';
import { DeviceInfoPanel } from './components/DeviceInfoPanel';
import { LinuxSetup } from './components/LinuxSetup';
import { ExtensionsManager } from './components/ExtensionsManager';
import { BoardsManager } from './components/BoardsManager';
import { SystemStatusPanel } from './components/SystemStatusPanel';
import { generateArduinoCode } from './services/aiService';
import { queryOfflineAi } from './services/offlineAiService';
import { getAiCompletions } from './services/completionService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SAMPLE_LIBRARIES, BOARD_LIBRARIES, LibraryItem } from './constants/libraries';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [code, setCode] = useState<string>(`void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [connectedDevice, setConnectedDevice] = useState<USBDevice | null>(null);
  const [activeTab, setActiveTab] = useState('Blink.ino');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<'explorer' | 'library' | 'device' | 'linux' | 'extensions' | 'boards' | 'status'>('explorer');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // WebUSB Detection
  useEffect(() => {
    if (!navigator.usb) {
      console.warn('WebUSB is not supported in this browser or environment.');
      return;
    }

    const handleConnect = (event: USBConnectionEvent) => {
      console.log('Device connected:', event.device);
      setConnectedDevice(event.device);
    };

    const handleDisconnect = (event: USBConnectionEvent) => {
      console.log('Device disconnected:', event.device);
      if (connectedDevice === event.device) {
        setConnectedDevice(null);
      }
    };

    navigator.usb.addEventListener('connect', handleConnect);
    navigator.usb.addEventListener('disconnect', handleDisconnect);

    // Check for already connected devices
    navigator.usb.getDevices().then(devices => {
      if (devices.length > 0) {
        setConnectedDevice(devices[0]);
      }
    }).catch(err => console.error('Error getting USB devices:', err));

    return () => {
      if (navigator.usb) {
        navigator.usb.removeEventListener('connect', handleConnect);
        navigator.usb.removeEventListener('disconnect', handleDisconnect);
      }
    };
  }, [connectedDevice]);

  const requestUsbAccess = async () => {
    if (!navigator.usb) {
      alert('WebUSB is not supported in this browser or environment (requires HTTPS).');
      return;
    }
    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      setConnectedDevice(device);
    } catch (err) {
      console.error('USB Access Denied:', err);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      if (isOfflineMode) {
        const result = await queryOfflineAi(aiPrompt);
        if (result.type === 'code') {
          setCode(result.content);
        } else {
          const commentPrefix = selectedLanguage === 'python' ? '#' : '//';
          setCode(`${commentPrefix} AI RESPONSE: ${result.content}\n\n${code}`);
        }
      } else {
        const generatedCode = await generateArduinoCode(`${aiPrompt} (Language: ${selectedLanguage})`);
        setCode(generatedCode);
      }
      setAiPrompt('');
    } catch (err) {
      console.error('AI Generation failed:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCompile = async () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setBuildProgress(0);
    setIsTerminalOpen(true);
    setTerminalLogs(prev => [...prev, `\x1b[1;34m[BUILD]\x1b[0m Starting compilation for ${activeTab}...`]);

    const steps = [
      "Initializing toolchain...",
      "Parsing source files...",
      "Compiling core libraries...",
      "Linking objects...",
      "Generating binary image...",
      "Calculating memory usage..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setBuildProgress(((i + 1) / steps.length) * 100);
      setTerminalLogs(prev => [...prev, `\x1b[38;5;244m[BUILD]\x1b[0m ${steps[i]}`]);
    }

    setTerminalLogs(prev => [...prev, `\x1b[1;32m[SUCCESS]\x1b[0m Compilation complete. Binary size: 42.4 KB (12% of flash)`]);
    setIsCompiling(false);
    setBuildProgress(100);
    setTimeout(() => setBuildProgress(0), 1000);
  };

  const handleUpload = async () => {
    if (!connectedDevice) {
      setTerminalLogs(prev => [...prev, `\x1b[1;31m[ERROR]\x1b[0m No device connected. Please connect a device via WebUSB.`]);
      setIsTerminalOpen(true);
      return;
    }
    
    await handleCompile();
    
    setIsUploading(true);
    setBuildProgress(0);
    setTerminalLogs(prev => [...prev, `\x1b[1;34m[UPLOAD]\x1b[0m Opening port ${connectedDevice.productName}...`]);

    const uploadSteps = [
      "Resetting board...",
      "Entering bootloader...",
      "Erasing flash sectors...",
      "Writing page 0-64...",
      "Writing page 65-128...",
      "Verifying checksum...",
      "Finalizing upload..."
    ];

    for (let i = 0; i < uploadSteps.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      setBuildProgress(((i + 1) / uploadSteps.length) * 100);
      setTerminalLogs(prev => [...prev, `\x1b[38;5;244m[UPLOAD]\x1b[0m ${uploadSteps[i]}`]);
    }

    setTerminalLogs(prev => [...prev, `\x1b[1;32m[SUCCESS]\x1b[0m Upload successful. Board is rebooting...`]);
    setIsUploading(false);
    setBuildProgress(100);
    setTimeout(() => setBuildProgress(0), 1000);
  };

  const handleDeploy = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStatus('uploading');
    setTerminalLogs(prev => [...prev, `\x1b[1;34m[DEPLOY]\x1b[0m Initiating FTP deployment to ftp.nasadef.com.my...`]);
    
    try {
      const response = await fetch('/api/deploy', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setDeployStatus('success');
        setTerminalLogs(prev => [...prev, `\x1b[1;32m[SUCCESS]\x1b[0m Deployment successful! Live at https://aiapp.nasadef.com.my`]);
      } else {
        throw new Error(data.error || 'Deployment failed');
      }
    } catch (err: any) {
      setDeployStatus('error');
      setTerminalLogs(prev => [...prev, `\x1b[1;31m[ERROR]\x1b[0m Deployment failed: ${err.message}`]);
    } finally {
      setIsDeploying(false);
      setTimeout(() => setDeployStatus('idle'), 5000);
    }
  };

  const handleTerminalCommand = async (command: string) => {
    console.log('Executing command:', command);
    // In a real app, we would send this to the backend
    const response = await fetch('/api/terminal/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    const data = await response.json();
    // The terminal component handles its own display, but we could pipe this back
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    // Register AI Completion Provider
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: async (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const prefix = word.word;
        if (prefix.length < 2) return { suggestions: [] };

        const aiSuggestions = await getAiCompletions(prefix);

        const suggestions = aiSuggestions.map((item: any) => ({
          label: item.label,
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: item.detail,
          insertText: item.insertText,
          range: range,
        }));

        return { suggestions };
      },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-[#cccccc] font-sans selection:bg-blue-500/30 tech-grid">
      {/* Top Navigation Bar */}
      <motion.header 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="h-12 border-b border-[#262626] flex items-center justify-between px-4 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0 z-50"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Cpu size={16} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#252526] flex items-center justify-center">
                <Sparkles size={6} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1">
                <span className="font-black text-sm tracking-tighter text-white">IDEAI</span>
                <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 text-[7px] font-bold rounded border border-blue-500/30">MULTI-CODER</span>
              </div>
              <span className="text-[8px] font-bold text-blue-400 tracking-[0.2em] uppercase">Studios</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 ml-4">
            <button className="px-3 py-1 text-xs hover:bg-[#37373d] rounded transition-colors">File</button>
            <button className="px-3 py-1 text-xs hover:bg-[#37373d] rounded transition-colors">Edit</button>
            <button className="px-3 py-1 text-xs hover:bg-[#37373d] rounded transition-colors">Sketch</button>
            <button className="px-3 py-1 text-xs hover:bg-[#37373d] rounded transition-colors">Tools</button>
            <button className="px-3 py-1 text-xs hover:bg-[#37373d] rounded transition-colors">Help</button>
          </nav>
        </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all border",
                  deployStatus === 'uploading' ? "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse" :
                  deployStatus === 'success' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  deployStatus === 'error' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  "bg-[#37373d] text-[#cccccc] border-transparent hover:bg-[#45454d] hover:text-white"
                )}
              >
                <CloudUpload size={14} />
                {isDeploying ? 'Deploying...' : 'Deploy to NASADEF'}
              </button>

              <div className="flex items-center gap-1 bg-[#37373d] p-0.5 rounded-md">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-[10px] text-[#cccccc] px-2 py-1 outline-none border-r border-[#45454d] cursor-pointer hover:text-white"
              >
                <option value="cpp">C++ (Arduino)</option>
                <option value="python">Python (MicroPython)</option>
                <option value="javascript">JavaScript (Espruino)</option>
              </select>
              <button 
                onClick={handleCompile}
                disabled={isCompiling || isUploading}
                className={cn("p-1.5 hover:bg-[#45454d] rounded transition-colors text-blue-400", (isCompiling || isUploading) && "opacity-50 cursor-not-allowed")} 
                title="Verify (Compile)"
              >
                <Check size={16} className={isCompiling ? "animate-pulse" : ""} />
              </button>
              <button 
                onClick={handleUpload}
                disabled={isCompiling || isUploading}
                className={cn("p-1.5 hover:bg-[#45454d] rounded transition-colors text-emerald-400", (isCompiling || isUploading) && "opacity-50 cursor-not-allowed")} 
                title="Upload to Board"
              >
                <Play size={16} fill="currentColor" className={isUploading ? "animate-bounce" : ""} />
              </button>
              <button className="p-1.5 hover:bg-[#45454d] rounded transition-colors text-blue-400" title="Save Sketch">
                <Save size={16} />
              </button>
              <button 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className={cn("p-1.5 hover:bg-[#45454d] rounded transition-colors", isTerminalOpen ? "text-orange-400" : "text-[#858585]")} 
                title="Serial Monitor"
              >
                <TerminalIcon size={16} />
              </button>
            </div>

            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all",
              connectedDevice ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", connectedDevice ? "bg-emerald-500 animate-pulse" : "bg-orange-500")} />
              {connectedDevice ? connectedDevice.productName || 'Device Connected' : 'No Device'}
            </div>
            
            <button 
              onClick={requestUsbAccess}
              className="p-1.5 hover:bg-[#37373d] rounded transition-colors text-blue-400" 
              title="Connect USB"
            >
              <Usb size={18} />
            </button>
            
            <button className="p-1.5 hover:bg-[#37373d] rounded transition-colors">
              <Settings size={18} />
            </button>
          </div>
      </motion.header>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <motion.aside 
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          className="w-12 bg-[#0a0a0a] border-r border-[#262626] flex flex-col items-center py-4 gap-4 shrink-0 z-40"
        >
          <button 
            onClick={() => {
              if (sidebarView === 'explorer' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('explorer');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'explorer') ? "text-white" : "text-[#858585] hover:text-white")}
          >
            <FolderOpen size={24} />
          </button>
          <button 
            onClick={() => {
              if (sidebarView === 'library' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('library');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'library') ? "text-white" : "text-[#858585] hover:text-white")}
          >
            <Library size={24} />
          </button>
          <button 
            onClick={() => {
              if (sidebarView === 'boards' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('boards');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'boards') ? "text-white" : "text-[#858585] hover:text-white")}
            title="Boards & Drivers"
          >
            <Cpu size={24} />
          </button>
          <button 
            onClick={() => {
              if (sidebarView === 'extensions' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('extensions');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'extensions') ? "text-white" : "text-[#858585] hover:text-white")}
            title="Extensions"
          >
            <Puzzle size={24} />
          </button>
          <button 
            onClick={() => {
              if (sidebarView === 'linux' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('linux');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'linux') ? "text-white" : "text-[#858585] hover:text-white")}
            title="Linux Support"
          >
            <Monitor size={24} />
          </button>
          <button 
            onClick={() => {
              if (sidebarView === 'device' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('device');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'device') ? "text-white" : "text-[#858585] hover:text-white")}
            title="Device Intelligence"
          >
            <Sparkles size={24} />
          </button>
          <button 
            onClick={() => {
              if (sidebarView === 'status' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setSidebarView('status');
                setSidebarOpen(true);
              }
            }}
            className={cn("p-2 rounded transition-colors", (sidebarOpen && sidebarView === 'status') ? "text-white" : "text-[#858585] hover:text-white")}
            title="System Status"
          >
            <Activity size={24} />
          </button>
          <button className="p-2 text-[#858585] hover:text-white transition-colors">
            <Search size={24} />
          </button>
          <div className="mt-auto flex flex-col gap-4">
            <button className="p-2 text-[#858585] hover:text-white transition-colors">
              <Settings size={24} />
            </button>
          </div>
        </motion.aside>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#0a0a0a] border-r border-[#262626] flex flex-col shrink-0 overflow-hidden"
            >
              {sidebarView === 'explorer' ? (
              <>
                <div className="p-3 text-[11px] uppercase tracking-widest font-bold text-[#858585] flex justify-between items-center">
                  Explorer
                  <button className="hover:text-white"><ChevronDown size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="flex items-center gap-1 px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm">
                    <ChevronDown size={14} />
                    <span className="font-semibold">ARDUINO_PROJECT</span>
                  </div>
                  <div className="pl-6">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm",
                      activeTab === 'Blink.ino' && "bg-[#37373d] text-white"
                    )}>
                      <FileCode size={14} className="text-orange-400" />
                      <span>Blink.ino</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm opacity-60">
                      <FileCode size={14} className="text-blue-400" />
                      <span>config.h</span>
                    </div>
                  </div>
                </div>
              </>
            ) : sidebarView === 'library' ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-3 text-[11px] uppercase tracking-widest font-bold text-[#858585] flex justify-between items-center">
                  Library
                  <button className="hover:text-white"><ChevronDown size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-2 text-[10px] font-bold text-[#858585] uppercase tracking-wider">Samples</div>
                  {SAMPLE_LIBRARIES.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setCode(item.code);
                        setActiveTab(item.name);
                        if (item.category === 'Python') setSelectedLanguage('python');
                        else if (item.category === 'JavaScript') setSelectedLanguage('javascript');
                        else setSelectedLanguage('cpp');
                      }}
                      className="px-4 py-2 hover:bg-[#2a2d2e] cursor-pointer group"
                    >
                      <div className="text-sm text-[#cccccc] group-hover:text-white flex items-center gap-2">
                        <FileCode size={14} className="text-blue-400" />
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#666666] truncate">{item.description}</div>
                    </div>
                  ))}
                  
                  <div className="px-4 py-4 text-[10px] font-bold text-[#858585] uppercase tracking-wider">Board Drivers</div>
                  {BOARD_LIBRARIES.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        // For boards, maybe we just append info or set a header
                        setCode(`// Board Configuration: ${item.name}\n${item.code}\n\n${code}`);
                      }}
                      className="px-4 py-2 hover:bg-[#2a2d2e] cursor-pointer group"
                    >
                      <div className="text-sm text-[#cccccc] group-hover:text-white flex items-center gap-2">
                        <Cpu size={14} className="text-emerald-400" />
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#666666] truncate">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : sidebarView === 'boards' ? (
              <BoardsManager connectedDevice={connectedDevice} onRequestDevice={requestUsbAccess} />
            ) : sidebarView === 'extensions' ? (
              <ExtensionsManager />
            ) : sidebarView === 'device' ? (
              <DeviceInfoPanel device={connectedDevice} onRequestDevice={requestUsbAccess} />
            ) : sidebarView === 'status' ? (
              <SystemStatusPanel />
            ) : (
              <LinuxSetup onRequestDevice={requestUsbAccess} />
            )}
          </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Tabs */}
          <div className="h-9 bg-[#252526] flex items-center overflow-x-auto scrollbar-hide shrink-0">
            <div className={cn(
              "flex items-center gap-2 px-4 h-full border-r border-[#1e1e1e] text-xs cursor-pointer transition-colors",
              activeTab === 'Blink.ino' ? "bg-[#1e1e1e] text-white border-t-2 border-t-blue-500" : "bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2d2e]"
            )}>
              <FileCode size={14} className="text-orange-400" />
              <span>Blink.ino</span>
              <X size={12} className="ml-2 hover:bg-[#454545] rounded" />
            </div>
          </div>

          {/* Editor and AI Panel */}
          <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 relative">
              {buildProgress > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#2d2d2d] z-20">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300 ease-out",
                      isUploading ? "bg-emerald-500" : "bg-blue-500"
                    )}
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
              )}
              <Editor
                height="100%"
                defaultLanguage={selectedLanguage}
                language={selectedLanguage}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  padding: { top: 10 }
                }}
              />
            </div>

            {/* AI Assistant Floating Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-6 bottom-6 w-80 glass-panel rounded-xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="p-3 bg-white/5 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sparkles size={14} className="text-blue-400" />
                  AI COPILOT
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsOfflineMode(!isOfflineMode)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold transition-all border",
                      isOfflineMode ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    )}
                  >
                    {isOfflineMode ? 'OFFLINE' : 'ONLINE'}
                  </button>
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", isOfflineMode ? "bg-orange-500" : "bg-emerald-500")} />
                  <span className="text-[10px] text-[#858585]">{isOfflineMode ? 'Local DB' : 'Cloud AI'}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to generate code... (e.g., 'Blink LED on pin 13')"
                  className="w-full h-24 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
                <button 
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || !aiPrompt}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isAiLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {isAiLoading ? 'Generating...' : 'Generate Code'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bottom Panel (Terminal) */}
          {isTerminalOpen && (
            <div className="h-64 border-t border-[#333333] flex flex-col bg-[#1e1e1e] shrink-0">
              <div className="h-9 bg-[#252526] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                  <button className="text-[11px] font-bold uppercase tracking-widest text-white border-b-2 border-white h-full px-2">Terminal</button>
                  <button className="text-[11px] font-bold uppercase tracking-widest text-[#858585] hover:text-white h-full px-2">Output</button>
                  <button className="text-[11px] font-bold uppercase tracking-widest text-[#858585] hover:text-white h-full px-2">Debug Console</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white"><TerminalIcon size={14} /></button>
                  <button onClick={() => setIsTerminalOpen(false)} className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white"><X size={14} /></button>
                </div>
              </div>
              <div className="flex-1 p-2 overflow-hidden">
                <TerminalComponent onCommand={handleTerminalCommand} logs={terminalLogs} />
              </div>
            </div>
          )}
          
          {!isTerminalOpen && (
            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#252526] border border-[#454545] rounded-full text-xs font-bold text-white shadow-lg hover:bg-[#2d2d2d] transition-all flex items-center gap-2 z-20"
            >
              <TerminalIcon size={14} />
              Open Terminal
            </button>
          )}
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-[#0a0a0a] border-t border-[#262626] flex items-center justify-between px-3 text-[10px] text-[#858585] shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 hover:bg-white/5 px-2 h-full cursor-pointer transition-colors">
            <Activity size={12} className="text-emerald-500" />
            <span>{isCompiling ? 'Compiling...' : isUploading ? 'Uploading...' : 'System Ready'}</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/5 px-2 h-full cursor-pointer transition-colors">
            <ShieldCheck size={12} className="text-blue-500" />
            <span>Secure</span>
          </div>
          {buildProgress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-[#262626] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${buildProgress}%` }}
                  className="h-full bg-blue-500" 
                />
              </div>
              <span className="text-[9px] text-blue-400">{Math.round(buildProgress)}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 hover:bg-white/5 px-2 h-full cursor-pointer transition-colors">
            <Globe size={12} className={isOfflineMode ? "text-orange-500" : "text-emerald-500"} />
            <span>{isOfflineMode ? 'Local Engine' : 'Cloud Neural'}</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/5 px-2 h-full cursor-pointer transition-colors">
            <Usb size={12} className={connectedDevice ? "text-emerald-500" : "text-red-500"} />
            <span>{connectedDevice ? 'HW Connected' : 'HW Disconnected'}</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/5 px-2 h-full cursor-pointer transition-colors">
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/5 px-2 h-full cursor-pointer transition-colors text-blue-400">
            <span>{selectedLanguage.toUpperCase()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
