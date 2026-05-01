# Backend Report v2: 'Open Revision' Submission & Grading Hub

This report covers the technical implementation of the assignment lifecycle and notification system.

## 1. File Handling & Security
- **Enhanced uploadMiddleware:** 
  - Strictly limits file size to **5MB**.
  - Implemented extension white-listing for: `.pdf`, `.docx`, `.zip`, `.rar`.
  - Added centralized error handling for invalid file types.

## 2. Submission Logic (Open Revision)
- **Model Update:** Added `deletedAt` (DateTime?) to the `Submission` model for soft-deletion support.
- **Controller Logic:** 
  - When a student submits a new version, the system **Soft Deletes** previous metadata for that assignment.
  - This ensures only the most recent submission is visible in the "Active" queue while maintaining the file history on the server.
- **Numerical Grading:** Migrated to a **0-100** numerical scale for better assessment precision.

## 3. Communication & Feedback Layer
- **SubmissionComment:** Integrated teacher feedback storage linked directly to submissions.
- **Notification Engine:** 
  - Automated trigger on grading events.
  - Supports `isRead` status tracking.
  - Endpoints created for fetching and marking notifications as read.

## 4. API Endpoints (New)
- `POST /api/submissions/submit`: Handles file upload and revision logic.
- `GET /api/submissions/lesson/:id`: Retrieves student status for a specific lesson.
- `GET /api/submissions/pending`: Global queue for teachers (ungraded work only).
- `POST /api/submissions/grade/:id`: Assigns score and creates notification.
- `GET /api/submissions/notifications`: Personal notification feed.

---
*Last Updated: 2026-04-30 - Submission Hub Backend Verified*
