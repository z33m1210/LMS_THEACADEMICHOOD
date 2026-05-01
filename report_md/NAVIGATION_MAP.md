# Navigation Map: The Academic Hood LMS

This document outlines the core navigation structure for the three primary user roles within The Academic Hood LMS. Each route is designed with a premium, responsive UI in mind, utilizing glassmorphism and modern design tokens.

---

## 🔐 Role: ADMIN
The Administrative portal focuses on system-wide oversight, user governance, and academic hierarchy management.

| Feature | Destination Route | Icon | Alert Trigger (Red Dot) |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/admin/dashboard` | `LayoutDashboard` | System health check (errors/warnings) |
| **User Management** | `/admin/users` | `Users` | New user registration requests pending |
| **Academic (Courses/Batches)** | `/admin/courses` | `BookOpen` | Unassigned batches or draft courses |
| **Action Logs** | `/admin/logs` | `Terminal` | Critical security or system failure events |

---

## 👨‍🏫 Role: TEACHER
The Teacher portal provides a focused environment for classroom management, grading, and curriculum development.

| Feature | Destination Route | Icon | Alert Trigger (Red Dot) |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/teacher/dashboard` | `LayoutDashboard` | Important system/center announcements |
| **Batch Management** | `/teacher/batches` | `Briefcase` | Upcoming live session or batch deadline |
| **Grading Desk** | `/teacher/dashboard` | `GraduationCap` | Pending student submissions waiting for review |
| **Lesson Builder** | `/admin/course-builder/:id` | `Edit3` | Unsaved curriculum changes or draft lessons |

---

## 🎓 Role: STUDENT
The Student portal is a gamified, interactive space designed to drive engagement and track learning progress.

| Feature | Destination Route | Icon | Alert Trigger (Red Dot) |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/student/dashboard` | `LayoutDashboard` | New course enrollment or daily streak reminder |
| **My Courses** | `/student/courses` | `BookOpen` | Upcoming assignment deadlines (< 24h) |
| **Notifications** | `/student/notifications` | `Bell` | Unread feedback, grades, or center news |
| **Wall of Fame** | `/student/achievements` | `Trophy` | New achievement badge unlocked and unviewed |

---

> [!NOTE]
> Icons listed above refer to the Lucide React library naming conventions. Alert triggers are implemented via real-time WebSocket events or polling hooks within the `Sidebar` and `Notification` components.
