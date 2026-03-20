import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private stompClient: Client;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  
  // Specific subjects for different topics
  private appointmentUpdates = new Subject<any>();

  constructor(private authService: AuthService) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS((environment as any).wsUrl),
      debug: (msg: string) => { console.log(new Date(), msg); },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    });

    this.stompClient.onConnect = (frame) => {
      this.connectionStatus.next(true);
      console.log('Connected to WebSocket');
      
      // Subscribe to relevant topics
      this.stompClient.subscribe('/topic/appointments', (message: IMessage) => {
        this.appointmentUpdates.next(JSON.parse(message.body));
      });
    };

    this.stompClient.onWebSocketClose = () => {
      this.connectionStatus.next(false);
      console.log('WebSocket Connection Closed');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Only activate if token exists
    if (this.authService.getToken()) {
      this.stompClient.activate();
    }
  }

  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  get appointmentUpdates$(): Observable<any> {
    return this.appointmentUpdates.asObservable();
  }

  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
