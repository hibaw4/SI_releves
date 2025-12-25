# Diagram Update Requirements Report

**Date:** December 19, 2025  
**Project:** SI Relevés - Meter Reading Management System  
**Status:** Analysis of implemented features vs. existing diagrams

---

## Executive Summary

After reviewing all implemented features in the application and comparing them with the existing diagrams, several diagrams require updates to reflect the current state of the system. The main gaps are in:

1. **Use Case Diagrams** - Missing new use cases for detail pages, simulation interface, and enhanced filtering
2. **Data Models (MCD/MLD)** - Missing `must_change_password` field in User entity
3. **Architecture Diagram** - Missing CI/CD pipeline, Docker infrastructure, and deployment components

---

## 1. Use Case Diagrams Analysis

### Files Reviewed:
- `usecase1.png` - Initial use case diagram
- `usecase2.png` - Updated use case diagram

### Missing Use Cases:

#### 1.1 Detail Pages (All Entities)
**Status:** ❌ NOT IN DIAGRAMS

**Implemented Features:**
- ✅ User Details Page (`/users/:id`)
- ✅ Agent Details Page (`/agents/:id`) with performance metrics and evolution charts
- ✅ Compteur Details Page (`/compteurs/:id`) with reading history
- ✅ Releve Details Page (`/releves/:id`) with full reading information

**Required Updates:**
- Add use case: **"Consulter détails utilisateur"** (View user details) - Superadmin
- Add use case: **"Consulter détails agent"** (View agent details) - Utilisateur Backoffice
- Add use case: **"Consulter détails compteur"** (View meter details) - Utilisateur Backoffice
- Add use case: **"Consulter détails relevé"** (View reading details) - Utilisateur Backoffice, Agent de Terrain

**Actor Associations:**
- Superadmin → "Consulter détails utilisateur"
- Utilisateur Backoffice → "Consulter détails agent", "Consulter détails compteur", "Consulter détails relevé"
- Agent de Terrain → "Consulter détails relevé"

---

#### 1.2 Simulation Interface
**Status:** ❌ NOT IN DIAGRAMS

**Implemented Features:**
- ✅ Simulation page (`/simulation`) for ERP data import simulation
- ✅ **Status display** - Shows current database state (agents, compteurs, releves counts)
- ✅ **Client import simulation** from SI Commercial:
  - Creates 2 meters per client (EAU + ELECTRICITE)
  - Skips addresses that already have 2 meters
  - Returns detailed results (created, skipped with reasons, errors)
  - Console logging for debugging
- ✅ **Agent import simulation** from SI RH:
  - Creates agents with quartier assignment
  - Skips agents with duplicate phone numbers
  - Returns detailed results
- ✅ **Billing export simulation** to SI Facturation:
  - Month/year selection interface
  - Collects all readings for selected period
  - Formats data for billing system (compteur_id, type, client, adresse, consommation, unit)
  - Returns summary (total relevés, eau/électricité counts, total consumption)
  - Console logging of exported data
- ✅ **Mobile reading generation simulation**:
  - Generates realistic readings for all meters
  - Random consumption values (5-30 m³ for water, 100-500 kWh for electricity)
  - Assigns random agents to readings
  - Updates meter current index
  - Returns generation summary
- ✅ **Architecture diagram visualization** - Shows data flow between systems
- ✅ **Quick guide** - Step-by-step instructions for using simulations

**Required Updates:**
- Add use case: **"Consulter statut simulations"** (View simulation status) - Utilisateur Backoffice
- Add use case: **"Simuler import clients ERP"** (Simulate client import from ERP) - Utilisateur Backoffice
  - Details: Creates 2 meters per client, skips existing addresses
- Add use case: **"Simuler import agents ERP"** (Simulate agent import from ERP) - Utilisateur Backoffice
  - Details: Creates agents with quartier, skips duplicates
- Add use case: **"Simuler export facturation"** (Simulate billing export) - Utilisateur Backoffice
  - Details: Month/year selection, formats consumption data for billing system
