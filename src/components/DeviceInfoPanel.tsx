import React, { useState, useRef } from 'react';
import { Cpu, Copy, Sparkles, Shield, Info, RefreshCw, Download, Upload, History, FileDown, CheckCircle2, Usb } from 'lucide-react';
import { studyDevice } from '../services/aiService';
import { backupFirmware, restoreFirmware } from '../services/firmwareService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeviceInfoPanelProps {
  device: USBDevice | null;
  onRequestDevice: () => void;
}

export const DeviceInfoPanel = ({ device, onRequestDevice }: DeviceInfoPanelProps) => {
  const [isStudying, setIsAiStudying] = useState(false);
  const [innovationReport, setInnovationReport] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#858585] p-8 text-center">
        <Cpu size={48} className="mb-4 opacity-20" />
        <p className="text-sm">No hardware device connected via WebUSB.</p>
        <p className="text-xs mt-2 mb-6">Connect a device to read specifications and clone firmware.</p>
        <button 
          onClick={onRequestDevice}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          <Usb size={14} />
          Connect Device
        </button>
      </div>
    );
  }

  const showStatus = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatusMessage({ text, type });
    if (type !== 'info') {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleStudy = async () => {
    setIsAiStudying(true);
    showStatus('Analyzing hardware architecture...', 'info');
    try {
      const info = `
        Manufacturer: ${device.manufacturerName}
        Product: ${device.productName}
        Serial: ${device.serialNumber}
        Vendor ID: ${device.vendorId}
        Product ID: ${device.productId}
        USB Version: ${device.usbVersionMajor}.${device.usbVersionMinor}
      `;
      const report = await studyDevice(info);
      setInnovationReport(report);
      showStatus('Innovation report generated.', 'success');
    } catch (err) {
      console.error(err);
      showStatus('Failed to analyze device.', 'error');
    } finally {
      setIsAiStudying(false);
    }
  };

  const handleBackup = async () => {
    if (!device) return;
    setIsBackingUp(true);
    showStatus('Reading device firmware...', 'info');
    try {
      const result = await backupFirmware(device);
      
      // Trigger download
      const url = URL.createObjectURL(result.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showStatus(`Backup saved: ${result.filename}`, 'success');
    } catch (err: any) {
      showStatus(err.message || 'Backup failed', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !device) return;

    setIsRestoring(true);
    showStatus(`Restoring firmware from ${file.name}...`, 'info');
    try {
      await restoreFirmware(device, file);
      showStatus('Firmware restored successfully!', 'success');
    } catch (err: any) {
      showStatus(err.message || 'Restore failed', 'error');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClone = () => {
    setIsCloning(true);
    showStatus('Extracting device coding...', 'info');
    // Simulate firmware extraction
    setTimeout(() => {
      setIsCloning(false);
      showStatus('Device cloned successfully. Ready for replication.', 'success');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-y-auto p-4 custom-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Cpu className="text-blue-400" size={24} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Device Intelligence</h2>
          <p className="text-[10px] text-[#858585] uppercase tracking-widest">Hardware Analysis & Cloning</p>
        </div>
      </div>

      {statusMessage && (
        <div className={cn(
          "mb-4 p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2",
          statusMessage.type === 'info' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
          statusMessage.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
          "bg-red-500/10 text-red-400 border border-red-500/20"
        )}>
          {statusMessage.type === 'info' && <RefreshCw size={14} className="animate-spin" />}
          {statusMessage.type === 'success' && <CheckCircle2 size={14} />}
          {statusMessage.type === 'error' && <Shield size={14} />}
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-[#252526] border border-[#333333] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Info size={16} />
            <span className="text-xs font-bold uppercase">Specifications</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#858585]">Product</span>
              <span className="text-white font-mono">{device.productName || 'Unknown'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#858585]">Manufacturer</span>
              <span className="text-white font-mono">{device.manufacturerName || 'Unknown'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#858585]">Serial Number</span>
              <span className="text-white font-mono">{device.serialNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#858585]">USB Class</span>
              <span className="text-white font-mono">{device.deviceClass}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#252526] border border-[#333333] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <History size={16} />
            <span className="text-xs font-bold uppercase">Firmware Management</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleBackup}
              disabled={isBackingUp || isRestoring}
              className="flex flex-col items-center gap-2 bg-[#333333] hover:bg-[#444444] text-white p-3 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
            >
              {isBackingUp ? <RefreshCw size={18} className="animate-spin" /> : <FileDown size={18} className="text-blue-400" />}
              BACKUP
            </button>
            <button 
              onClick={handleRestoreClick}
              disabled={isBackingUp || isRestoring}
              className="flex flex-col items-center gap-2 bg-[#333333] hover:bg-[#444444] text-white p-3 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
            >
              {isRestoring ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} className="text-emerald-400" />}
              RESTORE
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".bin,.hex,.dfu"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleClone}
            disabled={isCloning}
            className="flex-1 flex items-center justify-center gap-2 bg-[#333333] hover:bg-[#444444] text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isCloning ? <RefreshCw size={14} className="animate-spin" /> : <Copy size={14} />}
            {isCloning ? 'Extracting...' : 'Clone Device'}
          </button>
          <button 
            onClick={handleStudy}
            disabled={isStudying}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isStudying ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isStudying ? 'Analyzing...' : 'Study Device'}
          </button>
        </div>
      </div>

      {innovationReport && (
        <div className="bg-[#252526] border border-blue-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Innovation Report</span>
            </div>
            <button onClick={() => setInnovationReport(null)} className="text-[#858585] hover:text-white">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="prose prose-invert prose-xs max-w-none text-[#cccccc]">
            <Markdown>{innovationReport}</Markdown>
          </div>
          <button className="w-full mt-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Download size={14} />
            Apply Recommended Firmware Upgrade
          </button>
        </div>
      )}
    </div>
  );
};

