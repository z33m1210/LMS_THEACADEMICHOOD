# TEACHER WORKFLOW: The Academic Hood LMS

This document defines the high-fidelity UX and workflow standards for the Teacher role, ensuring alignment with the platform's **Soft Minimalism** and **Glassmorphism** design language.

---

## 1. Batch Management View
Teachers manage multiple classes (Batches). The interface must balance broad overview and deep data access.

### Visual Presentation: **Glassmorphism Cards (Grid)**
*   **Rationale**: Cards provide a tactile, organized feel that separates distinct classes effectively.
*   **Key Stats at a Glance**:
    *   **Active Students**: Displayed as a count (e.g., "24 Students") with a mini-avatar stack.
    *   **Average Grade**: A dynamic percentage showing the batch's performance trend.
    *   **Next Session**: Pulled from the `Section.meetingTime` field, displayed in a vibrant Hood Orange badge.
    *   **Progress Meter**: A slim linear progress bar showing how much of the course curriculum has been covered.

### Detailed Interaction: **Premium Data Table (Slide-over)**
*   Clicking a batch card opens a side-panel or full-page table listing all students with their specific attendance and assignment completion rates.

---

## 2. Grading Desk Logic: The "Zero-Inbox" Experience
The Grading Desk is the heart of the teacher's productivity. It must minimize friction.

### The Zero-Inbox State
When the `pendingSubmissions` array is empty, the queue is replaced by a centered, high-contrast visual:
*   **Mascot Champ**: Appears in a "Celebration" pose (wearing a gold medal or holding a coffee cup).
*   **Speech Bubble**: "Inbox Cleared! You've successfully supported every student today. 🚀 Take a breather, you earned it!"
*   **Action**: A "Review Graded History" button appears to maintain workflow flow.

### File Handling for Archives (.zip, .rar)
*   **Side-by-Side View**: The left pane handles file previews.
*   **Archive Logic**: For `.zip` or `.rar` files, the system displays a **Virtual File Tree**.
    *   Teachers can click individual files within the tree to preview them if supported (PDF, Images, JS/HTML).
    *   If unsupported, a "Download Selection" button appears.
    *   A global "Download All" button remains sticky at the top.

---

## 3. Curriculum Builder Integration
Teachers are both graders and content curators.

### Workflow: **The Hybrid Approach**
*   **Quick Updates (In-Place)**: For updating lesson descriptions or adding a single PDF material, the teacher uses an "In-Place Edit" toggle directly on the Batch Curriculum view. This uses inline text editors for 300ms "instant-save" interactions.
*   **Structural Changes (Advanced Builder)**: For reordering sections or adding complex assignments, the teacher is redirected to the **Advanced Glass Accordion Builder** (`CourseBuilder.jsx`). This ensures a focused, distraction-free environment for curriculum design.

---

## 4. Teacher-Specific Mascot (Champ) Triggers
Champ acts as a proactive assistant, not just a decoration.

### Positive Feedback (Encouragement)
*   **Milestone Trigger**: "You've graded 5 missions today! Your feedback is the bridge to their success."
*   **Consistency Trigger**: "3 days in a row with a Zero-Inbox. You're setting the gold standard!"

### Alerts (Proactive Management)
*   **SLA Warning**: "3 submissions are approaching the 24h deadline! Let's clear them before they turn red."
*   **Student at Risk**: "Alex hasn't submitted the last 2 assignments. Maybe a quick message could help?"

---

## 5. Design Standards Check
*   **Glassmorphism**: All modals and side-panels use `backdrop-filter: blur(12px)` and `rgba(255, 255, 255, 0.75)` backgrounds.
*   **Transitions**: Modal entries use a `cubic-bezier(0.175, 0.885, 0.32, 1.275)` "pop" effect.
*   **Typography**: All headers use `Inter` at Extra Bold (900) weight with `-0.02em` tracking.

---
*End of Report*
