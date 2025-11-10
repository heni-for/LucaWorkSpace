/**
 * AI Insights Panel
 * Advanced AI-powered insights and recommendations
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
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  RefreshCw,
  Download,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Globe,
  Mic,
  Eye,
  Search
} from 'lucide-react';
import { aiService } from '@/lib/ai-service';
import { trackEvent, trackAIUsage } from '@/lib/analytics';

// AI Insights Types
interface AIInsight {
  id: string;
  type: 'productivity' | 'efficiency' | 'optimization' | 'prediction' | 'recommendation' | 'warning' | 'achievement';
  category: 'tasks' | 'emails' | 'calendar' | 'communication' | 'performance' | 'health' | 'business';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'viewed' | 'applied' | 'dismissed';
  createdAt: string;
  expiresAt?: string;
  action?: {
    label: string;
    onClick: () => void;
    type: 'primary' | 'secondary' | 'danger';
  };
  metadata?: Record<string, any>;
  relatedInsights?: string[];
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeToImplement: string;
  resources: string[];
  steps: string[];
  successMetrics: string[];
}

interface AIPrediction {
  id: string;
  type: 'trend' | 'anomaly' | 'forecast' | 'risk';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: {
    current: number;
    predicted: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  recommendations: string[];
}

interface AIAnalysis {
  id: string;
  type: 'sentiment' | 'pattern' | 'behavior' | 'performance' | 'content';
  title: string;
  description: string;
  results: {
    score: number;
    breakdown: Record<string, number>;
    insights: string[];
    recommendations: string[];
  };
  confidence: number;
  timestamp: string;
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Load AI insights
  useEffect(() => {
    const loadAIInsights = async () => {
      setLoading(true);
      
      try {
        // Mock data - in production, this would come from AI service
        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'productivity',
            category: 'tasks',
            title: 'Optimize Your Morning Routine',
            description: 'Based on your task completion patterns, starting with high-priority tasks between 9-11 AM increases productivity by 23%.',
            confidence: 0.87,
            impact: 'high',
            priority: 'medium',
            status: 'new',
            createdAt: new Date().toISOString(),
            action: {
              label: 'Apply Suggestion',
              onClick: () => handleApplyInsight('1'),
              type: 'primary',
            },
            metadata: {
              productivityGain: 23,
              timeSlot: '9-11 AM',
              taskType: 'high-priority',
            },
          },
          {
            id: '2',
            type: 'efficiency',
            category: 'emails',
            title: 'Email Response Time Optimization',
            description: 'Your average email response time is 4.2 hours. Responding within 2 hours could improve client satisfaction by 15%.',
            confidence: 0.92,
            impact: 'medium',
            priority: 'high',
            status: 'viewed',
            createdAt: new Date().toISOString(),
            action: {
              label: 'Set Reminder',
              onClick: () => handleApplyInsight('2'),
              type: 'secondary',
            },
            metadata: {
              currentResponseTime: 4.2,
              targetResponseTime: 2,
              satisfactionImprovement: 15,
            },
          },
          {
            id: '3',
            type: 'prediction',
            category: 'performance',
            title: 'Peak Performance Window',
            description: 'AI predicts your highest productivity will be tomorrow between 2-4 PM. Consider scheduling important tasks during this time.',
            confidence: 0.78,
            impact: 'medium',
            priority: 'low',
            status: 'new',
            createdAt: new Date().toISOString(),
            action: {
              label: 'Schedule Tasks',
              onClick: () => handleApplyInsight('3'),
              type: 'primary',
            },
            metadata: {
              predictedTime: '2-4 PM',
              confidence: 0.78,
              date: 'tomorrow',
            },
          },
          {
            id: '4',
            type: 'warning',
            category: 'health',
            title: 'Work-Life Balance Alert',
            description: 'You\'ve worked 12+ hours for 3 consecutive days. Consider taking breaks to maintain long-term productivity.',
            confidence: 0.95,
            impact: 'high',
            priority: 'urgent',
            status: 'new',
            createdAt: new Date().toISOString(),
            action: {
              label: 'Schedule Break',
              onClick: () => handleApplyInsight('4'),
              type: 'danger',
            },
            metadata: {
              consecutiveDays: 3,
              averageHours: 12,
              healthRisk: 'high',
            },
          },
          {
            id: '5',
            type: 'achievement',
            category: 'performance',
            title: 'Productivity Milestone',
            description: 'Congratulations! You\'ve completed 95% of your tasks this week, exceeding your target by 15%.',
            confidence: 1.0,
            impact: 'low',
            priority: 'low',
            status: 'viewed',
            createdAt: new Date().toISOString(),
            action: {
              label: 'Share Achievement',
              onClick: () => handleApplyInsight('5'),
              type: 'secondary',
            },
            metadata: {
              completionRate: 95,
              targetRate: 80,
              improvement: 15,
            },
          },
        ];

        const mockRecommendations: AIRecommendation[] = [
          {
            id: '1',
            title: 'Implement Time Blocking',
            description: 'Schedule specific time blocks for different types of work to improve focus and reduce context switching.',
            category: 'productivity',
            confidence: 0.89,
            expectedImpact: 25,
            effort: 'medium',
            timeToImplement: '2-3 days',
            resources: ['Calendar app', 'Time tracking tool'],
            steps: [
              'Analyze current work patterns',
              'Identify task categories',
              'Create time blocks',
              'Test and adjust schedule',
            ],
            successMetrics: ['Task completion rate', 'Focus time', 'Context switches'],
          },
          {
            id: '2',
            title: 'Automate Email Sorting',
            description: 'Set up AI-powered email filters to automatically categorize and prioritize incoming emails.',
            category: 'efficiency',
            confidence: 0.94,
            expectedImpact: 30,
            effort: 'low',
            timeToImplement: '1 day',
            resources: ['Email client', 'AI filtering tool'],
            steps: [
              'Configure email rules',
              'Train AI on email patterns',
              'Test filtering accuracy',
              'Monitor and adjust',
            ],
            successMetrics: ['Email processing time', 'Response accuracy', 'User satisfaction'],
          },
        ];

        const mockPredictions: AIPrediction[] = [
          {
            id: '1',
            type: 'trend',
            title: 'Task Completion Trend',
            description: 'Your task completion rate is trending upward and is expected to reach 90% by next month.',
            confidence: 0.82,
            timeframe: '1 month',
            probability: 0.85,
            impact: 'medium',
            data: {
              current: 78,
              predicted: 90,
              trend: 'up',
              change: 12,
            },
            recommendations: [
              'Maintain current productivity habits',
              'Consider taking on additional responsibilities',
              'Share best practices with team',
            ],
          },
          {
            id: '2',
            type: 'risk',
            title: 'Burnout Risk Assessment',
            description: 'Based on current work patterns, there\'s a 15% risk of burnout in the next 2 weeks.',
            confidence: 0.76,
            timeframe: '2 weeks',
            probability: 0.15,
            impact: 'critical',
            data: {
              current: 85,
              predicted: 95,
              trend: 'up',
              change: 10,
            },
            recommendations: [
              'Reduce work hours by 10%',
              'Take regular breaks',
              'Delegate non-critical tasks',
              'Consider vacation time',
            ],
          },
        ];

        const mockAnalyses: AIAnalysis[] = [
          {
            id: '1',
            type: 'sentiment',
            title: 'Email Sentiment Analysis',
            description: 'Analysis of your recent email communications shows positive sentiment trends.',
            results: {
              score: 0.78,
              breakdown: {
                positive: 0.65,
                neutral: 0.25,
                negative: 0.10,
              },
              insights: [
                'Communication tone is generally positive',
                'Client satisfaction appears high',
                'Team collaboration is effective',
              ],
              recommendations: [
                'Maintain current communication style',
                'Address any negative sentiment patterns',
                'Leverage positive communication for team building',
              ],
            },
            confidence: 0.91,
            timestamp: new Date().toISOString(),
          },
        ];

        setInsights(mockInsights);
        setRecommendations(mockRecommendations);
        setPredictions(mockPredictions);
        setAnalyses(mockAnalyses);

        trackEvent('ai_insights_loaded', {
          insightsCount: mockInsights.length,
          recommendationsCount: mockRecommendations.length,
          predictionsCount: mockPredictions.length,
        });

      } catch (error) {
        console.error('Failed to load AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAIInsights();
  }, []);

  const handleApplyInsight = (insightId: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: 'applied' as const }
          : insight
      )
    );
    
    trackEvent('ai_insight_applied', { insightId });
  };

  const handleDismissInsight = (insightId: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: 'dismissed' as const }
          : insight
      )
    );
    
    trackEvent('ai_insight_dismissed', { insightId });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'prediction': return <BarChart3 className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'achievement': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'productivity': return 'text-green-500';
      case 'efficiency': return 'text-blue-500';
      case 'optimization': return 'text-purple-500';
      case 'prediction': return 'text-orange-500';
      case 'recommendation': return 'text-yellow-500';
      case 'warning': return 'text-red-500';
      case 'achievement': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    if (selectedType !== 'all' && insight.type !== selectedType) return false;
    return true;
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Globe className="h-4 w-4" /> },
    { id: 'tasks', name: 'Tasks', icon: <FileText className="h-4 w-4" /> },
    { id: 'emails', name: 'Emails', icon: <Mail className="h-4 w-4" /> },
    { id: 'calendar', name: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { id: 'communication', name: 'Communication', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'performance', name: 'Performance', icon: <Activity className="h-4 w-4" /> },
    { id: 'health', name: 'Health', icon: <Shield className="h-4 w-4" /> },
    { id: 'business', name: 'Business', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const types = [
    { id: 'all', name: 'All Types', icon: <Brain className="h-4 w-4" /> },
    { id: 'productivity', name: 'Productivity', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'efficiency', name: 'Efficiency', icon: <Zap className="h-4 w-4" /> },
    { id: 'optimization', name: 'Optimization', icon: <Target className="h-4 w-4" /> },
    { id: 'prediction', name: 'Prediction', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'recommendation', name: 'Recommendation', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'warning', name: 'Warning', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'achievement', name: 'Achievement', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Insights
              </h1>
              <p className="text-muted-foreground mt-1">
                Intelligent recommendations and predictions powered by AI
              </p>
            </div>
            <div className="flex items-center gap-2">
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
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <div className="flex gap-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.icon}
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <div className="flex gap-1">
                {types.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className="flex items-center gap-2"
                  >
                    {type.icon}
                    {type.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="analyses">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdvancedCard
                    title={insight.title}
                    description={insight.description}
                    variant="glass"
                    size="lg"
                    badges={[
                      { label: insight.category, variant: 'outline' },
                      { label: insight.priority, variant: 'outline', color: getPriorityColor(insight.priority) },
                    ]}
                    actions={[
                      ...(insight.action ? [insight.action] : []),
                      {
                        label: 'Dismiss',
                        onClick: () => handleDismissInsight(insight.id),
                        variant: 'outline',
                      },
                    ]}
                    className="relative"
                  >
                    <div className="space-y-4">
                      {/* Confidence Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence</span>
                        <div className="flex items-center gap-2">
                          <Progress value={insight.confidence * 100} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Impact Level */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Impact</span>
                        <Badge variant="outline" className={getPriorityColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                      </div>

                      {/* Metadata */}
                      {insight.metadata && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Key Metrics</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(insight.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Indicator */}
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          insight.status === 'new' ? 'bg-blue-500' :
                          insight.status === 'viewed' ? 'bg-yellow-500' :
                          insight.status === 'applied' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm text-muted-foreground capitalize">
                          {insight.status}
                        </span>
                      </div>
                    </div>
                  </AdvancedCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdvancedCard
                    title={recommendation.title}
                    description={recommendation.description}
                    variant="glass"
                    size="lg"
                    badges={[
                      { label: recommendation.category, variant: 'outline' },
                      { label: recommendation.effort, variant: 'outline' },
                    ]}
                    actions={[
                      {
                        label: 'Implement',
                        onClick: () => trackEvent('recommendation_implemented', { id: recommendation.id }),
                        variant: 'default',
                      },
                      {
                        label: 'Learn More',
                        onClick: () => trackEvent('recommendation_viewed', { id: recommendation.id }),
                        variant: 'outline',
                      },
                    ]}
                  >
                    <div className="space-y-4">
                      {/* Confidence and Impact */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Confidence</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={recommendation.confidence * 100} className="h-2" />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(recommendation.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Expected Impact</span>
                          <div className="text-2xl font-bold text-green-500">
                            +{recommendation.expectedImpact}%
                          </div>
                        </div>
                      </div>

                      {/* Implementation Details */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">Time to Implement</span>
                          <p className="text-sm text-muted-foreground">{recommendation.timeToImplement}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Resources Needed</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {recommendation.resources.map((resource, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-sm font-medium">Success Metrics</span>
                          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                            {recommendation.successMetrics.map((metric, idx) => (
                              <li key={idx}>• {metric}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AdvancedCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdvancedCard
                    title={prediction.title}
                    description={prediction.description}
                    variant="glass"
                    size="lg"
                    badges={[
                      { label: prediction.type, variant: 'outline' },
                      { label: prediction.timeframe, variant: 'outline' },
                    ]}
                  >
                    <div className="space-y-4">
                      {/* Data Visualization */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">
                            {prediction.data.current}%
                          </div>
                          <p className="text-sm text-muted-foreground">Current</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {prediction.data.predicted}%
                          </div>
                          <p className="text-sm text-muted-foreground">Predicted</p>
                        </div>
                      </div>

                      {/* Trend Indicator */}
                      <div className="flex items-center justify-center gap-2">
                        {prediction.data.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : prediction.data.trend === 'down' ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium">
                          {prediction.data.change > 0 ? '+' : ''}{prediction.data.change}%
                        </span>
                      </div>

                      {/* Confidence and Probability */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Confidence</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={prediction.confidence * 100} className="h-2" />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(prediction.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Probability</span>
                          <div className="text-lg font-bold text-purple-500">
                            {Math.round(prediction.probability * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <span className="text-sm font-medium">Recommendations</span>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {prediction.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AdvancedCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analyses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdvancedCard
                    title={analysis.title}
                    description={analysis.description}
                    variant="glass"
                    size="lg"
                    badges={[
                      { label: analysis.type, variant: 'outline' },
                      { label: `${Math.round(analysis.confidence * 100)}% confidence`, variant: 'outline' },
                    ]}
                  >
                    <div className="space-y-4">
                      {/* Overall Score */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-500 mb-2">
                          {Math.round(analysis.results.score * 100)}
                        </div>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                      </div>

                      {/* Breakdown */}
                      <div>
                        <span className="text-sm font-medium">Breakdown</span>
                        <div className="space-y-2 mt-2">
                          {Object.entries(analysis.results.breakdown).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground capitalize">{key}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={value * 100} className="w-20 h-2" />
                                <span className="text-sm font-medium">{Math.round(value * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Insights */}
                      <div>
                        <span className="text-sm font-medium">Key Insights</span>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {analysis.results.insights.map((insight, idx) => (
                            <li key={idx}>• {insight}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <span className="text-sm font-medium">Recommendations</span>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {analysis.results.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AdvancedCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
