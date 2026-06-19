# Execution Plan: Dynamic Ingestion & Full-Stack Statistical Reporting

This plan outlines the architecture and phased implementation for expanding the TESC system to support 12 new statistical reporting categories. 

## Architectural Philosophy
1.  **Student as SSOT (Single Source of Truth):** All new data modules strictly link back to the core `Student` record. We do not allow "ghost" data.
2.  **Decoupled UI Pages:** To simplify management, each major reporting domain (Scholarships, International, etc.) will have its own dedicated page on both the `inst` (management) and `main` (analytical) frontends.
3.  **Vertical Slices:** We will implement this system domain-by-domain. Each phase includes backend schema updates, API endpoints, `inst` UI, `main` UI, and a continuous validation smoke test.
4.  **Standardized Metrics:** All statistical endpoints return a standardized payload including Total, Male/Female counts, and percentages.
5.  **Dynamic Bulk Ingestion:** Excel templates are generated on the fly. The UI will feature a "Smart Staging" area to resolve missing students before committing data to the database.

---

## Phase 1: Core Database Adjustments & Standardized Metrics [COMPLETED]

**Goal:** Lay the groundwork by adjusting core models and standardizing the statistical output format.
- **Backend:** Renamed `disability_type` to `inclusivity_category`, added `is_critical_skill` and `program_type` to Program.
- **Reporting:** Refactored `DynamicReportService` for standardized metrics.
- **UI:** Updated forms in `inst` side and refactored variables in `main` side.

---

## Phase 2: Domain 1 - Industry Placements (Attachments & Apprenticeships) [COMPLETED]

**Goal:** Build the first full-stack satellite module as a dedicated decoupled page.
- **Backend:** Created `IndustryPlacement` model, API ViewSets, and registered endpoints.
- **Reporting:** Integrated Placements into the dynamic reporting engine.
- **UI:** Created dedicated `/placements` pages on both `inst` and `main` applications with dashboards and management tables.

---

## Phase 3: Domain 2 - Scholarships & Funding [PENDING]

**Goal:** Build the full-stack satellite module for tracking scholarships.

### 1. Backend Data & API
*   **Model:** Create `StudentScholarship` linked to `Student`. Tracks provider name, amount, and year.
*   **API:** Create CRUD and statistical endpoints.
*   **Smoke Test:** `smoke_test_phase3_scholarships.py`.

### 2. Frontend Updates
*   **`inst` UI:** Create `/scholarships` management page.
*   **`main` UI:** Create `/scholarships` analytical dashboard.

---

## Phase 4: Domain 3 - International Mobility [PENDING]

**Goal:** Build the full-stack satellite module for inbound/outbound international students.

### 1. Backend Data & API
*   **Model:** Create `InternationalMobility` linked to `Student`. Tracks direction (Inbound/Outbound), country, and foreign institution.
*   **API:** Create CRUD and statistical endpoints.
*   **Smoke Test:** `smoke_test_phase4_mobility.py`.

---

## Phase 5: The "Smart Staging" Bulk Ingestion Engine [PENDING]

**Goal:** Implement the dynamic Excel generation and "garbage-in-garbage-out" (GIGO) prevention UI.
*   **Backend:** Ingestion service for dynamic templates and validation.
*   **UI:** Reusable `<BulkUploadResolver />` component.
