# Task List: Transition to Tiles & Activities Architecture

## Phase 1: Database Migration (Prisma)
- [x] Define `ActivityType` Enum in `schema.prisma`.
- [x] Create `Activity` and `BatchActivity` models.
- [x] Update `Lesson` and `Batch` models to include `Activity` relations.
- [x] Run Prisma migration and regenerate client.
- [x] Migrate existing `Assignment` data to the new `Activity` model.

## Phase 2: Backend Refactor (Standard Average & Security)
- [x] Refactor `academicController.js` to implement the **Standard Average Model**.
- [x] Implement the **Shadow Logic Fetcher** (Curriculum Assembler).
- [x] Implement **DOMPurify** sanitization middleware for `longContent`.
- [x] Create dedicated image upload route and pipeline.

## Phase 3: Frontend - Layout Stability & Performance
- [x] Refactor `BatchDetailPage.jsx` into a **Responsive Tile Grid**.
- [x] Implement **Cubic-Bezier Expansion UX** for modules.
- [x] Add **Lazy Loading** for `longContent`.
- [x] Add **'Modified' Badge** logic for modules with overrides.
- [x] Ensure layout stability with **Framer Motion**.

## Phase 4: Multi-Type Activity Rendering
- [x] Create `ActivityItem.jsx` for dynamic type rendering.
- [x] Integrate **WYSIWYG Editor** (TinyMCE/Quill) with image upload.
- [x] Implement **'Champ Celebration' Loop** (toast + mascot animation).

## Phase 5: Verification & Safety
- [ ] Verify **Blueprint Protection** (batch edits != master edits).
- [ ] Test **Selective Visibility** for students.
- [ ] Confirm **No Reset** persistence policy.
- [ ] Final visual audit (12px blur, Hood Orange).
