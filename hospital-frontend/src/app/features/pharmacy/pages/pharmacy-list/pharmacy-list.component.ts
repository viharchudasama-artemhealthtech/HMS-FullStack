import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { PharmacyService } from '../../../../core/services/pharmacy.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Medicine, MedicineCategory } from '../../../../core/models/pharmacy.models';
import { ApiResponse } from '../../../../core/models/common.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { ExcelExportService } from '../../../../core/services/excel-export.service';
import { CODE_PATTERN, trimRequired } from '../../../../core/validators/app-validators';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pharmacy-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, HeaderComponent, InputTextModule, InputTextareaModule, InputNumberModule, DropdownModule, CalendarModule, TableModule],
  templateUrl: './pharmacy-list.component.html',
  styleUrl: './pharmacy-list.component.scss'
})
export class PharmacyListComponent implements OnInit, OnDestroy {
  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  isLoading = true;
  userRole: string | null = null;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  showAddForm = false;
  showEditForm = false;
  editingMedicine: Medicine | null = null;
  medicineForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showLowStockOnly = false;

  categories = Object.values(MedicineCategory);

  constructor(
    private pharmacyService: PharmacyService,
    private authService: AuthService,
    private fb: FormBuilder,
    private appNotificationService: AppNotificationService,
    private excelExportService: ExcelExportService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.initForm();
    this.loadMedicines();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.medicineForm = this.fb.group({
      name: ['', [...trimRequired(2, 200)]],
      medicineCode: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(CODE_PATTERN)]],
      category: ['', Validators.required],
      manufacturer: ['', [...trimRequired(2, 100)]],
      description: ['', Validators.maxLength(500)],
      unitPrice: [null, [Validators.required, Validators.min(0.01)]],
      quantityInStock: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [10, [Validators.required, Validators.min(0)]],
      expiryDate: [null]
    });
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.pharmacyService.getAll().subscribe({
      next: (res: ApiResponse<Medicine[]>) => {
        this.medicines = res.data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilter(): void {
    let list = this.medicines;
    if (this.showLowStockOnly) {
      list = list.filter(m => m.quantityInStock <= m.reorderLevel);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.medicineCode.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    this.filteredMedicines = list;
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  toggleLowStock(): void {
    this.showLowStockOnly = !this.showLowStockOnly;
    this.applyFilter();
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.showEditForm = false;
    this.editingMedicine = null;
    this.medicineForm.reset({ unitPrice: null, quantityInStock: 0, reorderLevel: 10 });
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(med: Medicine): void {
    this.editingMedicine = med;
    this.showEditForm = true;
    this.showAddForm = false;
    this.medicineForm.patchValue({
      name: med.name,
      medicineCode: med.medicineCode,
      category: med.category,
      manufacturer: med.manufacturer,
      description: med.description,
      unitPrice: med.unitPrice,
      quantityInStock: med.quantityInStock,
      reorderLevel: med.reorderLevel,
      expiryDate: med.expiryDate ? new Date(med.expiryDate) : null
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingMedicine = null;
  }

  onSubmit(): void {
    if (this.medicineForm.invalid) { this.medicineForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    const data = this.medicineForm.value;
    const payload = {
      ...data,
      expiryDate: this.formatDate(data.expiryDate)
    };

    if (this.showEditForm && this.editingMedicine) {
      this.pharmacyService.update(this.editingMedicine.id, payload).subscribe({
        next: () => {
          this.successMessage = 'Medicine updated successfully!';
          this.appNotificationService.success('Medicine Updated', 'The pharmacy item was updated successfully.');
          this.isSubmitting = false;
          this.closeForm();
          this.loadMedicines();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Update failed.';
          this.appNotificationService.error('Update Failed', this.errorMessage);
          this.isSubmitting = false;
        }
      });
    } else {
      this.pharmacyService.create(payload).subscribe({
        next: () => {
          this.successMessage = 'Medicine added successfully!';
          this.appNotificationService.success('Medicine Added', 'A new pharmacy item was added successfully.');
          this.isSubmitting = false;
          this.closeForm();
          this.loadMedicines();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Create failed.';
          this.appNotificationService.error('Create Failed', this.errorMessage);
          this.isSubmitting = false;
        }
      });
    }
  }

  onDelete(id: string): void {
    if (!confirm('Delete this medicine?')) return;
    this.pharmacyService.delete(id).subscribe({
      next: () => {
        this.appNotificationService.success('Medicine Deleted', 'The pharmacy item has been removed.');
        this.loadMedicines();
      },
      error: () => this.appNotificationService.error('Delete Failed', 'Medicine could not be deleted.')
    });
  }

  exportToExcel(): void {
    const dataToExport = this.filteredMedicines.map(med => ({
      'Medicine Name': med.name,
      'Code': med.medicineCode,
      'Category': med.category,
      'Manufacturer': med.manufacturer,
      'Stock Qty': med.quantityInStock,
      'Unit Price': med.unitPrice,
      'Reorder Level': med.reorderLevel,
      'Expiry Date': med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A',
      'Status': med.quantityInStock > med.reorderLevel ? 'In Stock' : (med.quantityInStock > 0 ? 'Low Stock' : 'Out of Stock')
    }));

    this.excelExportService.exportAsExcelFile(dataToExport, 'Medicines_Inventory_Export');
    this.appNotificationService.info('Export Success', 'Medicine list has been exported to Excel.');
  }

  isLowStock(med: Medicine): boolean {
    return med.quantityInStock <= med.reorderLevel;
  }

  categoryOptions(): Array<{ label: string; value: string }> {
    return this.categories.map(category => ({ label: category, value: category }));
  }

  private formatDate(value: Date | string | null): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
