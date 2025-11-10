/**
 * LUCA Platform Real-time Communication
 * Enterprise-grade real-time features for 1M+ users
 */

import { io, Socket } from 'socket.io-client';
import { config } from './config';
import { trackEvent } from './analytics';

// Real-time Types
interface RealtimeConfig {
  url: string;
  options: {
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    timeout: number;
  };
}

interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
  roomId?: string;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage?: string;
  activity?: string;
}

interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'comment' | 'reaction';
  data: any;
  userId: string;
  documentId: string;
  timestamp: string;
}

interface NotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// Real-time Service Class
class RealtimeService {
  private socket: Socket | null = null;
  private config: RealtimeConfig;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.config = {
      url: config.api.baseUrl,
      options: {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
      },
    };
  }

  // Connection Management
  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          ...this.config.options,
          auth: {
            userId,
            token,
          },
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Connected to real-time server');
          trackEvent('realtime_connected', { userId });
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          console.log('Disconnected from real-time server:', reason);
          trackEvent('realtime_disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          trackEvent('realtime_connection_error', { error: error.message });
          reject(error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('Reconnected after', attemptNumber, 'attempts');
          trackEvent('realtime_reconnected', { attempts: attemptNumber });
        });

        this.socket.on('reconnect_error', (error) => {
          this.reconnectAttempts++;
          console.error('Reconnection error:', error);
          trackEvent('realtime_reconnect_error', { 
            error: error.message, 
            attempts: this.reconnectAttempts 
          });
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
          trackEvent('realtime_reconnect_failed', { attempts: this.maxReconnectAttempts });
        });

        // Set up default event handlers
        this.setupDefaultHandlers();

      } catch (error) {
        console.error('Failed to initialize real-time connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      trackEvent('realtime_disconnected_manual');
    }
  }

  // Event Management
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    if (this.socket) {
      this.socket.on(event, handler as any);
    }
  }

  off(event: string, handler?: Function): void {
    if (handler) {
      const handlers = this.eventHandlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }

    if (this.socket) {
      if (handler) {
        this.socket.off(event, handler as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      trackEvent('realtime_event_sent', { event, dataSize: JSON.stringify(data).length });
    } else {
      console.warn('Cannot emit event: not connected to real-time server');
    }
  }

  // Room Management
  joinRoom(roomId: string): void {
    this.emit('join_room', { roomId });
    trackEvent('realtime_room_joined', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.emit('leave_room', { roomId });
    trackEvent('realtime_room_left', { roomId });
  }

  // User Presence
  updatePresence(presence: Partial<UserPresence>): void {
    this.emit('update_presence', {
      ...presence,
      timestamp: new Date().toISOString(),
    });
  }

  // Collaboration
  sendCollaborationEvent(event: CollaborationEvent): void {
    this.emit('collaboration_event', event);
  }

  // Notifications
  sendNotification(notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>): void {
    const fullNotification: NotificationEvent = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    this.emit('send_notification', fullNotification);
  }

  // Voice Commands
  sendVoiceCommand(command: string, language: string): void {
    this.emit('voice_command', {
      command,
      language,
      timestamp: new Date().toISOString(),
    });
  }

  // File Sharing
  shareFile(fileId: string, recipients: string[], message?: string): void {
    this.emit('share_file', {
      fileId,
      recipients,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Screen Sharing
  startScreenShare(roomId: string): void {
    this.emit('start_screen_share', { roomId });
  }

  stopScreenShare(roomId: string): void {
    this.emit('stop_screen_share', { roomId });
  }

  // Whiteboard Collaboration
  sendWhiteboardEvent(event: any): void {
    this.emit('whiteboard_event', event);
  }

  // Private Methods
  private setupDefaultHandlers(): void {
    if (!this.socket) return;

    // Handle incoming notifications
    this.socket.on('notification', (notification: NotificationEvent) => {
      this.emit('notification_received', notification);
    });

    // Handle user presence updates
    this.socket.on('user_presence_update', (presence: UserPresence) => {
      this.emit('presence_updated', presence);
    });

    // Handle collaboration events
    this.socket.on('collaboration_event', (event: CollaborationEvent) => {
      this.emit('collaboration_received', event);
    });

    // Handle voice command responses
    this.socket.on('voice_command_response', (response: any) => {
      this.emit('voice_response', response);
    });

    // Handle file sharing
    this.socket.on('file_shared', (data: any) => {
      this.emit('file_received', data);
    });

    // Handle screen sharing
    this.socket.on('screen_share_started', (data: any) => {
      this.emit('screen_share_started', data);
    });

    this.socket.on('screen_share_stopped', (data: any) => {
      this.emit('screen_share_stopped', data);
    });

    // Handle whiteboard events
    this.socket.on('whiteboard_event', (event: any) => {
      this.emit('whiteboard_received', event);
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Export types
export type {
  RealtimeEvent,
  UserPresence,
  CollaborationEvent,
  NotificationEvent,
};
