import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/auth.models';

interface SidebarMenuItem {
  title: string;
  icon: string;
  link: string;
  roles?: string[];
  summary?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  currentUser$ = this.authService.currentUser$;

  menuItems: SidebarMenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'ri-dashboard-line',
      link: '/dashboard',
      summary: 'Ops command center',
    },
    {
      title: 'Patients',
      icon: 'ri-user-heart-line',
      link: '/patients',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
      summary: 'Registration and records',
    },
    {
      title: 'Appointments',
      icon: 'ri-calendar-event-line',
      link: '/appointments',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'],
      summary: 'Queue and consultations',
    },
    {
      title: 'Vitals Collection',
      icon: 'ri-heart-pulse-line',
      link: '/clinical/vitals-list',
      roles: ['ADMIN', 'NURSE'],
      summary: 'Patient vital signs',
    },
    {
      title: 'Staff',
      icon: 'ri-stethoscope-line',
      link: '/staff',
      roles: ['ADMIN'],
      summary: 'Doctor roster and setup',
    },
    {
      title: 'Lab Tests',
      icon: 'ri-test-tube-line',
      link: '/lab',
      roles: ['ADMIN', 'DOCTOR', 'LABORATORY_STAFF'],
      summary: 'Orders and results',
    },
    {
      title: 'Prescriptions',
      icon: 'ri-file-text-line',
      link: '/prescriptions',
      roles: ['ADMIN', 'DOCTOR', 'PHARMACIST'],
      summary: 'Clinical orders',
    },
    {
      title: 'Pharmacy',
      icon: 'ri-capsule-line',
      link: '/pharmacy',
      roles: ['ADMIN', 'PHARMACIST'],
      summary: 'Inventory and stock',
    },
    {
      title: 'Inventory Log',
      icon: 'ri-history-line',
      link: '/pharmacy/inventory-log',
      roles: ['ADMIN', 'PHARMACIST'],
      summary: 'Stock movement history',
    },
    {
      title: 'Billing',
      icon: 'ri-bill-line',
      link: '/billing',
      roles: ['ADMIN', 'RECEPTIONIST', 'PATIENT'],
      summary: 'Invoices and payments',
    },
  ];

  constructor(private authService: AuthService) {}

  canView(item: SidebarMenuItem, user: User | null): boolean {
    if (!item.roles) return true; 
    if (!user) return false;
    return item.roles.includes(user.role);
  }
}