- Add use case: **"Générer relevés mobiles simulés"** (Generate simulated mobile readings) - Utilisateur Backoffice
  - Details: Generates realistic readings for all meters with random consumption

**Actor Associations:**
- Utilisateur Backoffice → All simulation use cases

**Note:** These are simulation/testing use cases, not production data flows. They should be in a separate package or clearly marked as "Simulation/Test".

---

#### 1.3 Enhanced Filtering and Sorting
**Status:** ⚠️ PARTIALLY IN DIAGRAMS

**Implemented Features:**
- ✅ Filter users by role, search by name/email, sort by any field
- ✅ Filter agents by quartier, search by name, sort
- ✅ Filter compteurs by type, search by address/serial, sort
- ✅ Filter relevés by type, agent, date range, sort

**Current State:**
- Use case "Consulter/Filtrer les relevés" exists but doesn't specify all filtering capabilities
- No explicit use cases for filtering other entities

**Required Updates:**
- Enhance existing use case: **"Consulter/Filtrer les relevés"** to include date range, agent, type filters
- Add use case: **"Filtrer et trier utilisateurs"** (Filter and sort users) - Superadmin
- Add use case: **"Filtrer et trier agents"** (Filter and sort agents) - Utilisateur Backoffice
- Add use case: **"Filtrer et trier compteurs"** (Filter and sort meters) - Utilisateur Backoffice

---

#### 1.4 Password Management Enhancements
**Status:** ⚠️ PARTIALLY IN DIAGRAMS

**Implemented Features:**
- ✅ Change own password (`/change-password`) - All users
- ✅ Reset password for others (Superadmin only)
- ✅ Force password change on first login (`must_change_password` flag)

**Current State:**
- "Modifier son mot de passe" exists for Superadmin
- "Réinitialiser mot de passe (Pour un tiers)" exists for Superadmin
- Missing: Change password for regular users (USER role)

**Required Updates:**
- Update "Modifier son mot de passe" to be available to all authenticated users (not just Superadmin)
- Add include relationship: "Modifier son mot de passe" <<include>> "S'authentifier"
- Add note about forced password change on first login

---

#### 1.5 Reports Page Enhancements
**Status:** ✅ IN DIAGRAMS (but could be more detailed)

**Implemented Features:**

**Monthly Report Tab:**
- ✅ **Month/Year selection** - Interactive dropdowns for period selection
- ✅ **Summary cards** - Total relevés, total agents, average per agent
- ✅ **Distribution by quartier**:
  - Bar chart visualization (total relevés + agent count)
  - Detailed table with: quartier, agent count, total relevés, average daily per agent
- ✅ **PDF export** - Printable format with all monthly data
- ✅ **Period label** - Human-readable period (e.g., "décembre 2025")

**Consumption Evolution Report Tab:**
- ✅ **Year-over-year comparison** - Current year vs. previous year
- ✅ **Yearly totals cards**:
  - Eau (m³): current year, last year, evolution percentage with arrow indicator
  - Électricité (kWh): current year, last year, evolution percentage with arrow indicator
- ✅ **Monthly trend chart**:
  - Line chart with 4 lines: Eau current year, Eau last year (dashed), Électricité current year, Électricité last year (dashed)
  - Interactive tooltips
- ✅ **Monthly data table**:
  - Columns: Month, Eau current year, Eau last year, Evolution %, Électricité current year, Électricité last year, Evolution %
  - Color-coded evolution (red for increase, green for decrease)
- ✅ **PDF export** - Printable format with all consumption data
- ✅ **Evolution calculations** - Percentage change month-over-month and year-over-year

**Current State:**
- "Exporter Rapports PDF (Mensuel, Trends)" exists but is too generic
- Missing granular use cases for each report type

**Required Updates:**
- Split into: **"Consulter rapport mensuel"** (View monthly report) - Utilisateur Backoffice
  - Details: Month/year selection, summary cards, quartier distribution (chart + table)
- Split into: **"Consulter évolution consommation"** (View consumption evolution) - Utilisateur Backoffice
  - Details: Year-over-year comparison, monthly trends, evolution percentages
