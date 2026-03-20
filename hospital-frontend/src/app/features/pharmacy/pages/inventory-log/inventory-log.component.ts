import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/layout/header/header.component';
import { PharmacyService } from '../../../../core/services/pharmacy.service';
import { InventoryTransaction } from '../../../../core/models/pharmacy.models';
import { ApiResponse } from '../../../../core/models/common.models';

import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-inventory-log',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, SidebarComponent, HeaderComponent],
  templateUrl: './inventory-log.component.html',
  styleUrl: './inventory-log.component.scss'
})
export class InventoryLogComponent implements OnInit, OnDestroy {
  transactions: InventoryTransaction[] = [];
  filteredTransactions: InventoryTransaction[] = [];
  isLoading = true;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.loadTransactions();
    
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

  loadTransactions(): void {
    this.isLoading = true;
    this.pharmacyService.getInventoryLog().subscribe({
      next: (res: ApiResponse<InventoryTransaction[]>) => {
        this.transactions = res.data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTransactions = this.transactions;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredTransactions = this.transactions.filter(t => 
      t.medicineName.toLowerCase().includes(q) ||
      t.medicineCode.toLowerCase().includes(q) ||
      t.transactionType.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  }
}
