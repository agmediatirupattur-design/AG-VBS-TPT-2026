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
      try {
        const res = await fetch('/api/attendance');
        if (res.ok) {
          const data = await res.json();
          if (role === 'admin') {
            setTeachers(data);
          } else if (username) {
            setTeachers(data.filter(t => t.name.toLowerCase().includes(username.toLowerCase())));
          } else {
            setTeachers([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch attendance", err);
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

  const handleSave = async () => {
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teachers)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save attendance");
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
