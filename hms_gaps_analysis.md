# HMS Gaps & Missing Features Analysis

Based on the current project structure and my analysis of the codebase, here are the key features and potential bugs/limitations when compared to a real-world, industrial-grade Hospital Management System (HMS).

---

## 1. Missing Core Real-World Features

### 📅 Advanced Appointment & Queue Management
*   **Token Generation**: Real HMS systems use tokens (e.g., P-101, D-01) for physical queue management.
*   **SMS/Email Notifications**: No automated notifications for appointment confirmation or reminders.
*   **Video Consultation**: Currently missing Telemedicine integration for remote visits.
*   **Emergency Overrides**: Ability for admins to squeeze in emergency appointments without breaking the schedule.

### 💳 Comprehensive Billing & Finance
*   **Tax/GST Logic**: Billing is currently a simple sum. Real systems need tax calculations (GST/VAT) based on items.
*   **Insurance Integration**: No ability to handle TPA (Third Party Administrator) claims or corporate billing.
*   **Part-Payment/Refunds**: Current billing is usually "all or nothing". Real systems need to track deposits and partial payments.
*   **Itemized Invoice Printing**: Need to generate professional PDF invoices with hospital branding.

### 💊 Pharmacy & Inventory (Enhanced Workflow)
*   **Batch & Expiry Management**: Medicines should be tracked by Batch No. and Expiry Date. Currently, we only have a total quantity.
*   **Purchase Orders (PO)**: Flow for ordering stock from vendors is missing.
*   **Stock Adjustment**: Manual stock update feature (with reasoning like 'breakage' or 'don't know') is missing in the UI.

### 🧪 Advanced Laboratory (LIS)
*   **Sample Tracking**: The workflow should be: *Ordered -> Sample Collected -> Received in Lab -> Processing -> Result Ready*.
*   **Barcoding**: No integration for printing barcode stickers for sample vials.

### 🩺 Clinical/EMR Features
*   **File/Image Support**: Patients currently can't upload X-rays, Scans, or previous medical reports (PDF/JPG).
*   **Previous History (Triaging)**: Ability to view the entire patient history at a glance during consultation.
*   **SOAP Notes**: A standard clinical note format (Subjective, Objective, Assessment, Plan) is missing.

### 🛡️ Security & Administration
*   **Shift Management**: Nurses and staff work shifts. The system doesn't track who is on duty.
*   **Payroll/Attendance**: No integration for staff attendance or salary processing.
*   **Activity Audit Logging (UI)**: The `audit_log` table is populated in the backend, but a UI for admins to view who changed what is missing.

---

## 2. Technical Limitations (Potential Bugs)

### 🧩 Optimistic Locking (Just Added)
*   **Conflict Resolution UI**: While we added `@Version`, the UI currently doesn't handle the "This record was updated by another user" error gracefully; it will likely just show a generic error.

### 📄 Document Storage
*   Everything is currently in the database. A real-world system would use **AWS S3** or **Azure Blob Storage** for massive files like medical scans to keep the database small and fast.

### ⚙️ Scalability (Bulk Actions)
*   **Reporting**: Generating a monthly report by loading all records into memory will crash as the hospital grows. We need database-level aggregation or specialized reporting tools (JasperReports/PowerBI).

### 🔍 Error Sanitization
*   Backend errors (Internal Server Errors) sometimes leak details to the UI. We need more strictly formatted 'Friendly Messages' for the user.

---

## 3. High-Priority Recommendations
If you're moving toward a production-ready system, prioritize these three:
1.  **PDF Generation**: Implement `iText` or `Thymeleaf-PDF` to allow printing invoices and prescriptions.
2.  **Document Uploads**: Integrated `Cloudinary` or S3 for medical reports.
3.  **Real-time Queue**: WebSocket (SignalR/Socket.io) integration for the live patient queue.
