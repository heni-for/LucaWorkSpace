import * as React from "react";
import { cn } from "@/lib/utils";
import type { Email } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, AlertCircle, Briefcase, User, Megaphone } from "lucide-react";

interface MailListProps {
  items: Email[];
  onSelect: (id: string) => void;
  selected: string | null;
  onStar?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  activeFolder?: 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash';
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Work': return Briefcase;
    case 'Personal': return User;
    case 'Promotions': return Megaphone;
    default: return null;
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'High': return 'text-red-500';
    case 'Medium': return 'text-amber-500';
    case 'Low': return 'text-green-500';
    default: return 'text-muted-foreground';
  }
};

export function MailList({ 
  items, 
  onSelect, 
  selected, 
  onStar, 
  onDelete, 
  onRestore, 
  onPermanentDelete, 
  activeFolder = 'inbox' 
}: MailListProps) {
  // Memoize the list to prevent unnecessary re-renders
  const memoizedItems = React.useMemo(() => items, [items]);

  if (memoizedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="p-4 rounded-full bg-muted/50">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No messages found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1 p-2 overflow-y-auto">
      <AnimatePresence>
        {memoizedItems.map((item, index) => {
          const CategoryIcon = getCategoryIcon(item.category);
          const PriorityIcon = item.priority === 'High' ? AlertCircle : Clock;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md",
                selected === item.id 
                  ? "bg-primary/5 border-primary/20 shadow-sm" 
                  : "bg-card/50 border-border/50 hover:bg-card hover:border-border"
              )}
              onClick={() => onSelect(item.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              role="button"
              tabIndex={0}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {item.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "font-semibold text-sm truncate",
                      !item.read && "text-foreground font-bold"
                    )}>
                      {item.sender}
                    </div>
                    
                    {!item.read && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-primary"
                      />
                    )}
                    
                    {CategoryIcon && (
                      <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={cn(
                      "text-sm font-medium truncate",
                      !item.read && "text-foreground"
                    )}>
                      {item.subject}
                    </h3>
                    
                    {item.priority && (
                      <PriorityIcon className={cn("h-3 w-3", getPriorityColor(item.priority))} />
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    "text-xs",
                    selected === item.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.date}
                  </div>
                  
                  <div className="flex gap-1">
                    {item.category && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {item.category}
                      </Badge>
                    )}
                    {item.priority && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs px-1.5 py-0.5", getPriorityColor(item.priority))}
                      >
                        {item.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.body.substring(0, 120)}
                {item.body.length > 120 && "..."}
              </div>
              
              {/* Hover Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute top-2 right-2 flex gap-1"
              >
                {onStar && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStar(item.id);
                    }}
                    className={cn(
                      "p-1 rounded-md bg-background/80 backdrop-blur-sm hover:bg-accent transition-colors",
                      item.starred && "text-yellow-500"
                    )}
                  >
                    <Star className={cn("h-3 w-3", item.starred && "fill-current")} />
                  </button>
                )}
                
                {activeFolder === 'trash' ? (
                  <>
                    {onRestore && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(item.id);
                        }}
                        className="p-1 rounded-md bg-background/80 backdrop-blur-sm hover:bg-green-500 hover:text-white transition-colors"
                        title="Restore"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                    )}
                    {onPermanentDelete && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onPermanentDelete(item.id);
                        }}
                        className="p-1 rounded-md bg-background/80 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete permanently"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </>
                ) : (
                  onDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1 rounded-md bg-background/80 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors"
                      title="Move to trash"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
