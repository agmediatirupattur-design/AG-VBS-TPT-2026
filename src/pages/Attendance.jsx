import React, { useState, useEffect, useContext } from 'react';
import './Attendance.css';
import { UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const defaultTeachers = [
  { id: 1, name: 'Gethsiyal', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 2, name: 'Sharmila', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 3, name: 'Gracepriya', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 4, name: 'Archana', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 5, name: 'Esther', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 6, name: 'Jecitha', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 7, name: 'Sofia', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 8, name: 'Keerthana', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 9, name: 'Jamuna', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 10, name: 'Lakshmi', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 11, name: 'Priya Angel', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 12, name: 'Preethi', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 13, name: 'Megala', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 14, name: 'Puspalatha', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 15, name: 'Priyadarshini', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 16, name: 'Yuvashri', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 17, name: 'Jessica', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 18, name: 'Kishori', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 19, name: 'Shekina', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 20, name: 'Shamili', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 21, name: 'Nithya', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 22, name: 'Amutha Jose', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 23, name: 'Lambert', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 24, name: 'Dharani', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 25, name: 'Remi', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 26, name: 'Vennila', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 27, name: 'Rajmary', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 28, name: 'Vasudevan', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 29, name: 'Hari', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 30, name: 'Jeba', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 31, name: 'Yessaiya', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 32, name: 'Vignesh', attendance: { '27': false, '28': false, '29': false, '30': false } },
  { id: 33, name: 'Chandra Mohan', attendance: { '27': false, '28': false, '29': false, '30': false } }
];

const mergeTeacherData = (baseTeachers, localTeachers) => {
  const merged = baseTeachers.map((teacher) => {
    const localTeacher = localTeachers.find(item => item.id === teacher.id);
    if (!localTeacher) return teacher;
    return {
      ...teacher,
      ...localTeacher,
      attendance: {
        ...teacher.attendance,
        ...localTeacher.attendance
      }
    };
  });
  localTeachers.forEach((localTeacher) => {
    if (!merged.some(item => item.id === localTeacher.id)) {
      merged.push(localTeacher);
    }
  });
  return merged;
};

const Attendance = () => {
  const { username, role } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [selectedDay, setSelectedDay] = useState("27");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const days = ["27", "28", "29", "30"];

  const normalizeName = (name = '') =>
    name?.toString().toLowerCase().trim().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();

  const getDisplayName = (teacher) => teacher.name || teacher.teacherName || 'Unknown Teacher';

  useEffect(() => {
    const fetchAttendance = async () => {
      let data = [];
      try {
        const res = await fetch('/api/attendance');
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }

      const localAttendance = (() => {
        try {
          const raw = localStorage.getItem('vbs-attendance');
          return raw && raw !== 'undefined' ? JSON.parse(raw) : [];
        } catch (err) {
          console.warn('Failed to parse cached attendance', err);
          return [];
        }
      })();

      const finalData = mergeTeacherData(
        data.length > 0 ? data : defaultTeachers,
        localAttendance
      );

      if (role === 'admin' || username) {
        setTeachers(finalData);
      } else {
        setTeachers([]);
      }
    };

    fetchAttendance();
  }, [username, role]);

  const toggleAttendance = (id) => {
    // For non-admin users, only allow editing their own attendance
    if (role !== 'admin') {
      const teacher = teachers.find(t => t.id === id);
      if (!teacher) return;
      
      const teacherDisplayName = getDisplayName(teacher);
      const cleanUser = normalizeName(username || '');
      const cleanTeacher = normalizeName(teacherDisplayName);
      
      if (teacherDisplayName !== username && cleanTeacher !== cleanUser) {
        alert("You can only mark your own attendance.");
        return;
      }
    }
    
    const updatedTeachers = teachers.map(teacher => {
      if (teacher.id === id) {
        const updatedTeacher = {
          ...teacher,
          attendance: {
            ...teacher.attendance,
            [selectedDay]: !teacher.attendance[selectedDay]
          }
        };
        return updatedTeacher;
      }
      return teacher;
    });
    
    setTeachers(updatedTeachers);
    // Save a temporary backup only when the server cannot be reached yet
    saveAttendanceBackup(updatedTeachers);
  };

  const saveAttendanceBackup = (attendanceData) => {
    localStorage.setItem('vbs-attendance', JSON.stringify(attendanceData));
  };

  const clearAttendanceBackup = () => {
    localStorage.removeItem('vbs-attendance');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teachers)
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      clearAttendanceBackup();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save", err);
      saveAttendanceBackup(teachers);
      alert("Failed to save attendance to the server. Progress was saved locally.");
    }
  };

  return (
    <div className="attendance-container fade-in">
      <div className="attendance-header glass-panel">
        <UserCheck size={40} color="#00d2ff" />
        <h2>Teachers Attendance</h2>
        <p>Select a day, then tap a teacher's name to toggle their status.</p>
        
        <div className="day-selector">
          {days.map(day => (
            <button 
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      {saveSuccess && (
        <div className="success-msg pop-in" style={{textAlign: "center", marginBottom: "2rem"}}>
          ✅ Attendance specifically saved for Day {selectedDay}!
        </div>
      )}

      <div className="teacher-grid">
        {teachers.map((teacher, index) => {
          const isPresent = teacher.attendance && teacher.attendance[selectedDay];
          const teacherDisplayName = getDisplayName(teacher);
          
          // Check if this teacher can be edited by current user
          let canEdit = true;
          if (role !== 'admin') {
            const cleanUser = normalizeName(username || '');
            const cleanTeacher = normalizeName(teacherDisplayName);
            canEdit = teacherDisplayName === username || cleanTeacher === cleanUser;
          }
          
          return (
            <button 
              key={teacher.id} 
              className={`teacher-button pop-in ${isPresent ? 'present' : 'absent'} ${!canEdit ? 'disabled' : ''}`}
              onClick={() => canEdit && toggleAttendance(teacher.id)}
              style={{ 
                animationDelay: `${(index % 10) * 0.05}s`,
                cursor: canEdit ? 'pointer' : 'not-allowed',
                opacity: canEdit ? 1 : 0.6
              }}
              disabled={!canEdit}
            >
              <span className="status-indicator"></span>
              <span className="teacher-name">{teacherDisplayName}</span>
              <span className="status-text">
                {isPresent ? `Present on ${selectedDay}` : `Absent on ${selectedDay}`}
                {!canEdit && ' (View Only)'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="attendance-actions">
        <button className="btn btn-primary save-btn" onClick={handleSave}>
          Save Attendance Report
        </button>
      </div>
    </div>
  );
};

export default Attendance;
