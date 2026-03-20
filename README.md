# Hospital Management System (HMS)

A comprehensive Hospital Management System built with Java (Spring Boot) and Angular, designed to streamline hospital operations, manage patient records, and facilitate communication between different departments.

## 🚀 Technical Stack

- **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security, MySQL, MapStruct, Lombok.
- **Frontend:** Angular, PrimeNG, RxJS.
- **Messaging/Caching:** Redis (Cache).
- **Documentation:** OpenAPI (Swagger).

## 🏥 Module Overview

### 1. User & Role Management
The system implements Role-Based Access Control (RBAC) with the following roles:
- **ADMIN:** Complete system access, user management, and dashboards.
- **DOCTOR:** Patient diagnosis, prescriptions, and lab test requests.
- **RECEPTIONIST:** Patient registration, appointment scheduling, and billing.
- **PHARMACIST:** Inventory management and filling prescriptions.
- **LABORATORY_STAFF:** Managing lab tests and updating results.
- **PATIENT:** Viewing appointments, prescriptions, and reports.

### 📋 Working Features by Role

#### Admin
- **Global Dashboard:** Visualize total patients, appointments, revenue, and low stock items.
- **User Management:** Create and manage staff accounts.
- **System Settings:** Configure hospital departments and service fees.

#### Doctor
- **My Appointments:** View and manage scheduled consultations.
- **Electronic Health Record (EHR):** Access patient medical history.
- **E-Prescription:** Generate digital prescriptions for medicines and lab tests.
- **Consultation Status:** Track patient progress from waiting to completion.

#### Receptionist
- **Patient Registration:** Register new patients and update their information.
- **Appointment Booking:** Schedule appointments for various doctors.
- **Billing & Invoices:** Generate invoices, handle payments, and export PDFs using JasperReports.

#### Pharmacist
- **Medicine Inventory:** Manage stock levels, batches, and expiry dates.
- **Dispensing:** View prescriptions and mark medicines as dispensed.
- **Low Stock Alerts:** Get notified when medicine stock falls below reorder levels.

#### Laboratory Staff
- **Test Management:** View requested lab tests.
- **Result Recording:** Enter and finalize test results for doctor review.

#### Patient
- **Self-Service Portal:** View own medical records, prescriptions, and upcoming appointments.

## 🌐 API Endpoints

All API endpoints are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/login` | User login to receive JWT token |
| POST | `/register` | Register a new user |
| POST | `/logout` | Invalidate session |

### Patient Management (`/api/v1/patients`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all patients (Paginated) |
| GET | `/{id}` | Get patient details |
| POST | `/` | Create a new patient |
| PUT | `/{id}` | Update patient information |
| GET | `/search` | Search patients by criteria |

### Appointment Scheduling (`/api/v1/appointments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List all appointments |
| POST | `/` | Book a new appointment |
| PATCH | `/{id}/status` | Update appointment status |

### Pharmacy (`/api/v1/medicines`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List medicine inventory |
| GET | `/low-stock` | Get medicines below reorder level |
| POST | `/` | Add new medicine batch |

### Billing (`/api/v1/billings`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all billing records |
| POST | `/` | Generate new bill |
| GET | `/{id}/export` | Export bill as PDF |

### Laboratory Tests (`/api/v1/lab-tests`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List lab test requests |
| PATCH | `/{id}/results` | Update test results |

## 🛠️ Project Flow & Working

1. **Authentication:** Users must log in to obtain a JWT. All subsequent requests require the `Authorization: Bearer <token>` header.
2. **Patient Onboarding:** Receptionists register patients, creating a unique profile.
3. **Appointment Lifebeat:** 
   - Booked by Receptionist.
   - Status transitions: `SCHEDULED` -> `CONFIRMED` -> `IN_CONSULTATION` -> `COMPLETED`.
4. **Diagnosis & Treatment:**
   - Doctor examines the patient and generates a Prescription.
   - Doctor may request Lab Tests.
5. **Fulfillment:**
   - Pharmacist dispenses medicines based on the prescription.
   - Lab Staff updates test results.
6. **Financial:**
   - Receptionist generates a bill incorporating consultation fees, medicine costs, and lab fees.

## ⚠️ Global Error Handling

The backend uses a `GlobalExceptionHandler` to return uniform error responses.

**Standard Success Response:**
```json
{
  "success": true,
  "message": "Request successful",
  "data": { ... },
  "status": 200,
  "timestamp": "2026-03-13T12:00:00",
  "correlationId": "uuid-..."
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Error details",
  "errorCode": "ERROR_CODE",
  "status": 400,
  "timestamp": "2026-03-13T12:00:00",
  "validationErrors": [
    { "field": "email", "message": "Invalid format" }
  ]
}
```

## 🏗️ Development Setup

### Backend
1. Configure MySQL in `src/main/resources/application.properties`.
2. Run `./mvnw spring-boot:run`.

### Frontend
1. Install dependencies: `npm install`.
2. Run `ng serve`.
3. Open `http://localhost:4200`.
