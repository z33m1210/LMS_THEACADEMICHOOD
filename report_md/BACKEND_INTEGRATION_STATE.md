# Backend Integration Audit: Module Detail View
**Project**: The Academic Hood LMS  
**Target View**: `/teacher/batches/:batchId/modules/:moduleId`  
**Status**: Research & Specification Phase Complete

---

## 1. Schema State (Prisma)
The database structure is optimized for the **Shadow Logic** pattern (Master Blueprint + Batch Overrides).

*   **Activity Model**: 
    *   Fields: `id`, `lessonId`, `type` (Enum), `title`, `description`, `longContent` (WYSIWYG), `exerciseFileUrl`, `orderIndex`, `isHidden`.
    *   **ActivityType Enum**: `LABEL`, `PAGE`, `RESOURCE`, `FORUM`, `ASSIGNMENT` (Verified).
*   **Override Models**:
    *   `BatchActivity`: Correctly maps `batchId` + `activityId` as a unique compound key. Includes `longContent` and `isHidden` for specific teacher customizations.
    *   `BatchSection` & `BatchLesson`: Functional for title and visibility overrides.
*   **Grading Logic**: `Submission` model includes a `grade` field. 
    *   *Audit Note*: Grading logic is set to follow the **Standard Average Model**, effectively ignoring the `weight` field during calculation.

## 2. API Readiness & Shadow Logic
The backend "Shadow Fetcher" logic is implemented to ensure students see the most recent overrides provided by the teacher.

*   **Logic Handler**: `getBatchCurriculum` in `academicController.js`.
    *   Fetches the Course Master Blueprint and merges it with Batch-specific overrides.
    *   `longContent` is omitted in the list view (Curriculum Pipeline) to optimize bandwidth, and fetched only when editing specific activities.
*   **Persistence Endpoints**:
    *   `POST /api/academic/batches/overrides/activity`: Correctly uses Prisma `upsert` logic for single-activity persistence.
    *   `POST /api/academic/activities`: Creates core blueprint items.
    *   `PUT /api/academic/lessons/:id`: Direct blueprint update (e.g., for global renaming).

## 3. Frontend Mapping (UI-to-State)
The frontend `ModuleWorkspacePage.jsx` has been modernized to handle granular curriculum control.

*   **State Containers**:
    *   `module`: Primary state holding the merged curriculum tree for the specific section.
    *   `activeActivity`: Temporary state for the side-panel editor.
    *   `saveStatus`: Tracks individual activity sync states.
*   **Key Logic**:
    *   `handleOptimisticUpdate`: Performs local state updates immediately, followed by a 300ms debounced POST to the override API.
    *   `handleAddActivity`: Injects new activities into the Master Blueprint then triggers a refresh.

## 4. Asset & Content Logic
*   **Rich Text**: TinyMCE configured with GPL/Self-Hosted license to avoid "Read-only" mode.
*   **Upload Pipeline**: `POST /api/assets/upload` is active and using Multer for `uploads/` directory storage.
*   **Champ Mascot**: 
    *   *Status*: **Pending Implementation**.
    *   Components (`MascotChamp`, `CelebrationToast`) are imported but not yet wired to trigger logic in the `ModuleWorkspacePage` JSX.

---

## 5. Pending Integration Tasks
- [ ] **Mascot Trigger**: Wire `showChamp` to trigger when `saveStatus` transitions to `saved`.
- [ ] **Drag-and-Drop Persistence**: Implement order persistence using `orderIndex` in the backend.
- [ ] **Visibility Toggling**: Ensure `isHidden` UI toggles call the override API.
- [ ] **Image Upload Widget**: Connect the `upload-dropzone` JSX to the `/api/assets/upload` endpoint.

---
**Audit Performed by**: Antigravity AI  
**Date**: May 1, 2026
