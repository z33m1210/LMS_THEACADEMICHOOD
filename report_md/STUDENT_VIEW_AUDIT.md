# Student View Audit: Duolingo-Style Path
**Project**: The Academic Hood LMS  
**Subject**: /student/course/:courseId (CoursePath.jsx)  
**Objective**: Analyze existing "Path" architecture for Teacher-side porting.

---

## 1. Frontend Architecture Audit
The student course map currently follows a vertical, linear progression path inspired by Duolingo.

### Component Structure
*   **Path Container**: `.lesson-path` acts as the vertical flex-column track.
*   **Connector Line**: Implemented via a pseudo-element `::before` on the `.lesson-path` container.
    *   *Spec*: `width: 4px; background: rgba(0, 0, 0, 0.05); left: 50%; transform: translateX(-50%);`
*   **Nodes**: `.lesson-node` is the primary interactive unit.
    *   *Shape*: Capsule design (`border-radius: 50px`) with a circular `icon-box` and `node-text` label.
    *   *Spacing*: `gap: 40px` between nodes in the column.

### Design Tokens
*   **Node Sizing**: Min-width `280px`, Icon-box `50px`.
*   **Typography**: Inter (900 weight for headers, 600 for subtext).
*   **Glassmorphism**: Modules are grouped in `glass-card` sections.
*   **Active Indicator**: A pulse animation (`@keyframes pulse`) triggered on the `.active` class.

---

## 2. Progress & Logic Mapping
The UI state is directly driven by backend progress tracking.

### Visual States
1.  **Locked/Hidden**: Not explicitly implemented yet (all lessons currently "Open").
2.  **In Progress (Active)**: Pulses and scales to `1.05`. Determined by finding the *first* lesson in the array where `isCompleted === false`.
3.  **Completed**: Switches theme to Green (`#27ae60`) and displays a checkmark `✓` icon.

### Activity Execution
*   **Trigger**: `onClick` event on the node.
*   **Action**: Navigates to a dedicated route: `/student/lesson/:lessonId`.
*   *Note for Porting*: The Teacher View should support an "Admin Action" mode where clicking a node opens an **Activity Editor** instead of the learner view.

---

## 3. Data Schema Alignment
*   **Sequence**: The path relies on the array order returned by the `getCourseDetails` API. 
*   **OrderIndex**: The `orderIndex` field in the Prisma `Activity` and `Lesson` models is the "source of truth" for this sequence.
*   **Activity Types**: The path currently only renders **Lessons**. It does NOT yet drill down to show individual **Activities** (PAGE, RESOURCE, etc.) as sub-nodes.
    *   *Requirement*: The "Tiles & Activities" workspace must bridge this gap by rendering these activities as sub-nodes on the path.

---

## 4. Technical Spec for Teacher-Side Porting
To recreate the "Duolingo" feel on the Teacher Side with management controls:

| Feature | Student View Implementation | Teacher Port Requirement |
| :--- | :--- | :--- |
| **Node Layout** | Vertical Capsule | Vertical Row (Tile) |
| **Connectors** | Passive Gray Line | Functional "Add Content" Gap |
| **Actions** | Navigate to Lesson | Edit / Hide / Delete / Drag-Handle |
| **Feedback** | Pulse Animation | Save-Status Indicators (Champ Mascot) |
| **Types** | Generic Icons | Type-Specific Badges ( Lucide Icons) |

---
**Audit Performed by**: Antigravity AI  
**Date**: May 1, 2026
