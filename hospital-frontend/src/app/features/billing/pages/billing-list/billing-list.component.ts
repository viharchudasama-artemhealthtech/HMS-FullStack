import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { BillingService } from '../../../../core/services/billing.service';
import { PatientService } from '../../../../core/services/patient.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Billing, PaymentStatus, PaymentMethod } from '../../../../core/models/billing.models';
import { Appointment } from '../../../../core/models/appointment.models';
import { Patient } from '../../../../core/models/patient.models';
import { ApiResponse } from '../../../../core/models/common.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { StatusModalService } from '../../../../core/services/status-modal.service';
import { futureOrTodayDateValidator, trimRequired } from '../../../../core/validators/app-validators';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    TableModule
  ],
  templateUrl: './billing-list.component.html',
  styleUrl: './billing-list.component.scss'
})
export class BillingListComponent implements OnInit {
  billings: Billing[] = [];
  patients: Patient[] = [];
  isLoading = true;
  userRole: string | null = null;
  showCreateForm = false;
  billingForm!: FormGroup;
  isSubmitting = false;
  exportingId: string | null = null;
  selectedBilling: Billing | null = null;
  showViewModal = false;
  today: Date = new Date();

  paymentStatuses = Object.values(PaymentStatus);
  paymentMethods = Object.values(PaymentMethod);
  PaymentStatus = PaymentStatus;

  showAutoGenerateModal = false;
  selectedPatientIdForAuto: string = '';
  patientAppointments: Appointment[] = [];
  selectedAppointmentId: string = '';

  manualPatientAppointments: Appointment[] = [];
  isSyncingItems = false;
  isGenerating = false;

  constructor(
    private billingService: BillingService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private appNotificationService: AppNotificationService,
    private statusModalService: StatusModalService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.initForm();
    this.loadBillings();
    this.patientService.getAll().subscribe((res: ApiResponse<Patient[]>) => this.patients = res.data);
  }

