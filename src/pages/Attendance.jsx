import React, { useState, useEffect, useContext } from 'react';
import './Attendance.css';
import { UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Attendance = () => {
  const { username, role } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [selectedDay, setSelectedDay] = useState("27");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const days = ["27", "28", "29", "30"];

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

      // Removed problematic localStorage merge loop that might break data
      let finalData = data.length > 0 ? data : [];
      if (finalData.length === 0) {
        const cachedAttendance = localStorage.getItem('vbs-attendance');
        if (cachedAttendance) {
          finalData = JSON.parse(cachedAttendance);
        }
      }
      
      if (role === 'admin') {
        setTeachers(finalData);
      } else if (username) {
        // Filter by name so teachers only see themselves
        const cleanUser = username.toLowerCase().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
        const matchedTeachers = finalData.filter(teacher => {
          const cleanTeacher = teacher.name.toLowerCase().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
          return (
            teacher.name === username ||
            cleanTeacher === cleanUser ||
            cleanTeacher.includes(cleanUser) || 
            cleanUser.includes(cleanTeacher)
          );
        });
        setTeachers(matchedTeachers);
      } else {
        setTeachers([]);
      }
    };
    
    fetchAttendance();
  }, [username, role]);

  const toggleAttendance = (id) => {
    setTeachers(teachers.map(teacher => {
      if (teacher.id === id) {
        return {
          ...teacher,
          attendance: {
            ...teacher.attendance,
            [selectedDay]: !teacher.attendance[selectedDay]
          }
        };
      }
      return teacher;
    }));
  };

  const saveAttendanceLocally = (attendanceData) => {
    localStorage.setItem('vbs-attendance', JSON.stringify(attendanceData));
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

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save", err);
      saveAttendanceLocally(teachers);
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
        {teachers.map((teacher) => {
          const isPresent = teacher.attendance && teacher.attendance[selectedDay];
          return (
            <button 
              key={teacher.id} 
              className={`teacher-button pop-in ${isPresent ? 'present' : 'absent'}`}
              onClick={() => toggleAttendance(teacher.id)}
              style={{ animationDelay: `${teacher.id * 0.05}s` }}
            >
              <span className="status-indicator"></span>
              <span className="teacher-name">{teacher.name}</span>
              <span className="status-text">{isPresent ? `Present on ${selectedDay}` : `Absent on ${selectedDay}`}</span>
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
