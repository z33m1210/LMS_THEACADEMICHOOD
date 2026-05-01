# ACADEMIC_WORKFLOW.md: The Tiles & Activities Lifecycle

This document defines the technical and user-facing workflow for curriculum management and content delivery within 'The Academic Hood' LMS, focusing on the relationship between **Master Blueprints** and **Batch Instances**.

---

## 1. The Blueprint-to-Instance Handover
The lifecycle of batch content begins with a **Master Course Blueprint**, designed by Admins.

- **Instantiation**: When a new Batch is created, it is linked to a `CourseID`. No physical copy of the curriculum is made at this stage; instead, the system prepares a **Shadow Logic** layer.
- **Inheritance**: By default, the Batch "sees" all Sections, Lessons, and Assignments from the Master Blueprint.
- **Shadow Layer Preparation**: The system initializes empty relational slots in the `BatchSection`, `BatchLesson`, and `BatchAssignment` tables. These tables only store *differences* (overrides) from the Master, ensuring high performance and data integrity.

## 2. The Teacher’s Command Center (The Grid)
Teachers manage their cohort via the **Tiles Architecture** found on the `BatchDetailPage.jsx`.

- **Visual Interface**: Each module (Section) is represented as a high-fidelity **Glassmorphism Card**.
- **Structural Controls**:
    - **Renaming**: Clicking the 'Edit' icon on a tile allows for inline renaming. The system employs a **300ms instant-save** workflow that persists the name to `BatchSection`.
    - **Visibility (isHidden)**: Teachers can toggle the 'Eye' icon to hide modules. Hidden modules are desaturated for Teachers and completely invisible to Students.
    - **Grid Layout**: Tiles are arranged in a responsive grid (`repeat(auto-fill, minmax(320px, 1fr))`), providing a modern, dashboard-like overview of the course path.

## 3. Multi-Type Activity Management
Within each tile (Module), Teachers manage a diverse ecosystem of content types:

| Type | Description | Workflow |
| :--- | :--- | :--- |
| **Labels** | Inline text instructions. | Rendered directly in the activity list to provide context or weekly goals. |
| **Pages** | Long-form reading content. | Clicking opens a dedicated Glassmorphism modal with rich text formatting. |
| **Resources** | External links/PDFs. | Provides direct access to batch-specific downloads (e.g., a specific Zoom link or PDF). |
| **Assignments** | Graded activities. | Tracks student submissions, provides feedback, and contributes to the final average grade. |

## 4. The Non-Destructive Override Logic
The system enforces a strict **RBAC (Role-Based Access Control)** barrier to protect the Master Blueprint.

- **Technical Isolation**: When a Teacher edits a 'Week 1' title in *Batch A*, the system creates/updates a record in `BatchSection` linked to *Batch A*.
- **Consistency**: *Batch B* (linked to the same Course) and the **Master Blueprint** remain entirely untouched. 
- **Blueprint Safety**: Only Admins can modify the global structure; Teachers are empowered to customize their *instance* of the course without risk of corrupting the core curriculum.

## 5. The Student Progress Loop
Students experience the curriculum through a tactile, interactive interface.

- **Expansion UX**: Clicking a tile triggers a smooth `cubic-bezier` transition that expands the card to reveal the activity list.
- **Real-Time Progress**: 
    - Each tile displays a progress indicator (e.g., **"2 / 5 Items Complete"**).
    - As Students complete activities or submit assignments, the `UserProgress` table is updated, and the tile's progress bar fills in real-time.
- **Completion Gratification**: Completed items are marked with success-green indicators to provide instant positive reinforcement.

## 6. Removal of Weighted Constraints
To allow for maximum pedagogical flexibility, the system has moved to a **Standard Average Model**.

- **Zero-Friction Saving**: Teachers are no longer required to balance assignment weights to 100%. They can add, remove, or modify assignments with immediate persistence.
- **Grading Logic**: Final grades are calculated as a simple average of all graded submissions within the batch's active modules.
- **Immediate Persistence**: Changes to the curriculum structure (adding/hiding lessons) are reflected in the grading desk instantly, ensuring accurate academic reporting at all times.

---
*Status: ACTIVE*
*Architecture Version: 4.2 (Standard Average Grading)*
