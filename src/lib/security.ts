/**
 * LUCA Platform Security System
 * Enterprise-grade security for 1M+ users
 */

import { config } from './config';
import { trackEvent } from './analytics';

// Security Types
interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'permission_change';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'log';
  priority: number;
  enabled: boolean;
}

interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  location?: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Security Service Class
class SecurityService {
  private events: SecurityEvent[] = [];
  private policies: SecurityPolicy[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private suspiciousIPs: Set<string> = new Set();

  constructor() {
    this.initializeDefaultPolicies();
    this.initializeDefaultRoles();
    this.initializeDefaultPermissions();
  }

  // Initialize default security policies
  private initializeDefaultPolicies(): void {
    this.policies = [
      {
        id: 'password_policy',
        name: 'Password Policy',
        description: 'Enforce strong password requirements',
        rules: [
          {
            id: 'min_length',
            name: 'Minimum Length',
            condition: 'password.length >= 8',
            action: 'deny',
            priority: 1,
            enabled: true,
          },
          {
            id: 'complexity',
            name: 'Password Complexity',
            condition: 'password.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/)',
            action: 'deny',
            priority: 2,
            enabled: true,
          },
        ],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rate_limiting',
        name: 'Rate Limiting',
        description: 'Prevent brute force attacks',
        rules: [
          {
            id: 'login_attempts',
            name: 'Login Attempts',
            condition: 'failed_attempts > 5',
            action: 'deny',
            priority: 1,
            enabled: true,
          },
          {
            id: 'api_requests',
            name: 'API Requests',
            condition: 'requests_per_minute > 100',
            action: 'deny',
            priority: 2,
            enabled: true,
          },
        ],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'session_security',
        name: 'Session Security',
        description: 'Secure user sessions',
        rules: [
          {
            id: 'session_timeout',
            name: 'Session Timeout',
            condition: 'session_inactive > 24h',
            action: 'deny',
            priority: 1,
            enabled: true,
          },
          {
            id: 'concurrent_sessions',
            name: 'Concurrent Sessions',
            condition: 'active_sessions > 3',
            action: 'warn',
            priority: 2,
            enabled: true,
          },
        ],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Initialize default roles
  private initializeDefaultRoles(): void {
    this.roles.set('admin', {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['*'],
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.roles.set('user', {
      id: 'user',
      name: 'User',
      description: 'Standard user access',
      permissions: [
        'read:profile',
        'update:profile',
        'read:tasks',
        'create:tasks',
        'update:tasks',
        'delete:tasks',
        'read:emails',
        'create:emails',
        'read:calendar',
        'create:calendar',
      ],
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.roles.set('moderator', {
      id: 'moderator',
      name: 'Moderator',
      description: 'Content moderation access',
      permissions: [
        'read:users',
        'update:users',
        'read:content',
        'moderate:content',
        'read:reports',
        'resolve:reports',
      ],
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Initialize default permissions
  private initializeDefaultPermissions(): void {
    const permissions = [
      { id: 'read:profile', name: 'Read Profile', description: 'View user profile', resource: 'profile', action: 'read' },
      { id: 'update:profile', name: 'Update Profile', description: 'Modify user profile', resource: 'profile', action: 'update' },
      { id: 'read:tasks', name: 'Read Tasks', description: 'View tasks', resource: 'tasks', action: 'read' },
      { id: 'create:tasks', name: 'Create Tasks', description: 'Create new tasks', resource: 'tasks', action: 'create' },
      { id: 'update:tasks', name: 'Update Tasks', description: 'Modify tasks', resource: 'tasks', action: 'update' },
      { id: 'delete:tasks', name: 'Delete Tasks', description: 'Remove tasks', resource: 'tasks', action: 'delete' },
      { id: 'read:emails', name: 'Read Emails', description: 'View emails', resource: 'emails', action: 'read' },
      { id: 'create:emails', name: 'Create Emails', description: 'Send emails', resource: 'emails', action: 'create' },
      { id: 'read:calendar', name: 'Read Calendar', description: 'View calendar', resource: 'calendar', action: 'read' },
      { id: 'create:calendar', name: 'Create Calendar', description: 'Create calendar events', resource: 'calendar', action: 'create' },
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  // Authentication Security
  async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Check complexity
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
    }
    
    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'user'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Rate Limiting
  async checkRateLimit(identifier: string, action: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${identifier}:${action}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // Max requests per window
    
    // This would typically use Redis or similar in production
    const attempts = this.failedAttempts.get(key) || { count: 0, lastAttempt: new Date(0) };
    
    if (now - attempts.lastAttempt.getTime() > windowMs) {
      // Reset window
      this.failedAttempts.set(key, { count: 1, lastAttempt: new Date(now) });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }
    
    if (attempts.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: attempts.lastAttempt.getTime() + windowMs };
    }
    
    attempts.count++;
    attempts.lastAttempt = new Date(now);
    this.failedAttempts.set(key, attempts);
    
    return { allowed: true, remaining: maxRequests - attempts.count, resetTime: attempts.lastAttempt.getTime() + windowMs };
  }

  // Session Management
  createSession(userId: string, ipAddress: string, userAgent: string): UserSession {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.security.sessionTimeout);
    
    const session: UserSession = {
      id: sessionId,
      userId,
      token: this.generateToken(),
      refreshToken: this.generateRefreshToken(),
      ipAddress,
      userAgent,
      createdAt: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    };
    
    this.sessions.set(sessionId, session);
    
    // Log security event
    this.logSecurityEvent({
      type: 'login',
      userId,
      ipAddress,
      userAgent,
      severity: 'low',
      description: 'User logged in successfully',
    });
    
    return session;
  }

  validateSession(sessionId: string): { valid: boolean; session?: UserSession; error?: string } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, error: 'Session not found' };
    }
    
    if (!session.isActive) {
      return { valid: false, error: 'Session is inactive' };
    }
    
    if (new Date() > new Date(session.expiresAt)) {
      session.isActive = false;
      return { valid: false, error: 'Session has expired' };
    }
    
    // Update last activity
    session.lastActivity = new Date().toISOString();
    this.sessions.set(sessionId, session);
    
    return { valid: true, session };
  }

  invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
      
      this.logSecurityEvent({
        type: 'logout',
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        severity: 'low',
        description: 'User logged out',
      });
    }
  }

  // Permission Checking
  hasPermission(userId: string, permission: string, resource?: string): boolean {
    // This would typically check user roles and permissions from database
    // For now, we'll implement a simple check
    
    const userRole = this.getUserRole(userId);
    if (!userRole) return false;
    
    if (userRole.permissions.includes('*')) return true;
    
    return userRole.permissions.includes(permission);
  }

  // Security Event Logging
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    
    this.events.push(securityEvent);
    
    // Track in analytics
    trackEvent('security_event', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
    });
    
    // Alert on critical events
    if (event.severity === 'critical') {
      this.handleCriticalEvent(securityEvent);
    }
  }

  // Threat Detection
  detectThreats(ipAddress: string, userAgent: string, activity: string): { isThreat: boolean; riskLevel: 'low' | 'medium' | 'high' | 'critical'; reasons: string[] } {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Check for suspicious IP
    if (this.suspiciousIPs.has(ipAddress)) {
      reasons.push('IP address is flagged as suspicious');
      riskLevel = 'high';
    }
    
    // Check for bot-like user agent
    if (this.isBotUserAgent(userAgent)) {
      reasons.push('User agent appears to be automated');
      riskLevel = 'medium';
    }
    
    // Check for unusual activity patterns
    if (this.isUnusualActivity(activity)) {
      reasons.push('Activity pattern is unusual');
      riskLevel = 'medium';
    }
    
    // Check for failed login attempts
    const failedAttempts = this.failedAttempts.get(ipAddress);
    if (failedAttempts && failedAttempts.count > 10) {
      reasons.push('Multiple failed login attempts');
      riskLevel = 'high';
    }
    
    return {
      isThreat: reasons.length > 0,
      riskLevel,
      reasons,
    };
  }

  // Data Encryption
  encryptData(data: string, key?: string): string {
    // In production, use proper encryption libraries like crypto-js
    // This is a simplified example
    const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    return btoa(data + ':' + encryptionKey);
  }

  decryptData(encryptedData: string, key?: string): string {
    try {
      const decrypted = atob(encryptedData);
      const [data, encryptionKey] = decrypted.split(':');
      const expectedKey = key || process.env.ENCRYPTION_KEY || 'default-key';
      
      if (encryptionKey !== expectedKey) {
        throw new Error('Invalid encryption key');
      }
      
      return data;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  // Helper Methods
  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateRefreshToken(): string {
    return 'refresh_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateEventId(): string {
    return 'evt_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getUserRole(userId: string): Role | null {
    // This would typically fetch from database
    // For now, return a default role
    return this.roles.get('user') || null;
  }

  private isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  private isUnusualActivity(activity: string): boolean {
    const suspiciousPatterns = [
      /sql/i,
      /script/i,
      /eval/i,
      /exec/i,
      /union/i,
      /select/i,
      /drop/i,
      /insert/i,
      /update/i,
      /delete/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(activity));
  }

  private handleCriticalEvent(event: SecurityEvent): void {
    // In production, this would send alerts to security team
    console.error('CRITICAL SECURITY EVENT:', event);
    
    // Block suspicious IPs
    if (event.type === 'failed_login' && event.ipAddress) {
      this.suspiciousIPs.add(event.ipAddress);
    }
  }

  // Public Getters
  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getActiveSessions(): UserSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  getSecurityPolicies(): SecurityPolicy[] {
    return this.policies;
  }

  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }
}

// Export singleton instance
export const securityService = new SecurityService();

// Export types
export type {
  SecurityEvent,
  SecurityPolicy,
  SecurityRule,
  UserSession,
  Permission,
  Role,
};
