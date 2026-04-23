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
      
      // Fallback: Load default teachers if no data from API or localStorage
      if (finalData.length === 0) {
        finalData = [
          { id: 1, name: "Sis. Gethsiyal", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 2, name: "Sharmila", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 3, name: "Sis. Gracepriya", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 4, name: "Sis. Archana", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 5, name: "Sis. Esther", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 6, name: "Jecitha", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 7, name: "Sofia", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 8, name: "Keerthana", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 9, name: "Sis. Jamuna", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 10, name: "Sis. Lakshmi", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 11, name: "Priya Angel", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 12, name: "Preethi", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 13, name: "Sis. Megala", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 14, name: "Sis. Puspalatha", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 15, name: "Sis. Priyadarshini", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 16, name: "Pr. Yuvashri", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 17, name: "Jessica", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 18, name: "Kishori", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 19, name: "Shekina", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 20, name: "Sis. Shamili", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 21, name: "Sis. Nithya", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 22, name: "Sis. Amutha Jose", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 23, name: "Bro. Lambert", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 24, name: "Sis. Dharani", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 25, name: "Sis. Remi", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 26, name: "Sis. Vennila", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 27, name: "Sis. Rajmary", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 28, name: "Bro. Vasudevan", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 29, name: "Hari", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 30, name: "Jeba", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 31, name: "Yessaiya", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 32, name: "Vignesh", attendance: { "27": false, "28": false, "29": false, "30": false } },
          { id: 33, name: "Chandra Mohan", attendance: { "27": false, "28": false, "29": false, "30": false } }
        ];
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
        {teachers.map((teacher, index) => {
          const isPresent = teacher.attendance && teacher.attendance[selectedDay];
          return (
            <button 
              key={teacher.id} 
              className={`teacher-button pop-in ${isPresent ? 'present' : 'absent'}`}
              onClick={() => toggleAttendance(teacher.id)}
              style={{ animationDelay: `${(index % 10) * 0.05}s` }}
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