  initForm(): void {
    this.billingForm = this.fb.group({
      patientId: ['', Validators.required],
      appointment: [null],
      paymentMethod: ['CASH'],
      taxAmount: [0, Validators.min(0)],
      discountAmount: [0, Validators.min(0)],
      notes: ['', Validators.maxLength(1000)],
      dueDate: [null, [Validators.required, futureOrTodayDateValidator()]],
      insuranceProvider: [''],
      insuranceClaimNumber: [''],
      insuranceAmount: [0, Validators.min(0)],
      insuranceStatus: ['PENDING'],
      items: this.fb.array([this.createItemGroup()])
    });

    this.billingForm.get('patientId')?.valueChanges.subscribe(id => this.onPatientSelectedForManual(id));

    // Automated Tax Calculation (5% GST)
    this.billingForm.get('items')?.valueChanges.subscribe(() => {
      const subtotal = this.getSubtotal();
      const tax = subtotal * 0.05;
      this.billingForm.get('taxAmount')?.setValue(tax, { emitEvent: false });
    });
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      itemName: ['', [...trimRequired(2, 200)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  get items(): FormArray {
    return this.billingForm.get('items') as FormArray;
  }

  addItem(): void { this.items.push(this.createItemGroup()); }
  removeItem(i: number): void { if (this.items.length > 1) this.items.removeAt(i); }

  getItemTotal(i: number): number {
    const item = this.items.at(i).value;
    return (item.quantity || 0) * (item.unitPrice || 0);
  }

  getSubtotal(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.getItemTotal(i), 0);
  }

  getNetTotal(): number {
    const sub = this.getSubtotal();
    const tax = this.billingForm.get('taxAmount')?.value || 0;
    const discount = this.billingForm.get('discountAmount')?.value || 0;
    return sub + tax - discount;
  }

  loadBillings(): void {
    this.isLoading = true;
    this.billingService.getAll().subscribe({
      next: (res: ApiResponse<Billing[]>) => { this.billings = res.data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
  }

  closeForm(): void { this.showCreateForm = false; }

  onView(bill: Billing): void {
    this.selectedBilling = bill;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedBilling = null;
  }

  openAutoGenerateModal(): void {
    this.showAutoGenerateModal = true;
    this.selectedPatientIdForAuto = '';
    this.patientAppointments = [];
    this.selectedAppointmentId = '';
  }

  onPatientSelectedForAuto(patientId: string): void {
    this.selectedPatientIdForAuto = patientId;
    this.patientAppointments = [];
    this.selectedAppointmentId = '';
    
    if (patientId) {
      this.appointmentService.getByPatientId(patientId).subscribe({
        next: (res) => {
          this.patientAppointments = res.data.filter(a => a.status === 'COMPLETED' || a.status === 'CHECKED_IN');
        }
      });
    }
  }

  onPatientSelectedForManual(patientId: string): void {
    this.manualPatientAppointments = [];
    this.billingForm.get('appointment')?.setValue(null, { emitEvent: false });
    
    if (patientId) {
      this.appointmentService.getByPatientId(patientId).subscribe({
        next: (res) => {
          this.manualPatientAppointments = res.data.filter(a => a.status === 'COMPLETED' || a.status === 'CHECKED_IN');
        }
      });
    }
  }

  onAppointmentSelectedForManual(appointment: any): void {
    if (!appointment || !appointment.id) return;

    this.isSyncingItems = true;
    this.billingService.getPreviewFromAppointment(appointment.id).subscribe({
      next: (res) => {
        const suggested = res.data;
        this.isSyncingItems = false;
        
        if (suggested.items && suggested.items.length > 0) {
          suggested.items.forEach(item => {
            this.items.push(this.fb.group({
              itemName: [item.itemName, [...trimRequired(2, 200)]],
              quantity: [item.quantity, [Validators.required, Validators.min(1)]],
              unitPrice: [item.unitPrice, [Validators.required, Validators.min(0.01)]]
            }));
          });
          this.appNotificationService.info('Items Imported', `Loaded ${suggested.items.length} items from the selected encounter.`);
        }
      },
      error: () => {
        this.isSyncingItems = false;
        this.appNotificationService.error('Sync Failed', 'Could not fetch items for this appointment.');
      }
    });
  }

  generateFromAppointment(): void {
    if (!this.selectedAppointmentId) return;
    
    this.isGenerating = true;
    this.billingService.generateFromAppointment(this.selectedAppointmentId).subscribe({
      next: (res) => {
        this.isGenerating = false;
        this.showAutoGenerateModal = false;
        this.appNotificationService.success('Bill Generated', 'Invoice auto-calculated from consultation, lab tests, and medicines.');
        this.statusModalService.showSuccess('Bill Generated', 'Invoice auto-calculated from consultation, lab tests, and medicines.');
        this.loadBillings();
      },
      error: (err: HttpErrorResponse) => {
        this.isGenerating = false;
        const msg = err.error?.message || err.message || 'Could not auto-generate bill for this appointment.';
        this.appNotificationService.error('Generation Failed', msg);
        this.statusModalService.showError('Generation Failed', msg);
      }
    });
  }

  onSubmit(): void {
    if (this.billingForm.invalid) { this.billingForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    const formValues = this.billingForm.value;
    const payload = {
      ...formValues,
      appointmentId: formValues.appointment?.id || null,
      totalAmount: this.getSubtotal(),
      taxAmount: this.billingForm.get('taxAmount')?.value || 0,
      netAmount: this.getNetTotal(),
      insuranceProvider: formValues.insuranceProvider,
      insuranceClaimNumber: formValues.insuranceClaimNumber,
      insuranceAmount: formValues.insuranceAmount,
      insuranceStatus: formValues.insuranceStatus,
      paymentStatus: 'UNPAID',
      billingDate: this.formatLocalDateTime(new Date()),
      dueDate: this.formatDate(this.billingForm.get('dueDate')?.value),
      items: this.items.controls.map(control => {
        const value = control.value;
        return {
          ...value,
          totalValue: (value.quantity || 0) * (value.unitPrice || 0)
        };
      })
    };

    this.billingService.create(payload).subscribe({
      next: (response: ApiResponse<Billing>) => {
        this.appNotificationService.success('Invoice Created', 'A new billing invoice has been generated.');
        this.isSubmitting = false;
        this.closeForm();
        this.loadBillings();
        this.statusModalService.showSuccess('Invoice Created', `Invoice ${response.data.invoiceNumber} has been generated successfully.`);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.appNotificationService.error('Invoice Creation Failed', error.error?.message || 'Failed to create invoice.');
        this.statusModalService.showError('Creation Failed', error.error?.message || 'Could not create invoice.');
      }
    });
  }

  onUpdateStatus(id: string, status: PaymentStatus): void {
    this.billingService.updateStatus(id, status).subscribe({
      next: () => {
        this.appNotificationService.success('Billing Status Updated', `Invoice status changed to ${status}.`);
        this.loadBillings();
      },
      error: () => this.appNotificationService.error('Status Update Failed', 'Billing status could not be updated.')
    });
  }

  onExportPdf(billing: Billing): void {
    this.exportingId = billing.id;
    try {
      const doc = new jsPDF();
      
      doc.text('Artemis Health System', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('Medical Center Excellence | 123 Healthcare Blvd, Medical City', 105, 26, { align: 'center' });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 32, 190, 32);
      
      doc.setFontSize(16);
      doc.text('INVOICE', 20, 45);
      
      doc.setFontSize(10);
      doc.text(`Invoice #: ${billing.invoiceNumber}`, 20, 52);
      doc.text(`Date: ${new Date(billing.billingDate).toLocaleDateString()}`, 20, 57);
      doc.text(`Status: ${billing.paymentStatus}`, 20, 62);
      
      doc.text('Bill To:', 150, 45);
      doc.setFont('helvetica', 'bold');
      doc.text(billing.patientName, 150, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(`Method: ${billing.paymentMethod || 'N/A'}`, 150, 55);
      
      const tableData = (billing.items || []).map(item => [
        item.itemName || 'N/A',
        (item.quantity || 0).toString(),
        `INR ${(item.unitPrice || 0).toFixed(2)}`,
        `INR ${(item.totalValue || 0).toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        foot: [
          ['', '', 'Subtotal:', `INR ${(billing.totalAmount || 0).toFixed(2)}`],
          ['', '', 'Tax:', `INR ${(billing.taxAmount || 0).toFixed(2)}`],
          ['', '', 'Discount:', `-INR ${(billing.discountAmount || 0).toFixed(2)}`],
          ['', '', 'Net Total:', `INR ${(billing.netAmount || 0).toFixed(2)}`]
        ],
        footStyles: { fillColor: [245, 245, 245], textColor: 40, fontStyle: 'bold' }
      });
      
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY + 20 : 200;
      
      doc.text('This is a computer-generated invoice and doesn\'t require a physical signature.', 105, finalY + 5, { align: 'center' });
      
      doc.save(`invoice-${billing.invoiceNumber}.pdf`);
      
      this.appNotificationService.info('PDF Generated', `Invoice ${billing.invoiceNumber} was downloaded.`);
      this.exportingId = null;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      this.appNotificationService.error('PDF Export Failed', 'Invoice PDF could not be generated.');
      this.exportingId = null;
    }
  }

  getStatusClass(status: PaymentStatus): string {
    const map: Record<string, string> = {
      PAID: 'status-completed',
      PENDING: 'status-scheduled',
      PARTIAL: 'status-checked-in',
      OVERDUE: 'status-cancelled',
      CANCELLED: 'status-cancelled'
    };
    return map[status] || '';
  }

  onDelete(id: string): void {
    if (!confirm('Delete this billing record?')) return;
    this.billingService.delete(id).subscribe({
      next: () => {
        this.appNotificationService.success('Billing Deleted', 'The billing record has been removed.');
        this.loadBillings();
      },
      error: () => this.appNotificationService.error('Delete Failed', 'Billing record could not be deleted.')
    });
  }

  patientOptions(): Array<{ label: string; value: string }> {
    return this.patients.map(patient => ({ label: patient.name, value: patient.id }));
  }

  paymentMethodOptions(): Array<{ label: string; value: string }> {
    return this.paymentMethods.map(method => ({ label: method, value: method }));
  }

  private formatDate(value: Date | null): string | null {
    if (!value) {
      return null;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatLocalDateTime(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const mins = String(value.getMinutes()).padStart(2, '0');
    const secs = String(value.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}:${secs}`;
  }
}
