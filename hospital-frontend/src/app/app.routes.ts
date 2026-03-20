import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ChangePasswordComponent } from './features/auth/pages/change-password/change-password.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { UnauthorizedComponent } from './features/auth/pages/unauthorized/unauthorized.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

// Patient Components
import { PatientListComponent } from './features/patients/pages/patient-list/patient-list.component';
import { PatientRegistrationComponent } from './features/patients/pages/patient-registration/patient-registration.component';
import { PatientDetailComponent } from './features/patients/pages/patient-detail/patient-detail.component';

// Appointment Components
import { AppointmentListComponent } from './features/appointments/pages/appointment-list/appointment-list.component';
import { AppointmentBookingComponent } from './features/appointments/pages/appointment-booking/appointment-booking.component';

// Staff Components
import { DoctorListComponent } from './features/staff/pages/doctor-list/doctor-list.component';
import { DoctorRegistrationComponent } from './features/staff/pages/doctor-registration/doctor-registration.component';
import { DoctorScheduleComponent } from './features/staff/pages/doctor-schedule/doctor-schedule.component';

// Clinical Components
import { VitalsRecordComponent } from './features/clinical/pages/vitals-record/vitals-record.component';
import { VitalsListComponent } from './features/clinical/pages/vitals-list/vitals-list.component';

// Prescription Components
import { PrescriptionListComponent } from './features/prescription/pages/prescription-list/prescription-list.component';
import { PrescriptionCreateComponent } from './features/prescription/pages/prescription-create/prescription-create.component';
import { PrescriptionDetailComponent } from './features/prescription/pages/prescription-detail/prescription-detail.component';

// Pharmacy Components
import { PharmacyListComponent } from './features/pharmacy/pages/pharmacy-list/pharmacy-list.component';
import { InventoryLogComponent } from './features/pharmacy/pages/inventory-log/inventory-log.component';

// Billing Components
import { BillingListComponent } from './features/billing/pages/billing-list/billing-list.component';

// Lab Components
import { LabListComponent } from './features/lab/pages/lab-list/lab-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: [
        'ADMIN',
        'DOCTOR',
        'NURSE',
        'RECEPTIONIST',
        'PHARMACIST',
        'LABORATORY_STAFF',
        'PATIENT',
      ],
    },
  },

  // Patient Routes
  {
    path: 'patients',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: PatientListComponent,
        data: {
          roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST'],
        },
      },
      {
        path: 'register',
        component: PatientRegistrationComponent,
        data: { roles: ['ADMIN', 'RECEPTIONIST'] },
      },
    ],
  },

  // Appointment Routes
  {
    path: 'appointments',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: AppointmentListComponent,
        data: {
          roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'],
        },
      },
      {
        path: 'book',
        component: AppointmentBookingComponent,
        data: { roles: ['ADMIN', 'RECEPTIONIST', 'PATIENT'] },
      },
    ],
  },

  // Staff Routes
  {
    path: 'staff',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: DoctorListComponent,
        data: { roles: ['ADMIN', 'RECEPTIONIST'] },
      },
      {
        path: 'register',
        component: DoctorRegistrationComponent,
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'schedule/:id',
        component: DoctorScheduleComponent,
        data: { roles: ['ADMIN', 'RECEPTIONIST'] },
      },
    ],
  },

  // Clinical Routes
  {
    path: 'clinical',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: 'vitals-list',
        component: VitalsListComponent,
        data: { roles: ['ADMIN', 'NURSE'] },
      },
      {
        path: 'vitals/:appointmentId',
        component: VitalsRecordComponent,
        data: { roles: ['ADMIN', 'NURSE'] },
      },
    ],
  },

  // Prescription Routes
  {
    path: 'prescriptions',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: PrescriptionListComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'PHARMACIST'] },
      },
      {
        path: 'create/:appointmentId',
        component: PrescriptionCreateComponent,
        data: { roles: ['ADMIN', 'DOCTOR'] },
      },
      {
        path: ':id',
        component: PrescriptionDetailComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT'] },
      },
    ],
  },

  // Pharmacy Routes
  {
    path: 'pharmacy',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: PharmacyListComponent,
        data: { roles: ['ADMIN', 'PHARMACIST'] },
      },
      {
        path: 'inventory-log',
        component: InventoryLogComponent,
        data: { roles: ['ADMIN', 'PHARMACIST'] },
      },
    ],
  },

  // Billing Routes
  {
    path: 'billing',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: BillingListComponent,
        data: { roles: ['ADMIN', 'RECEPTIONIST', 'PATIENT'] },
      },
    ],
  },

  // Lab Routes
  {
    path: 'lab',
    canActivate: [authGuard],
    canActivateChild: [authGuard, roleGuard],
    children: [
      {
        path: '',
        component: LabListComponent,
        data: { roles: ['ADMIN', 'DOCTOR', 'LABORATORY_STAFF'] },
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
