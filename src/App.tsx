import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Skills from './pages/Skills'
import Assessment from './pages/Assessment'
import Jobs from './pages/Jobs'
import Profile from './pages/Profile'
import Community from './pages/Community'
import Leaderboard from './pages/Leaderboard'
import Employer from './pages/Employer'
import Admin from './pages/Admin'
import LearningPath from './pages/LearningPath'
import Gamification from './pages/Gamification'
import PracticalAssessment from './pages/PracticalAssessment'
import Mentorship from './pages/Mentorship'
import CodingLab from './pages/CodingLab'
import StudyGroups from './pages/StudyGroups'
import Instructor from './pages/Instructor'
import Courses from './pages/Courses'
import VerifyCertificate from './pages/VerifyCertificate'
import TermsConditions from './pages/TermsConditions'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}><div className="spinner" /></div>
  return user ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/community" element={<Community />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/assessment/:id" element={<PrivateRoute><Assessment /></PrivateRoute>} />
        <Route path="/assessment/:id/practical" element={<PrivateRoute><PracticalAssessment /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/employer" element={<PrivateRoute><Employer /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/learning" element={<PrivateRoute><LearningPath /></PrivateRoute>} />
        <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
        <Route path="/mentorship" element={<PrivateRoute><Mentorship /></PrivateRoute>} />
        <Route path="/coding-lab" element={<PrivateRoute><CodingLab /></PrivateRoute>} />
        <Route path="/study-groups" element={<PrivateRoute><StudyGroups /></PrivateRoute>} />
        <Route path="/instructor" element={<PrivateRoute><Instructor /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
        <Route path="/verify/:certId" element={<VerifyCertificate />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/enterprise" element={<PrivateRoute><Employer /></PrivateRoute>} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
