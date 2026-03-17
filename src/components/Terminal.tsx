import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalComponentProps {
  onCommand?: (command: string) => void;
  logs?: string[];
}

export const TerminalComponent = ({ onCommand, logs = [] }: TerminalComponentProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentLine = useRef<string>('');
  const lastLogIndex = useRef<number>(0);

  useEffect(() => {
    if (xtermRef.current && logs.length > lastLogIndex.current) {
      for (let i = lastLogIndex.current; i < logs.length; i++) {
        xtermRef.current.writeln(logs[i]);
      }
      lastLogIndex.current = logs.length;
      xtermRef.current.write('\r\n$ ');
    }
  }, [logs]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
      },
      fontSize: 14,
      fontFamily: 'JetBrains Mono, monospace',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    xtermRef.current = term;

    const tryFit = () => {
      // Basic guards: terminal must be opened and container must be visible
      if (!term || !term.element || !terminalRef.current) return;
      
      // Check if the terminal is actually in the document and has a parent
      if (!term.element.ownerDocument.contains(term.element)) return;
      if (!term.element.parentElement) return;

      // Check if container has dimensions
      const { offsetWidth, offsetHeight } = terminalRef.current;
      if (offsetWidth <= 0 || offsetHeight <= 0) return;

      // Deep check for xterm internal state to avoid "dimensions" error
      // We use a very defensive approach here because xterm-addon-fit 
      // accesses private internal properties that might be missing during 
      // rapid layout changes or after disposal.
      const core = (term as any)._core;
      if (!core) return;

      // In some versions it might be _renderService, in others renderer
      const renderService = core._renderService || core.renderer;
      if (!renderService) return;

      // Check for dimensions property specifically
      if (!renderService.dimensions) return;

      // Ensure dimensions are valid and have non-zero values
      const dims = renderService.dimensions;
      if (!dims.actualCellWidth || !dims.actualCellHeight) return;

      try {
        // xterm-addon-fit can throw if internal state is inconsistent
        fitAddon.fit();
      } catch (e) {
        // Ignore internal xterm errors during layout transitions
        console.warn('Terminal fit failed:', e);
      }
    };

    // Use ResizeObserver to handle container size changes (including sidebar toggles)
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
      // and ensure we fit during the next paint cycle
      rafRef.current = requestAnimationFrame(() => {
        if (xtermRef.current && xtermRef.current === term) {
          tryFit();
        }
      });
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Initial fit with a slightly longer delay to ensure DOM stability
    const initialFitTimeout = setTimeout(tryFit, 150);

    term.writeln('\x1b[1;36m[SYSTEM]\x1b[0m Nexus IDE Core v4.0.1 Initialized');
    term.writeln('\x1b[1;36m[SYSTEM]\x1b[0m WebUSB Stack: Ready');
    term.writeln('\x1b[1;36m[SYSTEM]\x1b[0m AI Copilot Engine: Online');
    term.writeln('\x1b[1;36m[SYSTEM]\x1b[0m Security Protocol: AES-256-GCM Active');
    term.writeln('\x1b[38;5;244m--------------------------------------------------\x1b[0m');
    term.writeln('Type "help" for available commands.');
    term.write('\r\n$ ');

    term.onData((data) => {
      const code = data.charCodeAt(0);
      if (code === 13) { // Enter
        term.write('\r\n');
        if (onCommand) onCommand(currentLine.current);
        currentLine.current = '';
        term.write('$ ');
      } else if (code === 127) { // Backspace
        if (currentLine.current.length > 0) {
          currentLine.current = currentLine.current.slice(0, -1);
          term.write('\b \b');
        }
      } else {
        currentLine.current += data;
        term.write(data);
      }
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      clearTimeout(initialFitTimeout);
      resizeObserver.disconnect();
      xtermRef.current = null;
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="h-full w-full" />;
};
