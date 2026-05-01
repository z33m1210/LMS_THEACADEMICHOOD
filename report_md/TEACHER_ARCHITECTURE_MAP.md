# Teacher Role Architecture Map - The Academic Hood LMS

This report provide a comprehensive map of the current TEACHER role implementation, identifying all frontend pages, components, stylesheets, backend infrastructure, and documentation.

## 1. Frontend Pages & Components
The teacher role is primary isolated within the `/teacher` route namespace.

### Pages (`frontend/src/pages/teacher/`)
- **TeacherDashboard.jsx**: The "Command Center" focusing on grading queues, pending submissions, and quick alerts.
- **GradingDeskPage.jsx**: Specialized view for grading assignments with archive previews (Champ mascot integration).
- **BatchManagementPage.jsx**: Main list of assigned batches for curriculum management.
- **BatchDetailPage.jsx**: Detailed view for a specific batch (Curriculum grid + Student Gradebook roster).
- **TeacherLessonManager.jsx**: Simplified CRUD interface for batch-specific lesson management.

### Shared Components (`frontend/src/components/teacher/`)
- **BatchCard.jsx**: High-fidelity cards for the management grid with clickable "Next Session" links.
- **GradingDesk.jsx**: The core logic and UI for the grading workspace (Virtual File Tree, Feedback input).

---

## 2. Stylesheets (SCSS)
All teacher-facing components follow the "Glassmorphism" and "Squishy" design system.

- `BatchDetailPage.scss`: Responsive layout for curriculum and roster tabs.
- `BatchManagementPage.scss`: Grid layout and slide-over transition logic.
- `GradingDeskPage.scss`: Layout for the unified grading workspace.
- `TeacherLessonManager.scss`: Tactile interactions for lesson CRUD (drag handles, action buttons).
- `BatchCard.scss`: premium transitions and hover effects for batch cards.
- `GradingDesk.scss`: Complex layout for the file tree and feedback areas.

---

## 3. Backend Infrastructure

### Controllers (`backend/src/controllers/`)
- **teacherController.js**: 
    - `getTeacherDashboard`: Fetches batches, pending submissions, and academic stats.
    - `getBatchStudents`: Returns student roster with real-time weighted grade calculation.
- **academicController.js**: 
    - Handles Course, Batch, and Lesson CRUD.
    - `calculateWeightedGrade`: Core engine for `(Grade * Weight) / Total_Weight` logic.
- **submissionController.js**:
    - Handles assignment grading (`gradeSubmission`) and archive processing.

### Routes (`backend/src/routes/`)
- **teacherRoutes.js**: Scoped to `/api/teacher/`.
    - `GET /dashboard`
    - `GET /batches/:id/students`
- **academicRoutes.js**: Scoped to `/api/academic/`.
    - `POST/PUT/DELETE /lessons` (Teacher access enabled).

---

## 4. State & Hooks
- **AuthContext.jsx**: Manages `TEACHER` role authentication state and permission guarding.
- **Local State**: Most teacher pages utilize local `useState` for transient data (rosters, curriculum previews) to maintain high performance and 300ms "Instant-Save" responsiveness.

---

## 5. Existing Reports
The core specifications and workflows are documented here:
- **TEACHER_WORKFLOW.md**: (file:///d:/LMS_Website/LMS_THEACADEMICHOOD/report_md/TEACHER_WORKFLOW.md)
- **NAVIGATION_MAP.md**: (file:///d:/LMS_Website/LMS_THEACADEMICHOOD/report_md/NAVIGATION_MAP.md)

---

## Architectural File Tree

```text
d:/LMS_Website/LMS_THEACADEMICHOOD/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── academicController.js
│   │   │   ├── teacherController.js
│   │   │   └── submissionController.js
│   │   └── routes/
│   │       ├── academicRoutes.js
│   │       └── teacherRoutes.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── teacher/
    │   │       ├── BatchCard.jsx
    │   │       ├── BatchCard.scss
    │   │       ├── GradingDesk.jsx
    │   │       └── GradingDesk.scss
    │   └── pages/
    │       ├── TeacherDashboard.jsx
    │       └── teacher/
    │           ├── BatchDetailPage.jsx
    │           ├── BatchDetailPage.scss
    │           ├── BatchManagementPage.jsx
    │           ├── BatchManagementPage.scss
    │           ├── GradingDeskPage.jsx
    │           ├── GradingDeskPage.scss
    │           ├── TeacherLessonManager.jsx
    │           └── TeacherLessonManager.scss
```

---
**Status**: Ready for Step 10 refactor. All routes are unique, and no redundant management logic has been identified.
