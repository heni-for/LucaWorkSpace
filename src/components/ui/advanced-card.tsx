/**
 * Advanced Card Component
 * Professional, dynamic card with animations and interactions
 */

"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { 
  MoreHorizontal, 
  Star, 
  Heart, 
  Share2, 
  Bookmark, 
  Eye,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

interface AdvancedCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  actions?: CardAction[];
  badges?: CardBadge[];
  metrics?: CardMetric[];
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
  loading?: boolean;
  error?: string;
  onClose?: () => void;
  closable?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  animation?: 'none' | 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number;
}

interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface CardBadge {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  color?: string;
}

interface CardMetric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

const variants = {
  default: 'bg-background border border-border shadow-sm',
  elevated: 'bg-background border-0 shadow-lg',
  outlined: 'bg-background border-2 border-border shadow-none',
  glass: 'bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg',
  gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-border/50 shadow-lg',
};

const sizes = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const animations = {
  none: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
};

const statusIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info,
  pending: Clock,
};

const statusColors = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  pending: 'text-gray-500',
};

export function AdvancedCard({
  title,
  description,
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  hoverable = true,
  selectable = false,
  selected = false,
  onSelect,
  onClick,
  onDoubleClick,
  actions = [],
  badges = [],
  metrics = [],
  status,
  loading = false,
  error,
  onClose,
  closable = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  animation = 'fade',
  delay = 0,
}: AdvancedCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const StatusIcon = status ? statusIcons[status] : null;

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(!selected);
    } else if (onClick) {
      onClick();
    }
  };

  const handleDragStart = (e: any) => {
    if (draggable && onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragEnd = (e: any) => {
    if (draggable && onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={animations[animation].initial}
        animate={animations[animation].animate}
        exit={animations[animation].exit}
        transition={{ delay: delay / 1000 }}
        className={cn(
          'relative group',
          interactive && 'cursor-pointer',
          selectable && 'cursor-pointer',
          draggable && 'cursor-move',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={handleClick}
      onDoubleClick={onDoubleClick}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Card
          className={cn(
            variants[variant],
            sizes[size],
            hoverable && 'transition-all duration-300',
            hoverable && isHovered && 'shadow-xl scale-[1.02]',
            isPressed && 'scale-[0.98]',
            selected && 'ring-2 ring-primary ring-offset-2',
            loading && 'animate-pulse',
            error && 'border-destructive',
            className
          )}
        >
          {/* Header */}
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg font-semibold truncate">
                    {title}
                  </CardTitle>
                  {StatusIcon && (
                    <StatusIcon className={cn('h-5 w-5', statusColors[status!])} />
                  )}
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Close Button */}
              {closable && onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant}
                    className={cn(
                      'text-xs',
                      badge.color && `bg-${badge.color}/10 text-${badge.color} border-${badge.color}/20`
                    )}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-4">
            {loading && (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!loading && !error && children}

            {/* Metrics */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {metric.icon && (
                      <div className="flex-shrink-0">
                        {metric.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium">{metric.value}</p>
                        {metric.trend && (
                          <div className={cn(
                            'flex items-center gap-1',
                            metric.trend === 'up' && 'text-green-500',
                            metric.trend === 'down' && 'text-red-500',
                            metric.trend === 'neutral' && 'text-gray-500'
                          )}>
                            <TrendingUp className={cn(
                              'h-3 w-3',
                              metric.trend === 'down' && 'rotate-180'
                            )} />
                            {metric.change && (
                              <span className="text-xs">{metric.change}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    disabled={action.disabled}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
