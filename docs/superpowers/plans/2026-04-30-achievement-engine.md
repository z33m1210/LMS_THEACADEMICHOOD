# Achievement Engine (Step 8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the automatic generation and download of certificates when a student completes a course (reaches 100% progress).

**Architecture:** 
1. Backend: Enhance `completeLesson` to check for course completion and generate a certificate.
2. Backend: Add a dedicated controller and route for retrieving/downloading certificates.
3. Frontend: Add an "Achievements" page or a section in `CoursePath` to view and download certificates.
4. Numerical Score: The certificate will include the average grade of all graded submissions in that course.

**Tech Stack:** Node.js, Express, Prisma, React, canvas-confetti.

---

### Task 1: Backend - Add Achievement Logic to academicController

**Files:**
- Modify: `backend/src/controllers/academicController.js`

- [ ] **Step 1: Implement `generateCertificate` helper and update `completeLesson`**

```javascript
// Add to academicController.js

const calculateAverageGrade = async (studentId, courseId) => {
  const submissions = await prisma.submission.findMany({
    where: {
      studentId,
      assignment: {
        lesson: {
          section: {
            courseId
          }
        }
      },
      status: 'GRADED'
    },
    select: { grade: true }
  });

  if (submissions.length === 0) return 0;
  const sum = submissions.reduce((acc, s) => acc + (s.grade || 0), 0);
  return Math.round(sum / submissions.length);
};

// Update completeLesson to check for course completion
exports.completeLesson = async (req, res) => {
  const { lessonId } = req.body;
  const studentId = req.user.userId;

  try {
    const progress = await prisma.userProgress.upsert({
      where: {
        studentId_lessonId: { studentId, lessonId: parseInt(lessonId) }
      },
      update: { isCompleted: true },
      create: { studentId, lessonId: parseInt(lessonId), isCompleted: true }
    });

    // CHECK FOR COURSE COMPLETION
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) },
      include: { section: true }
    });
    const courseId = lesson.section.courseId;

    const sections = await prisma.section.findMany({
      where: { courseId },
      include: { lessons: true }
    });
    const allLessonIds = sections.flatMap(s => s.lessons).map(l => l.id);

    const completedCount = await prisma.userProgress.count({
      where: {
        studentId,
        lessonId: { in: allLessonIds },
        isCompleted: true
      }
    });

    if (completedCount === allLessonIds.length && allLessonIds.length > 0) {
      // Course 100% Complete!
      const avgGrade = await calculateAverageGrade(studentId, courseId);
      
      // Check if certificate already exists
      const existingCert = await prisma.certificate.findFirst({
        where: { studentId, courseId }
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            studentId,
            courseId,
            certificateUrl: `CERT-${studentId}-${courseId}-${Date.now()}.pdf`, // Mock URL
          }
        });
        
        await prisma.notification.create({
          data: {
            userId: studentId,
            message: `Congratulations! You've completed the course and earned your certificate with a score of ${avgGrade}/100!`,
            type: 'ACHIEVEMENT'
          }
        });
      }
    }

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error marking lesson as complete' });
  }
};
```

### Task 2: Backend - Add Certificate Routes

**Files:**
- Create: `backend/src/controllers/achievementController.js`
- Create: `backend/src/routes/achievementRoutes.js`
- Modify: `backend/server.js`

- [ ] **Step 1: Create Achievement Controller**

```javascript
const prisma = require('../utils/prisma');

exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const certs = await prisma.certificate.findMany({
      where: { studentId },
      include: { course: true }
    });
    
    // Enrich with average grade
    const enrichedCerts = await Promise.all(certs.map(async cert => {
        const submissions = await prisma.submission.findMany({
            where: {
                studentId,
                assignment: { lesson: { section: { courseId: cert.courseId } } },
                status: 'GRADED'
            },
            select: { grade: true }
        });
        const sum = submissions.reduce((acc, s) => acc + (s.grade || 0), 0);
        const avg = submissions.length > 0 ? Math.round(sum / submissions.length) : 0;
        return { ...cert, averageGrade: avg };
    }));

    res.json(enrichedCerts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching certificates' });
  }
};
```

- [ ] **Step 2: Create Achievement Routes and register in server.js**

### Task 3: Frontend - Achievement Page & Download UI

**Files:**
- Create: `frontend/src/pages/student/Achievements.jsx`
- Create: `frontend/src/pages/student/Achievements.scss`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/pages/student/CoursePath.jsx` (Add "Download Certificate" button if 100%)

- [ ] **Step 1: Implement Achievements page with glassmorphism design**
- [ ] **Step 2: Add Certificate button to CoursePath**

```javascript
// In CoursePath.jsx
{progressPercent === 100 && (
  <motion.button 
    className="btn-squishy btn-certificate"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    onClick={() => navigate('/student/achievements')}
  >
    🎓 Claim Certificate
  </motion.button>
)}
```

### Task 4: Verification

- [ ] **Step 1: Verify lesson completion triggers 100% progress**
- [ ] **Step 2: Verify certificate is created in DB**
- [ ] **Step 3: Verify numerical score (average grade) is correctly calculated**
- [ ] **Step 4: Verify download UI appears and functions (Mock download)**

---