- Keep: **"Exporter Rapports PDF"** as separate use case with two variants:
  - "Exporter rapport mensuel PDF"
  - "Exporter rapport évolution PDF"

---

## 2. Data Models (MCD/MLD) Analysis

### Files Reviewed:
- `mcd.png` - Conceptual Data Model
- `mcd1.png` - Alternative MCD version
- `mcd2.png` - Another MCD version
- `mld.png` - Logical Data Model
- `mld1.png` - Alternative MLD version

### Missing Attributes:

#### 2.1 User Entity - `must_change_password`
**Status:** ❌ NOT IN ANY DIAGRAM

**Implemented:**
```javascript
must_change_password: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
}
```

**Required Updates:**
- Add attribute `must_change_password` to **Utilisateur** entity in all MCD/MLD diagrams
- Type: `BOOLEAN` (or `TINYINT(1)` in SQL)
- Default: `false`
- Description: "Flag indiquant si l'utilisateur doit changer son mot de passe à la prochaine connexion"

**Affected Diagrams:**
- ✅ `mcd.png` - Add to Utilisateur entity
- ✅ `mcd1.png` - Add to Utilisateur entity
- ✅ `mcd2.png` - Add to Utilisateur entity
- ✅ `mld.png` - Add to USERS table
- ✅ `mld1.png` - Add to COMPTES_BACKOFFICE table

---

#### 2.2 User Entity - `date_modification`
**Status:** ⚠️ CHECK IF PRESENT

**Implemented:**
```javascript
date_modification: {
  type: DataTypes.DATE,
  defaultValue: DataTypes.NOW,
}
```

**Required Action:**
- Verify if `date_modification` exists in all diagrams
- If missing, add to User entity in all MCD/MLD diagrams

---

#### 2.3 Agent Entity - Performance Metrics (Derived)
**Status:** ℹ️ INFORMATIONAL

**Note:** Agent performance metrics (total readings, average daily readings, evolution charts) are **calculated/derived** data, not stored attributes. These should be documented as:
- **Views** or **Computed Properties** in the data model
- Or as **Business Logic** notes, not as database attributes

**No diagram update needed**, but could add a note about performance calculation views.

---

## 3. Architecture Diagram Analysis

### File Reviewed:
- `archy.png` - System Architecture Diagram

### Missing Components:

#### 3.1 CI/CD Pipeline
**Status:** ❌ NOT IN DIAGRAM

**Implemented:**
- ✅ Jenkins server for CI/CD
- ✅ GitHub webhook integration
- ✅ Automated testing (Vitest)
- ✅ Docker build automation
- ✅ Automated deployment

**Required Updates:**
- Add **Jenkins** component to architecture diagram
- Show connection: GitHub → Jenkins (webhook)
- Show connection: Jenkins → Docker Registry/Build
- Show connection: Jenkins → Production Deployment

---

#### 3.2 Docker Infrastructure
**Status:** ❌ NOT IN DIAGRAM

**Implemented:**
- ✅ Docker containers for Backend, Frontend, MySQL
- ✅ Docker Compose orchestration
- ✅ Nginx for frontend serving
- ✅ Traefik reverse proxy (on VPS)

**Required Updates:**
- Add **Docker** layer/containerization notation
- Show Backend API running in Docker container
- Show Frontend running in Docker container (Nginx)
- Show MySQL running in Docker container
- Add **Traefik** as reverse proxy component

---

#### 3.3 Deployment Infrastructure
**Status:** ❌ NOT IN DIAGRAM

**Implemented:**
- ✅ VPS deployment (mcharfi.clueleak.com)
- ✅ SSL/TLS via Traefik
- ✅ Health check endpoints
- ✅ Container orchestration

**Required Updates:**
- Add **Production Server (VPS)** component
- Show deployment flow: Development → CI/CD → Production
- Add **Traefik** as reverse proxy/load balancer
- Show SSL termination at Traefik level

---

#### 3.4 Testing Infrastructure
**Status:** ❌ NOT IN DIAGRAM

