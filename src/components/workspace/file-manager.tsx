'use client';

import * as React from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Code, 
  Image, 
  Video, 
  Music, 
  Archive, 
  FileSpreadsheet,
  FolderOpen,
  FolderPlus,
  FilePlus,
  Upload,
  Download,
  Copy,
  Move,
  Edit3,
  Trash2,
  Star,
  MoreHorizontal,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Share2,
  Link,
  Calendar,
  Clock,
  User,
  Tag,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  HardDrive,
  Cloud,
  Wifi,
  WifiOff,
  Zap,
  Settings,
  Maximize2,
  Minimize2
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

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  lastModified: string;
  path: string;
  isHidden?: boolean;
  isStarred?: boolean;
  permissions?: string;
  owner?: string;
  tags?: string[];
  thumbnail?: string;
}

interface FileManagerProps {
  className?: string;
  onFileSelect?: (file: FileItem) => void;
  onFileOpen?: (file: FileItem) => void;
  onFileDelete?: (file: FileItem) => void;
  onFileRename?: (file: FileItem, newName: string) => void;
  onFileMove?: (file: FileItem, newPath: string) => void;
  onFileCopy?: (file: FileItem) => void;
  onFolderCreate?: (name: string, path: string) => void;
  onFileUpload?: (files: FileList) => void;
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    lastModified: '2 hours ago',
    path: '/src',
    permissions: 'drwxr-xr-x',
    owner: 'luca-user',
    tags: ['source', 'development']
  },
  {
    id: '2',
    name: 'components',
    type: 'folder',
    lastModified: '1 hour ago',
    path: '/src/components',
    permissions: 'drwxr-xr-x',
    owner: 'luca-user',
    tags: ['components', 'ui']
  },
  {
    id: '3',
    name: 'app.tsx',
    type: 'file',
    extension: 'tsx',
    size: 2048,
    lastModified: '30 minutes ago',
    path: '/src/app.tsx',
    permissions: '-rw-r--r--',
    owner: 'luca-user',
    tags: ['typescript', 'react'],
    isStarred: true
  },
  {
    id: '4',
    name: 'styles.css',
    type: 'file',
    extension: 'css',
    size: 1024,
    lastModified: '1 hour ago',
    path: '/src/styles.css',
    permissions: '-rw-r--r--',
    owner: 'luca-user',
    tags: ['css', 'styling']
  },
  {
    id: '5',
    name: 'package.json',
    type: 'file',
    extension: 'json',
    size: 512,
    lastModified: '2 hours ago',
    path: '/package.json',
    permissions: '-rw-r--r--',
    owner: 'luca-user',
    tags: ['config', 'dependencies']
  },
  {
    id: '6',
    name: 'logo.png',
    type: 'file',
    extension: 'png',
    size: 15360,
    lastModified: '3 hours ago',
    path: '/public/logo.png',
    permissions: '-rw-r--r--',
    owner: 'luca-user',
    tags: ['image', 'logo'],
    thumbnail: 'https://picsum.photos/64/64?random=1'
  },
  {
    id: '7',
    name: 'README.md',
    type: 'file',
    extension: 'md',
    size: 2048,
    lastModified: '1 day ago',
    path: '/README.md',
    permissions: '-rw-r--r--',
    owner: 'luca-user',
    tags: ['documentation', 'readme']
  },
  {
    id: '8',
    name: '.env',
    type: 'file',
    extension: 'env',
    size: 256,
    lastModified: '2 days ago',
    path: '/.env',
    permissions: '-rw-r--r--',
    owner: 'luca-user',
    tags: ['config', 'environment'],
    isHidden: true
  }
];

const getFileIcon = (file: FileItem) => {
  if (file.type === 'folder') return Folder;
  
  switch (file.extension) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return Code;
    case 'css':
    case 'scss':
    case 'sass':
      return FileText;
    case 'json':
    case 'env':
      return Settings;
    case 'md':
      return FileText;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return Image;
    case 'mp4':
    case 'avi':
    case 'mov':
      return Video;
    case 'mp3':
    case 'wav':
    case 'flac':
      return Music;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return Archive;
    case 'pdf':
    case 'xlsx':
    case 'csv':
    case 'docx':
    case 'doc':
    case 'pptx':
    case 'ppt':
      return FileSpreadsheet;
    default:
      return File;
  }
};

