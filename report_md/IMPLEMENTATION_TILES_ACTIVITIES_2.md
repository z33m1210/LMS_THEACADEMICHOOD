# IMPLEMENTATION_TILES_ACTIVITIES_2.md: Advanced Technical Roadmap

This document extends the foundational Tiles & Activities plan with advanced performance, security, and asset management specifications for 'The Academic Hood'.

---

## Phase 1: Database Migration (Prisma)
- **ActivityType Enum**: Add `LABEL`, `PAGE`, `RESOURCE`, `FORUM`, and `ASSIGNMENT`.
- **Activity Model**:
  - `longContent`: String (Text) for `PAGE` types.
  - `isHidden`: Boolean for visibility toggle.
- **Batch Overrides**: Enforce unique constraints on `[batchId, sectionId/lessonId]`.

## Phase 2: Backend Refactor (Standard Average & Security)
### 2.1 Standard Average Model
- **Logic**: Calculate grade as a simple average of all graded submissions. Ignore `weight` field during final score assembly.

### 2.2 Shadow Logic Fetcher
- **Curriculum Assembler**: Merge Master blueprint with `BatchSection/Lesson` overrides.

### 2.3 Security & Sanitization
- **Sanitization Layer**: Implement a backend middleware using **DOMPurify** to sanitize `longContent` before database persistence, mitigating XSS risks from the WYSIWYG editor.
- **Image Upload Pipeline**: 
    - Create a dedicated `POST /api/assets/upload` route.
    - Integrate with a cloud bucket (Firebase/S3) to store images.
    - Return a permanent HTTPS URL for use within the rich text editor.

## Phase 3: Frontend - Layout Stability & Performance
### 3.1 Responsive Tile Grid
- Implement `BatchDetailPage.jsx` grid using CSS Grid and Glassmorphism design tokens.

### 3.2 Expansion UX
- Use `cubic-bezier(0.175, 0.885, 0.32, 1.275)` for structural transitions.

### 3.3 Stability & Optimized Loading
- **Lazy Loading Logic**: Modify the curriculum fetcher to exclude `longContent` from the initial payload. Fetch high-volume text content only when 'View Content' is triggered.
- **Modified Indicators**: Add a subtle **'Modified' badge** (Hood Orange `#ff5722`) to Module Cards containing overrides, providing immediate visual context for Teachers.
- **Stable Transitions**: Utilize **Framer Motion** layout projection to ensure surrounding tiles slide smoothly during expansion, eliminating layout shifts.

## Phase 4: Multi-Type Activity Rendering
### 4.1 ActivityItem.jsx Component
- Dynamic rendering for all 5 activity types.
- Real-time progress updates (e.g., '2/5 Complete') on 'Mark as Done' trigger.

### 4.2 WYSIWYG Capabilities
- **Asset Handling**: Configure TinyMCE/Quill to support **Direct Image Uploads**.
- **UI Integration**: Add a custom 'Upload Image' button to the toolbar that interfaces with the new backend pipeline.

### 4.3 The 'Champ Celebration' Loop
- Trigger Mascot Champ animations and Glassmorphism toasts upon completion milestones.

## Phase 5: Verification & Safety
### 5.1 Selective Visibility & RBAC
- Student-side filtering of hidden modules.
- Blueprint protection: Teachers restricted to overrides only.

### 5.2 Persistence & Immutability
- **No Reset Constraint**: Overrides are permanent until manually changed. No 'Reset to Master' option will be implemented.
- **300ms Rule**: Enforce optimistic updates for all structural changes.

---
### Technical Specifications
- **Sanitization**: DOMPurify (Backend)
- **Layout**: Framer Motion (Projection)
- **Indicators**: Hood Orange (`#ff5722`) for 'Modified' states.
- **Design**: 12px blur Glassmorphism for all upload modals and progress bars.

*Status: FINALIZED*
*Reference: ACADEMIC_WORKFLOW.md*
