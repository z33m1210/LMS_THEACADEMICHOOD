import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseBuilder from './pages/admin/CourseBuilder';
import TeacherDashboard from './pages/TeacherDashboard';
import GradingDeskPage from './pages/teacher/GradingDeskPage';
import BatchManagementPage from './pages/teacher/BatchManagementPage';
import TeacherLessonManager from './pages/teacher/TeacherLessonManager';
import BatchDetailPage from './pages/teacher/BatchDetailPage';
import StudentHome from './pages/student/StudentHome';
import CoursePath from './pages/student/CoursePath';
import LessonView from './pages/student/LessonView';
import Achievements from './pages/student/Achievements';
import Notifications from './pages/Notifications';
import BatchLessonEditor from './pages/teacher/BatchLessonEditor';
import ModuleWorkspacePage from './pages/teacher/ModuleWorkspacePage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/course-builder/:courseId"
            element={
              <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
                <CourseBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/grading-desk"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <GradingDeskPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/course-path/:courseId"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <CoursePath />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/lesson/:lessonId"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <LessonView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/achievements"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <Achievements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/batches"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <BatchManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/batches/:id"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <BatchDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/batches/:id/lessons"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <TeacherLessonManager />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/teacher/batches/:batchId/lessons/:lessonId/edit" 
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <BatchLessonEditor />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/teacher/batches/:batchId/modules/:moduleId"
            element={
              <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                <ModuleWorkspacePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
