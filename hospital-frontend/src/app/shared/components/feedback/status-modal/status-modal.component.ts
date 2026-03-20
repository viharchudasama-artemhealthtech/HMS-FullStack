import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { StatusModalService, StatusModalState } from '../../../../core/services/status-modal.service';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [closable]="true" 
      [dismissableMask]="true"
      [showHeader]="false"
      styleClass="status-dialog"
      [style]="{ width: '400px' }"
      (onHide)="onHide()">
      
      <div class="status-modal-content" [ngClass]="state.type">
        <div class="icon-circle">
          <i [class]="getIcon(state.type)"></i>
        </div>
        
        <h2>{{ state.title }}</h2>
        <p>{{ state.message }}</p>
        
        <button 
          pButton 
          [label]="state.type === 'error' ? 'Dismiss' : 'Got it'" 
          (click)="onHide()"
          class="status-btn">
        </button>
      </div>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .status-dialog {
      border: none;
      .p-dialog-content {
        padding: 0;
        border-radius: 20px;
        overflow: hidden;
      }
    }

    .status-modal-content {
      padding: 2.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      background: #fff;

      .icon-circle {
        width: 80px;
        height: 80px;
        border-radius: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: #1e293b;
      }

      p {
        margin: 0;
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
      }

      .status-btn {
        width: 100%;
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 700;
        border: none;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      /* Success Theme */
      &.success {
        .icon-circle { background: #f0fdf4; color: #10b981; }
        .status-btn { background: #10b981; color: #fff; }
      }

      /* Error Theme */
      &.error {
        .icon-circle { background: #fef2f2; color: #ef4444; }
        .status-btn { background: #ef4444; color: #fff; }
      }

      /* Info Theme */
      &.info {
        .icon-circle { background: #eff6ff; color: #3b82f6; }
        .status-btn { background: #3b82f6; color: #fff; }
      }

      /* Warning Theme */
      &.warning {
        .icon-circle { background: #fffbeb; color: #f59e0b; }
        .status-btn { background: #f59e0b; color: #fff; }
      }
    }
  `]
})
export class StatusModalComponent implements OnInit {
  visible = false;
  state: StatusModalState = { visible: false, type: 'success', title: '', message: '' };

  constructor(private statusModalService: StatusModalService) {}

  ngOnInit(): void {
    this.statusModalService.state$.subscribe(state => {
      this.state = state;
      this.visible = state.visible;
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'ri-checkbox-circle-fill';
      case 'error': return 'ri-error-warning-fill';
      case 'warning': return 'ri-alert-fill';
      default: return 'ri-information-fill';
    }
  }

  onHide(): void {
    this.visible = false;
    this.statusModalService.hide();
  }
}
