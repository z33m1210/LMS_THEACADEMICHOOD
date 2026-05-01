# Technical Specification: English Center LMS

## 1. Project Overview
A gamified Single-Page Application (SPA) Learning Management System for an English Language Center.
- **Goal:** High performance, interactive frontend with a robust Express backend.
- **Target:** Localhost development for managing students, courses, lessons, and assignments.

## 2. Tech Stack 
### **Frontend (Client-side)**
- **Framework:** React 18+ (Single-Page Application).
- **Build Tool:** Vite.
- **Routing:** React Router DOM.
- **Styling:** Sass (SCSS).
- **Testing:** Vitest (Unit), Playwright (E2E).

### **Backend (Server-side)**
- **Runtime:** Node.js + Express.js.
- **Database:** SQLite (via Prisma ORM).
- **Auth:** JWT (JSON Web Tokens) + bcrypt hashing.
- **Validation:** Joi.
- **Utilities:** Multer (File uploads), Nodemailer (Email).
- **Testing:** Jest + Supertest (API).

## 3. Project Structure & Routing
- **Architecture:** Separated frontend and backend folders.
- **Routing Type:** Single-Page Application (SPA). React Router handles `/login`, `/admin/dashboard`, and `/student/home`.
- **Data Flow:** React fetches data asynchronously from the Express API (e.g., `http://localhost:5000/api/...`).
- **File Storage:** The backend stores uploaded assignments in `/server/uploads` and serves them as static files.
- **Assets:** Global assets (badges, logos) are kept in `/client/public`.
```text
/english-center-lms
├── /frontend              // React (Vite) Application
│   ├── /public            // Static assets (logos, badges)
│   ├── /src               // Components, Pages, and SCSS
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── /backend               // Express.js Server
│   ├── /prisma            // Database schema
│   ├── /uploads           // Local storage for PDF/Docx
│   ├── /src               // Routes, Controllers, Middleware
│   ├── .env               // Secrets (JWT, Database URL)
│   ├── server.js          // Entry point
│   └── package.json
└── Spec.md                // Shared Blueprint
4. Initial Database Schema (Prisma/SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

// --- USER, AUTH & RECORDS ---
model User {
  id                Int                @id @default(autoincrement())
  studentId         String?            @unique 
  email             String             @unique
  password          String
  name              String
  phoneNumber       String?
  role              String             // "ADMIN", "TEACHER", or "STUDENT"
  refreshToken      String?            
  deletedAt         DateTime?          
  
  enrollments       Enrollment[]       
  taughtBatches     BatchTeacher[]     
  submissions       Submission[]
  comments          SubmissionComment[] 
  progress          UserProgress[]
  notifications     Notification[]
  actionLogs        ActionLog[]
  announcements     Announcement[]
  placementTest     PlacementTest?     
  certificates      Certificate[]      
}

model PlacementTest {
  id              Int      @id @default(autoincrement())
  studentId       Int      @unique
  overallScore    Float
  listeningScore  Float?
  speakingScore   Float?
  readingScore    Float?
  writingScore    Float?
  testedAt        DateTime @default(now())
  student         User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

model Certificate {
  id             Int      @id @default(autoincrement())
  studentId      Int
  courseId       Int
  issuedAt       DateTime @default(now())
  certificateUrl String
  student        User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course         Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

// --- ACADEMIC STRUCTURE ---
model Course {
  id           Int       @id @default(autoincrement())
  title        String
  description  String
  level        String    
  category     String
  thumbnailUrl String?
  deletedAt    DateTime? 
  
  batches       Batch[]
  sections      Section[]      
  announcements Announcement[]
  certificates  Certificate[]
}

model Batch {
  id          Int            @id @default(autoincrement())
  name        String         
  courseId    Int
  deletedAt   DateTime?
  
  course      Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  students    Enrollment[]
  teachers    BatchTeacher[]
}

model Section {
  id           Int        @id @default(autoincrement())
  courseId     Int
  title        String
  orderIndex   Int
  meetingLink  String?    
  meetingTime  String?    
  deletedAt    DateTime?

  course       Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons      Lesson[]
  materials    Material[] 
}

model Lesson {
  id          Int            @id @default(autoincrement())
  sectionId   Int
  title       String
  orderIndex  Int
  deletedAt   DateTime?
  
  section     Section        @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  materials   Material[]
  assignments Assignment[]
  progress    UserProgress[]
}

model Material {
  id           Int      @id @default(autoincrement())
  type         String   // "VIDEO", "PDF", "DOCX", "XLSX"
  url          String
  originalName String?
  fileSize     Int?
  duration     String?  
  
  sectionId    Int?
  lessonId     Int?
  section      Section? @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  lesson       Lesson?  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}

// --- WORKFLOW & SYSTEM ---
model Assignment {
  id              Int          @id @default(autoincrement())
  lessonId        Int
  title           String
  description     String       
  exerciseFileUrl String?      
  deletedAt       DateTime?
  
  lesson          Lesson       @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  submissions     Submission[]
}

model Submission {
  id           Int        @id @default(autoincrement())
  assignmentId Int
  studentId    Int
  filePath     String     
  grade        Float?
  status       String     
  createdAt    DateTime   @default(now())
  
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student      User       @relation(fields: [studentId], references: [id], onDelete: Cascade)
  comments     SubmissionComment[] 
}

model SubmissionComment {
  id           Int        @id @default(autoincrement())
  submissionId Int
  authorId     Int
  message      String
  createdAt    DateTime   @default(now())
  
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  author       User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
}

model UserProgress {
  id          Int      @id @default(autoincrement())
  studentId   Int
  lessonId    Int
  isCompleted Boolean  @default(false)
  student     User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([studentId, lessonId])
}

model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  message   String
  type      String   
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ActionLog {
  id         Int      @id @default(autoincrement())
  userId     Int
  action     String   
  target     String   
  details    String?  
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Announcement {
  id            Int      @id @default(autoincrement())
  title         String
  message       String
  attachmentUrl String?
  isPinned      Boolean  @default(false)
  expiresAt     DateTime
  authorId      Int
  courseId      Int?     
  author        User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  course        Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

model Enrollment {
  batchId   Int
  studentId Int
  batch     Batch @relation(fields: [batchId], references: [id], onDelete: Cascade)
  student   User  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  @@id([batchId, studentId])
}

model BatchTeacher {
  batchId   Int
  teacherId Int
  batch     Batch @relation(fields: [batchId], references: [id], onDelete: Cascade)
  teacher   User  @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  @@id([batchId, teacherId])
}