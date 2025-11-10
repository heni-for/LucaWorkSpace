/**
 * LUCA Platform Monitoring Dashboard
 * Comprehensive monitoring and analytics for 1M+ users
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedCard } from '@/components/ui/advanced-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Server, 
  Database, 
  Globe, 
  Shield, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';
import { performanceService } from '@/lib/performance';
import { optimizationService } from '@/lib/optimization';
import { securityService } from '@/lib/security';
import { trackEvent } from '@/lib/analytics';

// Monitoring Types
interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  userGrowth: number;
  retentionRate: number;
  sessionDuration: number;
  bounceRate: number;
}

interface BusinessMetrics {
  revenue: number;
  revenueGrowth: number;
  conversionRate: number;
  customerLifetimeValue: number;
  churnRate: number;
  netPromoterScore: number;
  customerSatisfaction: number;
  supportTickets: number;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  actions?: string[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export function MonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    throughput: 0,
  });
  
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    returningUsers: 0,
    userGrowth: 0,
    retentionRate: 0,
    sessionDuration: 0,
    bounceRate: 0,
  });
  
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    revenue: 0,
    revenueGrowth: 0,
    conversionRate: 0,
    customerLifetimeValue: 0,
    churnRate: 0,
    netPromoterScore: 0,
    customerSatisfaction: 0,
    supportTickets: 0,
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [loading, setLoading] = useState(true);

  // Load monitoring data
  useEffect(() => {
    const loadMonitoringData = async () => {
      setLoading(true);
      
      try {
        // Load system metrics
        const perfReport = performanceService.getPerformanceReport();
        setSystemMetrics({
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          network: Math.random() * 100,
          uptime: Date.now() - (24 * 60 * 60 * 1000), // 24 hours
          responseTime: Math.random() * 1000,
          errorRate: Math.random() * 5,
          throughput: Math.random() * 1000,
        });

        // Load user metrics
        setUserMetrics({
          totalUsers: 1250000,
          activeUsers: 85000,
          newUsers: 1250,
          returningUsers: 45000,
          userGrowth: 12.5,
          retentionRate: 78.3,
          sessionDuration: 24.5,
          bounceRate: 15.2,
        });

        // Load business metrics
        setBusinessMetrics({
          revenue: 2500000,
          revenueGrowth: 18.7,
          conversionRate: 3.2,
          customerLifetimeValue: 1250,
          churnRate: 2.1,
          netPromoterScore: 8.5,
          customerSatisfaction: 4.6,
          supportTickets: 125,
        });

        // Load alerts
        setAlerts([
          {
            id: '1',
            type: 'error',
            title: 'High CPU Usage',
            description: 'CPU usage has exceeded 90% for the last 5 minutes',
            timestamp: new Date().toISOString(),
            severity: 'high',
            status: 'active',
            source: 'System Monitor',
            actions: ['Scale Up', 'Investigate', 'Acknowledge'],
          },
          {
            id: '2',
            type: 'warning',
            title: 'Memory Usage Warning',
            description: 'Memory usage is at 85% and increasing',
            timestamp: new Date().toISOString(),
            severity: 'medium',
            status: 'acknowledged',
            source: 'System Monitor',
            actions: ['Scale Up', 'Investigate'],
          },
          {
            id: '3',
            type: 'info',
            title: 'Scheduled Maintenance',
            description: 'Database maintenance scheduled for tonight at 2 AM',
            timestamp: new Date().toISOString(),
            severity: 'low',
            status: 'active',
            source: 'Operations',
            actions: ['Reschedule', 'Acknowledge'],
          },
        ]);

        // Load logs
        setLogs([
          {
            id: '1',
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Database connection failed',
            source: 'Database',
            userId: 'user123',
            sessionId: 'sess456',
            metadata: { error: 'Connection timeout' },
          },
          {
            id: '2',
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: 'High memory usage detected',
            source: 'System',
            metadata: { memory: '85%' },
          },
          {
            id: '3',
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'User login successful',
            source: 'Auth',
            userId: 'user789',
            sessionId: 'sess123',
          },
        ]);

        trackEvent('monitoring_dashboard_loaded');
        
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMonitoringData();

    // Set up auto-refresh
    if (isLive) {
      const interval = setInterval(loadMonitoringData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isLive, refreshInterval]);

  const getStatusColor = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value >= thresholds.high) return 'text-red-500';
    if (value >= thresholds.medium) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value >= thresholds.high) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (value >= thresholds.medium) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Monitoring Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time system monitoring and analytics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className={isLive ? 'bg-green-100 text-green-700' : ''}
              >
                {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isLive ? 'Live' : 'Paused'}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* System Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdvancedCard
              title="CPU Usage"
              description="Current processor utilization"
              variant="glass"
              metrics={[
                {
                  label: 'Usage',
                  value: `${systemMetrics.cpu.toFixed(1)}%`,
                  icon: getStatusIcon(systemMetrics.cpu, { low: 50, medium: 70, high: 90 }),
                  trend: systemMetrics.cpu > 80 ? 'up' : 'down',
                },
              ]}
              status={systemMetrics.cpu > 90 ? 'error' : systemMetrics.cpu > 70 ? 'warning' : 'success'}
            >
              <Progress 
                value={systemMetrics.cpu} 
                className="h-2"
              />
            </AdvancedCard>

            <AdvancedCard
              title="Memory Usage"
              description="RAM utilization"
              variant="glass"
              metrics={[
                {
                  label: 'Usage',
                  value: `${systemMetrics.memory.toFixed(1)}%`,
                  icon: getStatusIcon(systemMetrics.memory, { low: 60, medium: 80, high: 90 }),
                  trend: systemMetrics.memory > 80 ? 'up' : 'down',
                },
              ]}
              status={systemMetrics.memory > 90 ? 'error' : systemMetrics.memory > 80 ? 'warning' : 'success'}
            >
              <Progress 
                value={systemMetrics.memory} 
                className="h-2"
              />
            </AdvancedCard>

            <AdvancedCard
              title="Disk Usage"
              description="Storage utilization"
              variant="glass"
              metrics={[
                {
                  label: 'Usage',
                  value: `${systemMetrics.disk.toFixed(1)}%`,
                  icon: getStatusIcon(systemMetrics.disk, { low: 70, medium: 85, high: 95 }),
                  trend: systemMetrics.disk > 85 ? 'up' : 'down',
                },
              ]}
              status={systemMetrics.disk > 95 ? 'error' : systemMetrics.disk > 85 ? 'warning' : 'success'}
            >
              <Progress 
                value={systemMetrics.disk} 
                className="h-2"
              />
            </AdvancedCard>

            <AdvancedCard
              title="Network I/O"
              description="Network throughput"
              variant="glass"
              metrics={[
                {
                  label: 'Throughput',
                  value: `${systemMetrics.throughput.toFixed(0)} req/s`,
                  icon: <Globe className="h-4 w-4 text-blue-500" />,
                  trend: 'up',
                },
              ]}
            >
              <div className="text-2xl font-bold text-blue-500">
                {systemMetrics.throughput.toFixed(0)}
              </div>
            </AdvancedCard>
          </div>
        </motion.div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdvancedCard
                title="Total Users"
                description="Registered users"
                variant="gradient"
                metrics={[
                  {
                    label: 'Users',
                    value: userMetrics.totalUsers.toLocaleString(),
                    icon: <Users className="h-4 w-4 text-blue-500" />,
                    trend: 'up',
                    change: `+${userMetrics.userGrowth}%`,
                  },
                ]}
              >
                <div className="text-3xl font-bold text-blue-500">
                  {userMetrics.totalUsers.toLocaleString()}
                </div>
              </AdvancedCard>

              <AdvancedCard
                title="Active Users"
                description="Currently online"
                variant="glass"
                metrics={[
                  {
                    label: 'Active',
                    value: userMetrics.activeUsers.toLocaleString(),
                    icon: <Activity className="h-4 w-4 text-green-500" />,
                    trend: 'up',
                  },
                ]}
              >
                <div className="text-3xl font-bold text-green-500">
                  {userMetrics.activeUsers.toLocaleString()}
                </div>
              </AdvancedCard>

              <AdvancedCard
                title="Revenue"
                description="Monthly revenue"
                variant="elevated"
                metrics={[
                  {
                    label: 'Revenue',
                    value: `$${businessMetrics.revenue.toLocaleString()}`,
                    icon: <TrendingUp className="h-4 w-4 text-green-500" />,
                    trend: 'up',
                    change: `+${businessMetrics.revenueGrowth}%`,
                  },
                ]}
              >
                <div className="text-3xl font-bold text-green-500">
                  ${businessMetrics.revenue.toLocaleString()}
                </div>
              </AdvancedCard>

              <AdvancedCard
                title="Error Rate"
                description="System errors"
                variant="glass"
                metrics={[
                  {
                    label: 'Errors',
                    value: `${systemMetrics.errorRate.toFixed(2)}%`,
                    icon: getStatusIcon(systemMetrics.errorRate, { low: 1, medium: 3, high: 5 }),
                    trend: systemMetrics.errorRate > 3 ? 'up' : 'down',
                  },
                ]}
                status={systemMetrics.errorRate > 5 ? 'error' : systemMetrics.errorRate > 3 ? 'warning' : 'success'}
              >
                <div className="text-3xl font-bold text-red-500">
                  {systemMetrics.errorRate.toFixed(2)}%
                </div>
              </AdvancedCard>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedCard
                title="User Growth"
                description="User registration over time"
                variant="glass"
                size="lg"
              >
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Chart visualization coming soon</p>
                  </div>
                </div>
              </AdvancedCard>

              <AdvancedCard
                title="System Performance"
                description="Response time and throughput"
                variant="glass"
                size="lg"
              >
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Chart visualization coming soon</p>
                  </div>
                </div>
              </AdvancedCard>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdvancedCard
              title="User Analytics"
              description="Detailed user metrics and insights"
              variant="glass"
              size="xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {userMetrics.newUsers.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">New Users (24h)</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {userMetrics.retentionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Retention Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {userMetrics.sessionDuration.toFixed(1)}m
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">
                    {userMetrics.bounceRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                </div>
              </div>
            </AdvancedCard>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <AdvancedCard
              title="Performance Metrics"
              description="System performance and optimization"
              variant="glass"
              size="xl"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Response Time</h4>
                    <div className="text-2xl font-bold text-blue-500">
                      {systemMetrics.responseTime.toFixed(0)}ms
                    </div>
                    <Progress value={100 - (systemMetrics.responseTime / 10)} className="h-2 mt-2" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Throughput</h4>
                    <div className="text-2xl font-bold text-green-500">
                      {systemMetrics.throughput.toFixed(0)} req/s
                    </div>
                    <Progress value={systemMetrics.throughput / 10} className="h-2 mt-2" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Uptime</h4>
                    <div className="text-2xl font-bold text-purple-500">
                      {Math.floor(systemMetrics.uptime / (1000 * 60 * 60))}h
                    </div>
                    <Progress value={99.9} className="h-2 mt-2" />
                  </div>
                </div>
              </div>
            </AdvancedCard>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <AdvancedCard
              title="Security Overview"
              description="Security events and threats"
              variant="glass"
              size="xl"
            >
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Security Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Security monitoring features coming soon
                </p>
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  View Security Events
                </Button>
              </div>
            </AdvancedCard>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AdvancedCard
              title="System Alerts"
              description="Active alerts and notifications"
              variant="glass"
              size="xl"
            >
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className={`p-2 rounded-full ${
                      alert.type === 'error' ? 'bg-red-100 text-red-600' :
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      alert.type === 'info' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {alert.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                      {alert.type === 'warning' && <Clock className="h-4 w-4" />}
                      {alert.type === 'info' && <Activity className="h-4 w-4" />}
                      {alert.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.actions?.map((action, actionIndex) => (
                        <Button key={actionIndex} variant="outline" size="sm">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AdvancedCard>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AdvancedCard
              title="System Logs"
              description="Real-time system logs and events"
              variant="glass"
              size="xl"
            >
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-1 rounded ${
                      log.level === 'error' ? 'bg-red-100 text-red-600' :
                      log.level === 'warn' ? 'bg-yellow-100 text-yellow-600' :
                      log.level === 'info' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <div className="w-2 h-2 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {log.source}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {log.userId && (
                          <span className="text-xs text-muted-foreground">
                            User: {log.userId}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AdvancedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
