import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type StatusType = 'success' | 'error' | 'info' | 'warning';

export interface StatusModalState {
  visible: boolean;
  type: StatusType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusModalService {
  private state = new BehaviorSubject<StatusModalState>({
    visible: false,
    type: 'success',
    title: '',
    message: ''
  });

  state$: Observable<StatusModalState> = this.state.asObservable();

  showSuccess(title: string, message: string): void {
    this.state.next({ visible: true, type: 'success', title, message });
  }

  showError(title: string, message: string): void {
    this.state.next({ visible: true, type: 'error', title, message });
  }

  showInfo(title: string, message: string): void {
    this.state.next({ visible: true, type: 'info', title, message });
  }

  showWarning(title: string, message: string): void {
    this.state.next({ visible: true, type: 'warning', title, message });
  }

  hide(): void {
    this.state.next({ ...this.state.value, visible: false });
  }
}
