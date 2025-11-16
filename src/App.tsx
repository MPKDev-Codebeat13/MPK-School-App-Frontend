import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Signup from './pages/Signup'
import Login from './pages/Login'
import CheckEmailPage from './pages/CheckEmailPage'
import VerifyingPage from './pages/VerifyingPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import { AuthProvider } from './context/AuthContext' // ✅ FIXED
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import OAuthCallback from './pages/OAuthCallback'
import CompleteProfile from './pages/CompleteProfile'
import SetPasswordAfterOAuth from './pages/SetPasswordAfterOAuth'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import ManageUsersPage from './pages/ManageUsersPage'
import ReportsLessonPlan from './pages/ReportsLessonPlan'
import ReportsAttendancePage from './pages/ReportsAttendancePage'
import CheckLessonPlans from './pages/CheckLessonPlans'
import LessonPlanner from './pages/LessonPlanner'
import CreateLessonPlan from './pages/CreateLessonPlan'
import AttendanceList from './pages/AttendanceList'
import CreateAttendance from './pages/CreateAttendance'
import TakeAttendance from './pages/TakeAttendance'
import ViewAttendance from './pages/ViewAttendance'
import LessonPlanDetails from './pages/LessonPlanDetails'
import PrincipalPage from './pages/PrincipalPage'
import RejectionReasonsPage from './pages/RejectionReasonsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* OAuth Callback */}
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route path="/oauth-success" element={<OAuthCallback />} />
            <Route path="/set-password" element={<SetPasswordAfterOAuth />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* Protected Route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/manage-users" element={<ManageUsersPage />} />
              <Route path="/reports-lesson" element={<ReportsLessonPlan />} />
              <Route
                path="/reports-attendance"
                element={<ReportsAttendancePage />}
              />
              <Route
                path="/check-lesson-plans"
                element={<CheckLessonPlans />}
              />
              <Route path="/lesson-plan/:id" element={<LessonPlanDetails />} />
              <Route path="/lesson-planner" element={<LessonPlanner />} />
              <Route
                path="/create-lesson-plan"
                element={<CreateLessonPlan />}
              />
              <Route path="/attendance/" element={<AttendanceList />} />
              <Route path="/attendance/create" element={<CreateAttendance />} />
              <Route
                path="/attendance/take/:count"
                element={<TakeAttendance />}
              />
              <Route path="/attendance/view/:id" element={<ViewAttendance />} />
              <Route path="/principal" element={<PrincipalPage />} />
              <Route
                path="/rejection-reasons"
                element={<RejectionReasonsPage />}
              />
            </Route>
            <Route path="/verify/check-email" element={<CheckEmailPage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/verify-email" element={<VerifyingPage />} />
            <Route path="/verify/:token" element={<VerifyingPage />} />

            {/* Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password/:token" element={<ResetPassword />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
