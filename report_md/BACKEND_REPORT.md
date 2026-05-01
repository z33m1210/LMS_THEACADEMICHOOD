# Backend Architecture & Logic Report: The Academic Hood LMS

This document details the backend infrastructure, database schema, and core business logic that powers the LMS.

## 1. Core Technology Stack
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **ORM:** Prisma ORM
- **Database:** SQLite (development/local)
- **Authentication:** JSON Web Tokens (JWT) with Bcrypt password hashing.
- **File Handling:** Multer (S3-ready architecture).

## 2. Database Schema (Prisma)
The system uses a relational schema designed for scalability and auditability.

### A. Identity & Access
- **User:** Stores credentials, roles (`ADMIN`, `TEACHER`, `STUDENT`), and profile data. 
- **ActionLog:** Every administrative change (Create/Update/Delete) is logged with a link to the performing user.
- **PlacementTest:** Stores historical placement scores for student intake.

### B. Academic Hierarchy
- **Course:** The top-level curriculum container.
- **Batch:** Specific class groups linked to a Course. Includes many-to-many relationships for students and teachers.
- **Section:** Curriculum groupings (e.g., "Week 1", "Module A") with meeting links and times.
- **Lesson:** Individual learning units within a Section.
- **Material:** Attachments (PDF, Video, etc.) linked to Sections or Lessons.

### C. Student Progress & Workflow
- **UserProgress:** Tracks completion status per student/lesson.
- **Assignment:** Tasks created within a lesson.
- **Submission:** Student uploads with grading and status tracking.
- **SubmissionComment:** Interaction layer between teachers and students for feedback.

## 3. Core Business Logic & Constraints

### A. Security & RBAC
- **Middleware:** `verifyToken` ensures all requests are authenticated.
- **Role Control:** `checkRole` middleware prevents students from accessing teacher/admin routes.
- **Bcrypt:** Passwords are never stored in plain text.

### B. Soft Delete Architecture
To prevent accidental data loss and maintain audit trails, the following models implement **Soft Delete** logic via a `deletedAt` timestamp:
- `User`
- `Course`
- `Batch`
- `Section`
- `Lesson`
- `Assignment`
*Queries are filtered to exclude records where `deletedAt !== null`.*

### C. File Management
- **Verification:** Uploads are strictly limited to **5MB** via `uploadMiddleware.js`.
- **Filtering:** Only specific file types (PDF, Docx, etc.) are accepted for submissions.

### D. System Auditability
- **ActionLogger:** A centralized utility that captures `CREATE_COURSE`, `DELETE_USER`, `UPDATE_CURRICULUM`, etc., for administrative review.

## 4. API Endpoint Structure
- `/api/auth`: Login, Register, Logout.
- `/api/users`: User management (Admin only).
- `/api/academic`: Courses, Batches, Sections management.
- `/api/student`: Progress tracking, Course Path retrieval.
- `/api/teacher`: Dashboard stats and grading.

---
*Last Updated: 2026-04-30 - Backend Logic Verified & Audited*
