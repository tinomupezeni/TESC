# Execution Plan: Dynamic Bulk Ingestion & Statistical Reporting

This plan outlines the architecture and implementation steps for expanding the TESC system to support 12 new statistical reporting categories. The solution emphasizes dynamic Excel template generation, robust UI-driven data validation, and strict adherence to the `Student` directory as the Single Source of Truth (SSOT).

## Core Principles

1.  **Student as SSOT:** All new modules (`Scholarships`, `IndustryPlacements`, `InternationalMobility`) link directly to the core `Student` model.
2.  **Standardized Metrics:** Every reporting endpoint will inject a standardized metrics payload (Totals, Male/Female counts, and percentages) to support TESC dashboards consistently.
3.  **Dynamic Ingestion (GIGO Prevention):** Excel templates are generated dynamically based on backend schema definitions. Uploaded data is validated asynchronously and presented in a preview UI where errors can be corrected before committing.
4.  **Continuous Validation:** Every phase involving CRUD operations will include a standalone Python smoke test script.

---

## Phase 1: Core Model Adjustments

**Goal:** Modify existing models to accommodate derived data points without creating unnecessary satellite tables.

### Data Points Addressed
*   Total Enrollments (Derived from `Student`)
*   STEM Enrollments/Graduates (Derived from `program.categories`)
*   Possible Graduates (Derived from `enrollment_year` + `program.duration`)
*   Short Enrollments & Critical Skills (Adding flags to `Program`)
*   Inclusivity (Renaming/expanding Disability)

### Implementation Steps
1.  **`Student` Model (`backend/academic/models.py`)**:
    *   Rename `disability_type` to `inclusivity_category` (Requires a migration handling the data rename if existing data is present, otherwise a simple rename).
    *   Expand the choices to cover albinism, specific disabilities, etc.
2.  **`Program` Model (`backend/faculties/models.py`)**:
    *   Add `is_critical_skill = models.BooleanField(default=False)`.
    *   Add `program_type = models.CharField(choices=[('Degree', 'Degree'), ('Diploma', 'Diploma'), ('Short Course', 'Short Course'), ('Certificate', 'Certificate')], default='Degree')`.
3.  **Create Smoke Test**:
    *   `smoke_test_core_adjustments.py`: Verify creation of Programs with new flags and Students with new inclusivity categories.

---

## Phase 2: Satellite Modules (New Tables) - Partially Complete

**Goal:** Create new tables for data points that require tracking additional metadata beyond the core student profile.

### Data Points Addressed
*   [ ] Scholarships
*   [x] Apprenticeships & Attachments (Combined as `IndustryPlacement`)
*   [ ] International Mobility (Inbound/Outbound)

### Implementation Steps
1.  [ ] **Create `StudentScholarship` Model (`backend/academic/models.py`)**:
    *   Fields: `student` (FK), `provider_name` (Char), `amount` (Decimal, Optional), `year_awarded` (Int).
2.  [x] **Create `IndustryPlacement` Model (`backend/academic/models.py`)**:
    *   Fields: `student` (FK), `placement_type` (Choices: Attachment, Apprenticeship), `company_name` (Char), `start_date` (Date), `end_date` (Date, Optional).
    *   Verified backend model, migration, serializer, ViewSet, route registration, dynamic report schema/service support, institution UI, TESC UI, sidebar links, and `smoke_test_phase2_placements.py`.
3.  [ ] **Create `InternationalMobility` Model (`backend/academic/models.py`)**:
    *   Fields: `student` (FK), `direction` (Choices: Inbound, Outbound), `country` (Char), `foreign_institution` (Char, Optional).
4.  [~] **Create Smoke Test**:
    *   `smoke_test_phase2_placements.py`: Verifies CRUD and dynamic reporting metrics for Industry Placements.
    *   `smoke_test_satellite_modules.py`: Still needed once Scholarships and International Mobility are implemented.

---

## Phase 3: The Dynamic Bulk Ingestion Engine (Backend)

**Goal:** Build the abstraction layer that generates Excel templates, parses uploads, and validates data against the core student directory.

### Implementation Steps
1.  **Define Ingestion Schemas (`backend/academic/ingestion_schemas.py`)**:
    *   Create configuration dictionaries for each module defining required fields, data types, and mapping to model fields.
2.  **Template Generator Service (`backend/academic/services/template_service.py`)**:
    *   Use `openpyxl` to generate Excel files based on the schema.
    *   Implement data validation (dropdowns) in the Excel file for choice fields (e.g., Gender, Program Codes).
3.  **Validation & Parsing Service (`backend/academic/services/ingestion_service.py`)**:
    *   Process uploaded Excel files asynchronously (or using optimized Pandas operations).
    *   Cross-reference National IDs with the `Student` database.
    *   Categorize rows into: `Valid`, `Valid but Needs Student Creation` (if core fields are provided), and `Invalid` (missing data, format errors).
    *   Return a structured JSON payload for the UI preview.
4.  **Create Smoke Test**:
    *   `smoke_test_ingestion_engine.py`: Programmatically generate an Excel file with simulated valid and invalid data, pass it through the ingestion service, and assert the categorization output.

---

## Phase 4: Reporting & Metrics Engine

**Goal:** Ensure all statistical endpoints return standardized gender ratios and totals.

### Implementation Steps
1.  **Update `DynamicReportService` (`backend/reports/dynamic_service.py`)**:
    *   We recently added a basic `metrics` payload. We will standardize this across all new views.
2.  **Create Specific Statistical Views (`backend/reports/views/`)**:
    *   Endpoints for: `/api/v1/reports/stats/inclusivity/`, `/api/v1/reports/stats/placements/`, etc.
    *   Ensure all views utilize the central `metrics` calculation logic.
3.  **Create Smoke Test**:
    *   `smoke_test_reporting_metrics.py`: Call statistical endpoints and assert the presence and mathematical correctness of `total`, `male_pct`, and `female_pct` in the response payload.

---

## Phase 5: The Preview & Validation UI (Frontend)

**Goal:** Build the interface for Harare Poly staff to upload, preview, correct, and commit data.

### Implementation Steps
1.  **Upload Component**: Drag-and-drop interface for Excel files.
2.  **Data Grid Component**:
    *   Display the JSON payload from Phase 3.
    *   Implement color-coding (Green/Yellow/Red).
    *   Allow in-line editing of red cells (errors) or missing core student fields.
3.  **Commit Logic**: Send the corrected/validated payload back to the backend for final database insertion.