**Implemented:**
- ✅ Vitest for unit/integration testing
- ✅ Test reporting (JUnit XML)
- ✅ Automated test execution in CI/CD

**Required Updates:**
- Add **Test Framework (Vitest)** component
- Show test execution in CI/CD pipeline
- Show test results reporting

---

## 4. Business Rules Diagram

### File Reviewed:
- `reglesgestion.jpg` - Business Rules Table

### Status: ✅ MOSTLY COMPLETE

**Implemented Business Rules:**
- ✅ Name formatting (UPPERCASE for nom, Proper Case for prenom)
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Consumption calculation (nouvel_index - ancien_index)
- ✅ Date formatting (French locale)

**Required Updates:**
- Add rule: **"Force password change on first login"** - Category: Security
- Add rule: **"Auto-logout after 10 minutes inactivity"** - Category: Security
- Add rule: **"JWT token expiration: 30 minutes"** - Category: Security

---

## 5. Summary of Required Updates

### Priority 1 (Critical - Missing Core Features):

| Diagram | Update Required | Priority |
|---------|----------------|----------|
| **Use Case Diagrams** | Add detail pages use cases (Users, Agents, Compteurs, Releves) | 🔴 High |
| **Use Case Diagrams** | Add simulation interface use cases | 🔴 High |
| **MCD/MLD Diagrams** | Add `must_change_password` to User entity | 🔴 High |

### Priority 2 (Important - Enhancements):

| Diagram | Update Required | Priority |
|---------|----------------|----------|
| **Use Case Diagrams** | Enhance filtering/sorting use cases | 🟡 Medium |
| **Use Case Diagrams** | Update password change for all users | 🟡 Medium |
| **Architecture Diagram** | Add CI/CD pipeline (Jenkins) | 🟡 Medium |
| **Architecture Diagram** | Add Docker infrastructure | 🟡 Medium |

### Priority 3 (Nice to Have - Documentation):

| Diagram | Update Required | Priority |
|---------|----------------|----------|
| **Architecture Diagram** | Add deployment infrastructure details | 🟢 Low |
| **Business Rules** | Add security rules (auto-logout, token expiration) | 🟢 Low |
| **Use Case Diagrams** | Split reports into more granular use cases | 🟢 Low |

---

## 6. Recommended Action Plan

### Phase 1: Critical Updates (Week 1)
1. ✅ Update all MCD/MLD diagrams to include `must_change_password`
2. ✅ Update Use Case diagrams to add detail pages use cases
3. ✅ Update Use Case diagrams to add simulation interface use cases

### Phase 2: Important Updates (Week 2)
4. ✅ Enhance Use Case diagrams with filtering/sorting details
5. ✅ Update Architecture diagram with CI/CD and Docker components
6. ✅ Update password management use cases

### Phase 3: Documentation Polish (Week 3)
7. ✅ Add deployment infrastructure to Architecture diagram
8. ✅ Update Business Rules with security rules
9. ✅ Review and finalize all diagrams

---

## 7. Files to Update

### Use Case Diagrams:
- `project_report/images/usecase1.png` - **UPDATE REQUIRED**
- `project_report/images/usecase2.png` - **UPDATE REQUIRED**

### Data Models:
- `project_report/images/mcd.png` - **UPDATE REQUIRED**
- `project_report/images/mcd1.png` - **UPDATE REQUIRED**
- `project_report/images/mcd2.png` - **UPDATE REQUIRED**
- `project_report/images/mld.png` - **UPDATE REQUIRED**
- `project_report/images/mld1.png` - **UPDATE REQUIRED**

### Architecture:
- `project_report/images/archy.png` - **UPDATE REQUIRED**

### Business Rules:
- `project_report/images/reglesgestion.jpg` - **OPTIONAL UPDATE**

---

## 8. Notes

### Diagrams That Don't Need Updates:
- ✅ `acteursprompt.jpg` - This is a prompt screenshot, not a diagram
- ✅ `cursorlogo.png` - Logo file, not a diagram
- ✅ `promptmcd.jpg` - Prompt screenshot, not a diagram
- ✅ `promptusecase.jpg` - Prompt screenshot, not a diagram

