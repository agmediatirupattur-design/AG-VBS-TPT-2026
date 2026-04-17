import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Registration from './pages/Registration';
import Report from './pages/Report';
import DaySchedule from './pages/DaySchedule';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import StudentAttendance from './pages/StudentAttendance';
import Expenses from './pages/Expenses';
import Admin from './pages/Admin';
import FaithClassBook from './pages/FaithClassBook';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
              <Route path="/schedule/:dayId" element={<ProtectedRoute><DaySchedule /></ProtectedRoute>} />
              <Route path="/registration" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/my-class" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
              <Route path="/faith-class-book" element={<ProtectedRoute><FaithClassBook /></ProtectedRoute>} />
              
              {/* Admin Only Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute requireAdmin={true}><Report /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute requireAdmin={true} allowedFor={["Hari", "Jeba", "Yessaiya", "Vignesh", "Chandra Mohan"]}><Expenses /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