const getFileTypeColor = (file: FileItem) => {
  if (file.type === 'folder') return 'text-blue-500';
  
  switch (file.extension) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return 'text-blue-500';
    case 'css':
    case 'scss':
    case 'sass':
      return 'text-pink-500';
    case 'json':
    case 'env':
      return 'text-yellow-500';
    case 'md':
      return 'text-gray-500';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return 'text-green-500';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'text-purple-500';
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'text-orange-500';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return 'text-red-500';
    case 'pdf':
    case 'xlsx':
    case 'csv':
    case 'docx':
    case 'doc':
    case 'pptx':
    case 'ppt':
      return 'text-blue-600';
    default:
      return 'text-muted-foreground';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export function FileManager({ 
  className, 
  onFileSelect, 
  onFileOpen, 
  onFileDelete, 
  onFileRename, 
  onFileMove, 
  onFileCopy, 
  onFolderCreate, 
  onFileUpload 
}: FileManagerProps) {
  const [files, setFiles] = React.useState<FileItem[]>(mockFiles);
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'size' | 'date' | 'type'>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showHidden, setShowHidden] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState('/');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const filteredFiles = React.useMemo(() => {
    let filtered = files.filter(file => 
      showHidden || !file.isHidden
    );

    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type) || (a.extension || '').localeCompare(b.extension || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, sortBy, sortOrder, showHidden]);

  const handleFileSelect = (file: FileItem, multiSelect = false) => {
    if (multiSelect) {
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(file.id)) {
          newSet.delete(file.id);
        } else {
          newSet.add(file.id);
        }
        return newSet;
      });
    } else {
      setSelectedFiles(new Set([file.id]));
    }
    onFileSelect?.(file);
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
    } else {
      onFileOpen?.(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadProgress(0);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      onFileUpload?.(files);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name,
        type: 'folder',
        lastModified: 'Just now',
        path: `${currentPath}/${name}`,
        permissions: 'drwxr-xr-x',
        owner: 'luca-user',
        tags: []
      };
      setFiles(prev => [...prev, newFolder]);
      onFolderCreate?.(name, currentPath);
    }
  };

  const handleDeleteFile = (file: FileItem) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      onFileDelete?.(file);
    }
  };

  const handleRenameFile = (file: FileItem) => {
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, name: newName } : f
      ));
      onFileRename?.(file, newName);
    }
  };

  const handleCopyFile = (file: FileItem) => {
    const newFile: FileItem = {
      ...file,
      id: Date.now().toString(),
      name: `${file.name} (Copy)`,
      path: `${file.path} (Copy)`
    };
    setFiles(prev => [...prev, newFile]);
    onFileCopy?.(file);
  };

  const toggleStar = (file: FileItem) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, isStarred: !f.isStarred } : f
    ));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col h-full bg-background", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <HardDrive className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold">File Manager</h1>
            <p className="text-sm text-muted-foreground">
              {currentPath} • {filteredFiles.length} items
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </span>
            </Button>
          </label>
          
          <Button variant="outline" size="sm" onClick={handleCreateFolder}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          
          <Button size="sm">
            <FilePlus className="h-4 w-4 mr-2" />
            New File
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card/30">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Sort by {sortBy}
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size')}>
                Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('date')}>
                Date Modified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                Type
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenuCheckboxItem
            checked={showHidden}
            onCheckedChange={setShowHidden}
          >
            Show Hidden Files
          </DropdownMenuCheckboxItem>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 border-b bg-card/30">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Uploading files...</span>
            <span className="text-sm text-muted-foreground ml-auto">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* File Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              const isSelected = selectedFiles.has(file.id);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AdvancedCard
                    title={file.name}
                    description={`${file.type === 'folder' ? 'Folder' : 'File'} • ${file.lastModified}`}
                    variant="glass"
                    size="sm"
                    interactive
                    hoverable
                    onClick={() => handleFileSelect(file)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className={cn("h-5 w-5", getFileTypeColor(file))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.type === 'file' && file.size && formatFileSize(file.size)}
                            {file.type === 'folder' && 'Folder'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {file.isStarred && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        {file.isHidden && (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFileDoubleClick(file)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStar(file)}>
                              <Star className="h-4 w-4 mr-2" />
                              {file.isStarred ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyFile(file)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRenameFile(file)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteFile(file)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </AdvancedCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              const isSelected = selectedFiles.has(file.id);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border transition-all hover:bg-accent cursor-pointer",
                      isSelected && "bg-primary/10 border-primary/20"
                    )}
                    onClick={() => handleFileSelect(file)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", getFileTypeColor(file))} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        {file.isStarred && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        {file.isHidden && (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {file.type === 'file' && file.size && formatFileSize(file.size)}
                        {file.type === 'folder' && 'Folder'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{file.lastModified}</span>
                      <span>{file.permissions}</span>
                      <span>{file.owner}</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFileDoubleClick(file)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStar(file)}>
                          <Star className="h-4 w-4 mr-2" />
                          {file.isStarred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyFile(file)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRenameFile(file)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteFile(file)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default FileManager;
