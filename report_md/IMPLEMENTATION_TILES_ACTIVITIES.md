# IMPLEMENTATION_TILES_ACTIVITIES.md: Transition Plan

This plan outlines the technical roadmap for refactoring 'The Academic Hood' into a modular **Tiles & Activities** architecture, utilizing the **Shadow Logic** override system and a **Standard Average** grading model.

---

## Phase 1: Database Migration (Prisma)
The goal is to enhance the relational schema to support multi-type content and non-destructive overrides.

### 1.1 Schema Definitions
- **ActivityType Enum**: Add `LABEL`, `PAGE`, `RESOURCE`, `FORUM`, and `ASSIGNMENT` to categorize lesson activities.
- **Activity Model**:
  - `longContent`: String (Text) field for `PAGE` types.
  - `isHidden`: Boolean for the visibility toggle.
- **Batch Overrides**: 
  - Ensure `BatchSection` and `BatchLesson` have unique constraints on `[batchId, sectionId/lessonId]` to prevent duplicate overrides.
  - Add `description` field to `BatchSection` for local module summaries.

## Phase 2: Backend Refactor (Standard Average Model)
Transition from complex weighted math to a transparent, content-driven grading system.

### 2.1 Grading Logic
- **Standard Average ($Grade = \sum Score / n$)**:
  - Refactor `calculateAverageGrade` to ignore the `weight` field.
  - Logic: Count all graded submissions within non-hidden modules and divide the sum by the count.
- **Blueprint Test Strategy**: Implement unit tests to confirm that modifying a `BatchSection` record does **not** update the primary `Section` record.

### 2.2 Shadow Logic Fetcher
- **Merger Controller**: 
  - Implementation of a "Curriculum Assembler" in `academicController.js`.
  - Logic: Fetch Master Sections -> Join with Batch Overrides -> If Override exists, replace Master fields (Title, Desc, Visibility).

## Phase 3: Frontend - The Module Grid
Refactor the curriculum view from a list into a high-fidelity dashboard.

### 3.1 BatchDetailPage.jsx Refactor
- **Tile Grid**: Implement `display: grid` with `auto-fill` and `minmax(320px, 1fr)`.
- **The 300ms Rule**: Implement optimistic UI state for renaming. When a teacher stops typing, the UI shows a "Saved" checkmark immediately, while the network request fires in the background.
- **Glassmorphism**: Apply `backdrop-filter: blur(12px)` and `border: 1px solid rgba(255, 255, 255, 0.3)` to all tiles.

### 3.2 Expansion UX
- **Interactive Tiles**: Clicking a module card triggers a `cubic-bezier(0.175, 0.885, 0.32, 1.275)` height expansion.
- **Reveal Logic**: Slide-down animation for the activity list using Framer Motion or CSS transitions.

## Phase 4: Multi-Type Activity Rendering
Empower teachers to create rich, varied learning paths with interactive feedback.

### 4.1 ActivityItem.jsx Component
- **Dynamic Rendering Logic**:
  - `LABEL`: Render text inline with custom styling for context and goals.
  - `PAGE`: Render as a 'View Content' button that opens a Glassmorphism modal.
  - `RESOURCE`: Render as a download/external link icon.
  - `ASSIGNMENT`: Standard submission entry with status indicators.
- **Mark as Done**: Implementation of a completion toggle that triggers a real-time update to the parent tile's progress fraction (e.g., `2/5 Items`).

### 4.2 WYSIWYG Content Editor
- **Implementation**: Integrate a WYSIWYG editor (e.g., TinyMCE or Quill) for the `longContent` field in Page activities.
- **Purpose**: Allow teachers to format long-form reading materials with headers, lists, and bold text directly within the batch workspace.
- **Glassmorphism Audit**: Ensure the editor toolbar and container adhere to the 12px blur design standard.

### 4.3 The 'Champ Celebration' Loop
- **Interaction**: Trigger a Mascot Champ animation whenever an activity is 'Marked as Done'.
- **Visual**: Render a Glassmorphism toast with the message: *'Great job! Your progress has been updated.'*
- **Logic**: Use the `UserProgress` update confirmation as the trigger for the frontend toast/animation.

## Phase 5: Verification & Safety
Ensure the system is robust and respects role boundaries.

### 5.1 Selective Visibility Test
- **Student View**: Verify that if `isHidden: true` in `BatchSection`, the module and all its children are filtered out of the student's curriculum API response.
- **RBAC Guard**: Confirm that the 'Delete Module' and 'Add Module' global buttons are disabled for Teachers, permitting only 'Hide' and local override actions.

### 5.2 Persistence & Immutability
- **No Reset Constraint**: Explicitly omit any 'Restore to Master' or 'Reset' buttons. Once an override is created for a batch, it remains the permanent version for that cohort unless manually edited or hidden.
- **Optimistic Standards**: Maintain the 300ms Rule for all content updates to ensure a "zero-latency" feel.

---
### Technical Specifications
- **Font**: Inter 900 (Headers), Inter 500 (Body)
- **Transitions**: 300ms ease-in-out / 500ms cubic-bezier for structural shifts.
- **Color Palette**: Hood Orange (`#ff5722`), Success Green (`#2ecc71`), Glass White (`rgba(255,255,255,0.7)`).

*Status: READY FOR EXECUTION*
*Reference: ACADEMIC_WORKFLOW.md*
