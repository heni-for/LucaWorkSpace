'use client';

import * as React from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Code, 
  Terminal, 
  Database, 
  Settings, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Copy, 
  Move, 
  Edit3, 
  FolderPlus, 
  FilePlus,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Package,
  Play,
  Square,
  RefreshCw,
  Zap,
  Cpu,
  HardDrive,
  Network,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Layers,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Star,
  Bookmark,
  History,
  Clock,
  Filter,
  SortAsc,
  SortDesc
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
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { CodeEditor } from '@/components/workspace/code-editor';
import { TerminalEmulator } from '@/components/workspace/terminal-emulator';
import { FileManager } from '@/components/workspace/file-manager';
import { AdvancedCard } from '@/components/ui/advanced-card';

// Mock data for workspace
interface WorkspaceFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  lastModified: string;
  path: string;
  isOpen?: boolean;
  content?: string;
  language?: string;
}

interface WorkspaceProject {
  id: string;
  name: string;
  type: string;
  description: string;
  lastModified: string;
  files: number;
  size: number;
  status: 'active' | 'inactive' | 'archived';
}

const mockFiles: WorkspaceFile[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    lastModified: '2 hours ago',
    path: '/src',
    isOpen: true
  },
  {
    id: '2',
    name: 'components',
    type: 'folder',
    lastModified: '1 hour ago',
    path: '/src/components',
    isOpen: false
  },
  {
    id: '3',
    name: 'app.tsx',
    type: 'file',
    extension: 'tsx',
    size: 2048,
    lastModified: '30 minutes ago',
    path: '/src/app.tsx',
    language: 'typescript',
    content: `import React from 'react';
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app">
      <h1>LUCA Platform</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}`
  },
  {
    id: '4',
    name: 'styles.css',
    type: 'file',
    extension: 'css',
    size: 1024,
    lastModified: '1 hour ago',
    path: '/src/styles.css',
    language: 'css',
    content: `.app {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
}`
  },
  {
    id: '5',
    name: 'package.json',
    type: 'file',
    extension: 'json',
    size: 512,
    lastModified: '2 hours ago',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "luca-platform",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "next": "^15.0.0"
  }
}`
  }
];

const mockProjects: WorkspaceProject[] = [
  {
    id: '1',
    name: 'LUCA Platform',
    type: 'Next.js',
    description: 'The most powerful AI platform for Tunisian professionals',
    lastModified: '2 hours ago',
    files: 156,
    size: 45.2,
    status: 'active'
  },
  {
    id: '2',
    name: 'E-commerce App',
    type: 'React',
    description: 'Modern e-commerce solution with AI recommendations',
    lastModified: '1 day ago',
    files: 89,
    size: 23.1,
    status: 'active'
  },
  {
    id: '3',
    name: 'Mobile Dashboard',
    type: 'React Native',
    description: 'Cross-platform mobile dashboard',
    lastModified: '3 days ago',
    files: 67,
    size: 18.7,
    status: 'inactive'
  }
];

export default function WorkspaceToolsPage() {
  const [selectedFile, setSelectedFile] = React.useState<WorkspaceFile | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('files');
  const [terminalOutput, setTerminalOutput] = React.useState<string[]>([]);
  const [terminalInput, setTerminalInput] = React.useState('');
  const [isTerminalRunning, setIsTerminalRunning] = React.useState(false);

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return mockFiles;
    return mockFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleTerminalCommand = (command: string) => {
    const newOutput = [...terminalOutput, `$ ${command}`];
    
    // Simulate command execution
    switch (command.toLowerCase()) {
      case 'ls':
        newOutput.push('src/  package.json  README.md');
        break;
      case 'pwd':
        newOutput.push('/workspace/luca-platform');
        break;
      case 'npm run dev':
        newOutput.push('Starting development server...');
        newOutput.push('Server running on http://localhost:3000');
        setIsTerminalRunning(true);
        break;
      case 'npm run build':
        newOutput.push('Building application...');
        newOutput.push('Build completed successfully!');
        break;
      default:
        newOutput.push(`Command not found: ${command}`);
    }
    
    setTerminalOutput(newOutput);
    setTerminalInput('');
  };

  const getFileIcon = (file: WorkspaceFile) => {
    if (file.type === 'folder') return Folder;
    
    switch (file.extension) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return Code;
      case 'css':
      case 'scss':
        return FileText;
      case 'json':
        return Settings;
      default:
        return File;
    }
  };

  const getLanguageColor = (language?: string) => {
    switch (language) {
      case 'typescript':
        return 'text-blue-500';
      case 'css':
        return 'text-pink-500';
      case 'json':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold">Workspace Tools</h1>
            <p className="text-sm text-muted-foreground">
              Complete development environment for your projects
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col"
        >
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search files..." 
                className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* File Explorer */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">File Explorer</h3>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <FolderPlus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Folder</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <FilePlus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New File</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-1">
                {filteredFiles.map((file, index) => {
                  const Icon = getFileIcon(file);
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-all hover:bg-accent",
                          selectedFile?.id === file.id && "bg-primary/10 text-primary"
                        )}
                        onClick={() => setSelectedFile(file)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        {file.extension && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {file.extension}
                          </Badge>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-card/50 backdrop-blur-sm">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="terminal" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="manager" className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Manager
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Files Tab */}
            <TabsContent value="files" className="flex-1 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockFiles.map((file, index) => {
                  const Icon = getFileIcon(file);
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AdvancedCard
                        title={file.name}
                        description={`${file.type === 'folder' ? 'Folder' : 'File'} • ${file.lastModified}`}
                        variant="glass"
                        size="sm"
                        interactive
                        hoverable
                        onClick={() => setSelectedFile(file)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.type === 'file' && file.size && `${(file.size / 1024).toFixed(1)} KB`}
                                {file.type === 'folder' && 'Folder'}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </AdvancedCard>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Editor Tab */}
            <TabsContent value="editor" className="flex-1 flex flex-col">
              <CodeEditor
                file={selectedFile ? {
                  id: selectedFile.id,
                  name: selectedFile.name,
                  content: selectedFile.content || '',
                  language: selectedFile.language || 'typescript',
                  path: selectedFile.path
                } : undefined}
                onSave={(content) => {
                  console.log('Saving file:', content);
                }}
                onRun={() => {
                  console.log('Running code');
                }}
                className="flex-1"
              />
            </TabsContent>

            {/* Terminal Tab */}
            <TabsContent value="terminal" className="flex-1 flex flex-col">
              <TerminalEmulator
                onCommand={(command) => {
                  console.log('Terminal command:', command);
                }}
                initialDirectory="/workspace/luca-platform"
                className="flex-1"
              />
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="flex-1 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AdvancedCard
                      title={project.name}
                      description={project.description}
                      variant="glass"
                      size="md"
                      interactive
                      hoverable
                      className="cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{project.type}</Badge>
                          <Badge 
                            variant={project.status === 'active' ? 'default' : 'secondary'}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Files</p>
                            <p className="font-semibold">{project.files}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Size</p>
                            <p className="font-semibold">{project.size} MB</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Modified {project.lastModified}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AdvancedCard>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Manager Tab */}
            <TabsContent value="manager" className="flex-1 flex flex-col">
              <FileManager
                onFileSelect={(file) => {
                  console.log('File selected:', file);
                }}
                onFileOpen={(file) => {
                  console.log('File opened:', file);
                  setSelectedFile(file);
                  setActiveTab('editor');
                }}
                onFileDelete={(file) => {
                  console.log('File deleted:', file);
                }}
                onFileRename={(file, newName) => {
                  console.log('File renamed:', file, 'to', newName);
                }}
                onFileMove={(file, newPath) => {
                  console.log('File moved:', file, 'to', newPath);
                }}
                onFileCopy={(file) => {
                  console.log('File copied:', file);
                }}
                onFolderCreate={(name, path) => {
                  console.log('Folder created:', name, 'at', path);
                }}
                onFileUpload={(files) => {
                  console.log('Files uploaded:', files);
                }}
                className="flex-1"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
