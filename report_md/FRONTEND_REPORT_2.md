# Frontend Report v2: The 'Grading Desk' & 'Work Desk'

This report covers the UI implementation of the premium assignment submission and notification system.

## 1. Student 'Work Desk' (LessonView.jsx)
- **Submission Card:** A dedicated Glassmorphism container for assignments.
- **Drag & Drop Zone:** Integrated `react-dropzone` for a high-end interaction model.
- **Revision Management:** UI detects existing submissions and prompts the user before replacing them with a new version.
- **Champ Mascot Integration:** Real-time feedback ("Locked in!") upon successful upload.

## 2. Teacher 'Grading Desk' (TeacherDashboard.jsx)
- **Ungraded Queue:** A high-fidelity glass table listing all pending student work.
- **Side-by-Side Grading:** 
  - **Left Panel:** Submission metadata and file download link.
  - **Right Panel:** Direct numerical input (0-100) and feedback text area.
- **Real-time Refresh:** Queue updates immediately after grading.

## 3. Notification System
- **Alert Dot:** A red indicator on the sidebar Notifications icon alerts students to new activity.
- **Notification Center:** 
  - A new dedicated page [Notifications.jsx] listing feedback in reverse-chronological order.
  - Features glass-card layouts and staggered entry animations.

## 4. UI/UX Standards
- **Font:** Inter (400-900 weights) used across all feedback forms.
- **Color:** Hood Orange (#e67e22) for notification alerts and active highlights.
- **Minimalism:** Expanded padding and reduced visual clutter for the grading interface.

---
*Last Updated: 2026-04-30 - Submission Hub UI Verified*