### Implementation vs. Design:
Some features were implemented that weren't in the original diagrams:
- **Detail pages** - Added for better UX and data exploration
- **Simulation interface** - Added for testing ERP integrations without real data
- **Enhanced filtering** - Added for better data management
- **Password change for all users** - Security best practice

These are **enhancements** that improve the system beyond the original requirements and should be documented in the diagrams.

---

## 9. Detailed Feature Analysis

### 9.1 Simulation Page - Complete Feature List

**All Features Implemented:**

1. **Status Endpoint** (`GET /api/simulation/status`)
   - Returns current database counts (agents, compteurs, releves)
   - Shows available simulated data (clients, agents)
   - Lists available simulation endpoints

2. **Client Import** (`POST /api/simulation/erp/clients`)
   - Processes 10 simulated clients from SI Commercial
   - Creates 2 meters per client (EAU + ELECTRICITE)
   - Skips addresses that already have 2 meters
   - Returns: created count, skipped count (with reasons), errors
   - Console logging for each step

3. **Agent Import** (`POST /api/simulation/erp/agents`)
   - Processes 5 simulated agents from SI RH
   - Creates agents with quartier assignment
   - Skips agents with duplicate phone numbers
   - Returns: created count, skipped count (with reasons), errors

4. **Billing Export** (`POST /api/simulation/facturation/send`)
   - Accepts month/year parameters
   - Collects all readings for selected period
   - Formats data: compteur_id, type, client, adresse, période, consommation, unit, date_releve
   - Returns summary: total relevés, eau/électricité counts, total consumption
   - Console logging of exported data structure

5. **Reading Generation** (`POST /api/simulation/generate-readings`)
   - Generates readings for all meters
   - Random consumption: 5-30 m³ (water), 100-500 kWh (electricity)
   - Assigns random agents
   - Updates meter current index
   - Returns: generated count, errors

6. **UI Features:**
   - Real-time status display (3 cards: agents, compteurs, relevés)
   - Result alerts with success/error states
   - Detailed skip reasons display
   - Loading states for each action
   - Architecture diagram visualization
   - Quick guide instructions
   - Console logging instructions

### 9.2 Reports Page - Complete Feature List

**Monthly Report Features:**

1. **Period Selection**
   - Month dropdown (12 months)
   - Year dropdown (current year - 4 years)

2. **Summary Statistics**
   - Total Relevés card
   - Total Agents card
   - Average per Agent card

3. **Quartier Distribution**
   - Bar chart: total relevés + agent count per quartier
   - Table: quartier, agent count, total relevés, average daily per agent
   - Handles "Non assigné" quartier

4. **PDF Export**
   - Printable HTML format
   - Includes summary, quartier distribution table
   - Styled for printing

**Consumption Evolution Report Features:**

1. **Yearly Totals**
   - Eau card: current year, last year, evolution % with arrow
   - Électricité card: current year, last year, evolution % with arrow
   - Color-coded evolution (red ↑ increase, green ↓ decrease)

2. **Monthly Trend Chart**
   - Line chart with 4 series:
     - Eau current year (solid blue)
     - Eau last year (dashed light blue)
     - Électricité current year (solid yellow)
     - Électricité last year (dashed light yellow)
   - Interactive tooltips
   - Responsive container

3. **Monthly Data Table**
   - Columns: Month, Eau current year, Eau last year, Evolution %, Électricité current year, Électricité last year, Evolution %
   - Color-coded evolution percentages
   - 12 months of data

4. **PDF Export**
   - Printable HTML format
   - Includes yearly totals, monthly data table
   - Styled for printing

5. **Calculations**
   - Monthly averages per type
   - Year-over-year evolution percentages
   - Handles division by zero (returns 0%)

---

*Report generated by analyzing implemented codebase features against existing project diagrams. All features from Simulation and Reports pages have been thoroughly documented.*

