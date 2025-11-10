'use client';

import * as React from 'react';
import { 
  Terminal, 
  Play, 
  Square, 
  RefreshCw, 
  Download, 
  Upload, 
  Settings, 
  Maximize2, 
  Minimize2,
  Copy,
  Trash2,
  Folder,
  File,
  Code,
  Database,
  Network,
  Cpu,
  HardDrive,
  Zap,
  ChevronRight,
  MoreHorizontal,
  Command,
  Power,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

interface TerminalTab {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
  outputs: TerminalOutput[];
}

interface TerminalEmulatorProps {
  className?: string;
  onCommand?: (command: string) => void;
  initialDirectory?: string;
}

const mockCommands = {
  'ls': 'src/  package.json  README.md  node_modules/  .git/',
  'pwd': '/workspace/luca-platform',
  'whoami': 'luca-user',
  'date': new Date().toLocaleString(),
  'npm run dev': 'Starting development server...\n✓ Ready in 2.3s\nLocal: http://localhost:3000',
  'npm run build': 'Building application...\n✓ Compiled successfully\nBuild completed in 45.2s',
  'git status': 'On branch main\nYour branch is up to date with origin/main\n\nnothing to commit, working tree clean',
  'git log --oneline': 'a1b2c3d feat: add workspace tools\nb2c3d4e fix: mail interface design\nc3d4e5f feat: implement AI voice assistant',
  'node --version': 'v18.17.0',
  'npm --version': '9.6.7',
  'python --version': 'Python 3.11.4',
  'docker --version': 'Docker version 24.0.5',
  'kubectl version': 'Client Version: v1.28.0\nServer Version: v1.28.0',
  'ps aux': 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  16800  1200 ?        Ss   10:00   0:01 /sbin/init\nluca-user  1234  0.1  0.5  12345  5678 pts/0    Ss   10:05   0:00 bash',
  'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  8.5G   11G  45% /\n/dev/sda2       100G   45G   50G  48% /home',
  'free -h': '              total        used        free      shared  buff/cache   available\nMem:           7.8G        2.1G        3.2G        256M        2.5G        5.2G\nSwap:          2.0G          0B        2.0G',
  'top': 'top - 10:30:15 up 1 day, 2:30,  2 users,  load average: 0.15, 0.10, 0.05\nTasks: 156 total,   1 running, 155 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  2.1 us,  0.8 sy,  0.0 ni, 97.0 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st\nMiB Mem :   7984.0 total,   2145.2 free,   3256.8 used,   2582.0 buff/cache\nMiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5200.0 avail Mem'
};

export function TerminalEmulator({ className, onCommand, initialDirectory = '/workspace' }: TerminalEmulatorProps) {
  const [tabs, setTabs] = React.useState<TerminalTab[]>([
    {
      id: '1',
      name: 'Terminal 1',
      cwd: initialDirectory,
      isActive: true,
      outputs: [
        {
          id: '1',
          type: 'info',
          content: 'Welcome to LUCA Platform Terminal',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'info',
          content: 'Type "help" for available commands',
          timestamp: new Date()
        }
      ]
    }
  ]);
  
  const [currentInput, setCurrentInput] = React.useState('');
  const [commandHistory, setCommandHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = React.useState(14);
  const [showTimestamp, setShowTimestamp] = React.useState(false);

  const activeTab = tabs.find(tab => tab.isActive) || tabs[0];
  const outputRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeTab.outputs]);

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      type: 'command',
      content: command,
      timestamp: new Date()
    };

    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Update active tab
    setTabs(prev => prev.map(tab => 
      tab.isActive 
        ? { ...tab, outputs: [...tab.outputs, newOutput] }
        : tab
    ));

    // Execute command
    setTimeout(() => {
      const result = mockCommands[command.toLowerCase() as keyof typeof mockCommands] || 
        `Command not found: ${command}\nType "help" for available commands`;
      
      const outputLines = result.split('\n');
      outputLines.forEach((line, index) => {
        setTimeout(() => {
          const output: TerminalOutput = {
            id: `${Date.now()}-${index}`,
            type: line.includes('error') || line.includes('Error') ? 'error' : 'output',
            content: line,
            timestamp: new Date()
          };

          setTabs(prev => prev.map(tab => 
            tab.isActive 
              ? { ...tab, outputs: [...tab.outputs, output] }
              : tab
          ));
        }, index * 50);
      });
    }, 100);

    onCommand?.(command);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete logic could go here
    }
  };

  const clearTerminal = () => {
    setTabs(prev => prev.map(tab => 
      tab.isActive 
        ? { ...tab, outputs: [] }
        : tab
    ));
  };

  const newTab = () => {
    const newTab: TerminalTab = {
      id: Date.now().toString(),
      name: `Terminal ${tabs.length + 1}`,
      cwd: initialDirectory,
      isActive: false,
      outputs: []
    };
    
    setTabs(prev => [
      ...prev.map(tab => ({ ...tab, isActive: false })),
      { ...newTab, isActive: true }
    ]);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (filtered.length > 0 && !filtered.some(tab => tab.isActive)) {
        filtered[0].isActive = true;
      }
      return filtered;
    });
  };

  const switchTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })));
  };

  const getOutputColor = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'command':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col h-full bg-background",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Terminal className="h-4 w-4 text-green-400" />
            <span className="font-medium text-sm">Terminal</span>
            <Badge variant="outline" className="text-xs">
              {activeTab.cwd}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Management */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "px-3 py-1 text-xs rounded-t-md border-b-0 transition-colors",
                  tab.isActive 
                    ? "bg-background border border-b-0 text-foreground" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
                onClick={() => switchTab(tab.id)}
              >
                {tab.name}
                {tabs.length > 1 && (
                  <button
                    className="ml-2 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={newTab}>
              +
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Terminal Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={clearTerminal}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear Terminal</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Output</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download Log</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={showTimestamp}
                  onCheckedChange={setShowTimestamp}
                >
                  Show Timestamps
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Theme
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Type className="h-4 w-4 mr-2" />
                  Font Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className={cn(
          "flex-1 p-4 font-mono text-sm overflow-y-auto",
          theme === 'dark' ? "bg-black text-green-400" : "bg-gray-50 text-gray-800"
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="space-y-1">
          {activeTab.outputs.map((output) => (
            <div key={output.id} className="flex items-start gap-2">
              {showTimestamp && (
                <span className="text-gray-500 text-xs">
                  {output.timestamp.toLocaleTimeString()}
                </span>
              )}
              <span className={cn("flex-shrink-0", getOutputColor(output.type))}>
                {output.type === 'command' ? '$' : '>'}
              </span>
              <span className={cn("flex-1", getOutputColor(output.type))}>
                {output.content}
              </span>
            </div>
          ))}
          
          {/* Current Input Line */}
          <div className="flex items-center gap-2">
            {showTimestamp && (
              <span className="text-gray-500 text-xs">
                {new Date().toLocaleTimeString()}
              </span>
            )}
            <span className="text-green-400 flex-shrink-0">$</span>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 bg-transparent border-none outline-none",
                theme === 'dark' ? "text-green-400" : "text-gray-800"
              )}
              placeholder="Enter command..."
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-t text-xs",
        theme === 'dark' ? "bg-gray-900 text-gray-400" : "bg-gray-100 text-gray-600"
      )}>
        <div className="flex items-center gap-4">
          <span>Terminal {tabs.findIndex(tab => tab.isActive) + 1}</span>
          <span>{activeTab.cwd}</span>
          <span>{activeTab.outputs.length} lines</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Connected
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            CPU: 15%
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            Disk: 45%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default TerminalEmulator;
