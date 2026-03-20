import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessFeedbackModalComponent } from './shared/components/feedback/access-feedback-modal/access-feedback-modal.component';
import { StatusModalComponent } from './shared/components/feedback/status-modal/status-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AccessFeedbackModalComponent, StatusModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hospital-frontend';
}
