import React, { useState } from 'react';
import { Puzzle, Search, Download, CheckCircle2, Star, Info, RefreshCw, X } from 'lucide-react';

interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  installed: boolean;
  downloads: string;
  rating: number;
}

const AVAILABLE_EXTENSIONS: Extension[] = [
  {
    id: 'arduino-pro',
    name: 'Arduino Pro Tools',
    version: '1.2.0',
    description: 'Advanced debugging and profiling tools for Arduino boards.',
    author: 'IDEAI Team',
    installed: true,
    downloads: '12k',
    rating: 4.8
  },
  {
    id: 'esp32-wifi',
    name: 'ESP32 WiFi Manager',
    version: '0.9.5',
    description: 'Visual interface for managing ESP32 WiFi connections and credentials.',
    author: 'Espressif Systems',
    installed: false,
    downloads: '45k',
    rating: 4.5
  },
  {
    id: 'dark-theme-plus',
    name: 'Midnight Pro Theme',
    version: '2.1.0',
    description: 'A deep dark theme optimized for long hardware coding sessions.',
    author: 'Design Studio',
    installed: false,
    downloads: '8k',
    rating: 4.9
  },
  {
    id: 'serial-plotter',
    name: 'Advanced Serial Plotter',
    version: '1.0.2',
    description: 'Multi-channel real-time data visualization for serial output.',
    author: 'IDEAI Team',
    installed: true,
    downloads: '25k',
    rating: 4.7
  }
];

export const ExtensionsManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [extensions, setExtensions] = useState(AVAILABLE_EXTENSIONS);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const handleInstall = (id: string) => {
    setInstallingId(id);
    setTimeout(() => {
      setExtensions(prev => prev.map(ext => 
        ext.id === id ? { ...ext, installed: true } : ext
      ));
      setInstallingId(null);
    }, 1500);
  };

  const filteredExtensions = extensions.filter(ext => 
    ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ext.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center gap-2 mb-4">
          <Puzzle className="text-purple-400" size={20} />
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Extensions</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]" size={14} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions..."
            className="w-full bg-[#252526] border border-[#3c3c3c] rounded-md py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {filteredExtensions.map(ext => (
          <div key={ext.id} className="bg-[#252526] border border-[#333333] rounded-lg p-3 hover:border-[#454545] transition-colors group">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-xs font-bold text-[#cccccc] group-hover:text-white">{ext.name}</h3>
              <span className="text-[9px] text-[#858585] bg-[#1e1e1e] px-1.5 py-0.5 rounded">v{ext.version}</span>
            </div>
            <p className="text-[10px] text-[#858585] mb-3 line-clamp-2 leading-relaxed">
              {ext.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3 text-[9px] text-[#666666]">
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-yellow-500/50" />
                  {ext.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Download size={10} />
                  {ext.downloads}
                </div>
              </div>
              
              {ext.installed ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 size={12} />
                  INSTALLED
                </div>
              ) : (
                <button 
                  onClick={() => handleInstall(ext.id)}
                  disabled={installingId === ext.id}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {installingId === ext.id ? <RefreshCw size={10} className="animate-spin" /> : <Download size={10} />}
                  {installingId === ext.id ? 'INSTALLING...' : 'INSTALL'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
