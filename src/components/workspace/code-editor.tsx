'use client';

import * as React from 'react';
import { 
  Code, 
  FileText, 
  Save, 
  Copy, 
  Download, 
  Upload, 
  Play, 
  Square, 
  Maximize2, 
  Minimize2,
  Settings,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Table,
  MoreHorizontal,
  ChevronDown,
  Zap,
  Eye,
  EyeOff,
  Search,
  Replace,
  Undo,
  Redo,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet
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
import { AdvancedCard } from '@/components/ui/advanced-card';

interface CodeEditorProps {
  file?: {
    id: string;
    name: string;
    content: string;
    language: string;
    path: string;
  };
  onSave?: (content: string) => void;
  onRun?: () => void;
  className?: string;
}

const languageConfigs = {
  typescript: {
    name: 'TypeScript',
    icon: Code,
    color: 'text-blue-500',
    extensions: ['ts', 'tsx']
  },
  javascript: {
    name: 'JavaScript',
    icon: Code,
    color: 'text-yellow-500',
    extensions: ['js', 'jsx']
  },
  css: {
    name: 'CSS',
    icon: FileText,
    color: 'text-pink-500',
    extensions: ['css', 'scss', 'sass']
  },
  html: {
    name: 'HTML',
    icon: FileText,
    color: 'text-orange-500',
    extensions: ['html', 'htm']
  },
  json: {
    name: 'JSON',
    icon: FileText,
    color: 'text-green-500',
    extensions: ['json']
  },
  python: {
    name: 'Python',
    icon: Code,
    color: 'text-blue-600',
    extensions: ['py']
  },
  java: {
    name: 'Java',
    icon: Code,
    color: 'text-red-500',
    extensions: ['java']
  },
  cpp: {
    name: 'C++',
    icon: Code,
    color: 'text-purple-500',
    extensions: ['cpp', 'cc', 'cxx']
  },
  sql: {
    name: 'SQL',
    icon: FileText,
    color: 'text-cyan-500',
    extensions: ['sql']
  },
  markdown: {
    name: 'Markdown',
    icon: FileText,
    color: 'text-gray-500',
    extensions: ['md', 'markdown']
  }
};

const getLanguageConfig = (language: string) => {
  return languageConfigs[language as keyof typeof languageConfigs] || {
    name: language,
    icon: FileText,
    color: 'text-muted-foreground',
    extensions: []
  };
};

export function CodeEditor({ file, onSave, onRun, className }: CodeEditorProps) {
  const [content, setContent] = React.useState(file?.content || '');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showLineNumbers, setShowLineNumbers] = React.useState(true);
  const [wordWrap, setWordWrap] = React.useState(true);
  const [fontSize, setFontSize] = React.useState(14);
  const [theme, setTheme] = React.useState('dark');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [replaceQuery, setReplaceQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState({ line: 1, column: 1 });
  const [isModified, setIsModified] = React.useState(false);

  React.useEffect(() => {
    if (file?.content !== content) {
      setIsModified(true);
    }
  }, [content, file?.content]);

  const languageConfig = getLanguageConfig(file?.language || '');
  const Icon = languageConfig.icon;

  const handleSave = () => {
    onSave?.(content);
    setIsModified(false);
  };

  const handleRun = () => {
    onRun?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Ctrl+F to search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
    }
    
    // Ctrl+H to replace
    if (e.ctrlKey && e.key === 'h') {
      e.preventDefault();
      setShowSearch(true);
    }
    
    // F11 to toggle fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      setIsFullscreen(!isFullscreen);
    }
  };

  const lines = content.split('\n');
  const totalLines = lines.length;
  const totalChars = content.length;

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
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 ml-4">
              <Icon className={cn("h-4 w-4", languageConfig.color)} />
              <span className="font-medium text-sm">{file.name}</span>
              {isModified && (
                <Badge variant="outline" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search/Replace */}
          <DropdownMenu open={showSearch} onOpenChange={setShowSearch}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Replace</label>
                  <Input
                    placeholder="Replace with..."
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Find
                  </Button>
                  <Button size="sm" className="flex-1">
                    Replace All
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Editor Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save (Ctrl+S)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRun}>
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Run Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                >
                  Show Line Numbers
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={wordWrap}
                  onCheckedChange={setWordWrap}
                >
                  Word Wrap
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Palette className="h-4 w-4 mr-2" />
                  Theme Settings
                </DropdownMenuItem>
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
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className="bg-muted/30 border-r p-2 text-xs text-muted-foreground font-mono select-none">
            {lines.map((_, index) => (
              <div key={index} className="h-5 leading-5 text-right">
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* Code Area */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 w-full p-4 font-mono text-sm bg-transparent border-none outline-none resize-none",
              "text-foreground placeholder:text-muted-foreground",
              wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
            )}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Start typing your code..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-card/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
          <span>{totalLines} lines</span>
          <span>{totalChars} characters</span>
          {file && (
            <span className={cn("flex items-center gap-1", languageConfig.color)}>
              <Icon className="h-3 w-3" />
              {languageConfig.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>{theme === 'dark' ? 'Dark' : 'Light'} Theme</span>
          <span>{fontSize}px</span>
        </div>
      </div>
    </motion.div>
  );
}

export default CodeEditor;
