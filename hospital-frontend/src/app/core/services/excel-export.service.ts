import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  /**
   * Export an array of objects to an Excel file
   * @param data The array of data objects to export
   * @param filename The name of the file (without extension)
   * @param sheetName The name of the Excel sheet
   */
  exportAsExcelFile(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { 
      Sheets: { [sheetName]: worksheet }, 
      SheetNames: [sheetName] 
    };
    XLSX.writeFile(workbook, `${filename}_${new Date().getTime()}.xlsx`);
  }
}
