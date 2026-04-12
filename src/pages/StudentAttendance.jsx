import React, { useState, useEffect, useContext } from 'react';
import './Attendance.css';
import { UserCheck, Plus, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StudentAttendance = () => {
  const { username, role } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedDay, setSelectedDay] = useState("27");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const days = ["27", "28", "29", "30"];

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('/api/student-attendance');
        if (res.ok) {
          const data = await res.json();
          // Filter students based on role
          if (role === 'admin') {
            setStudents(data);
          } else {
            setStudents(data.filter(s => s.teacherName === username));
          }
        }
      } catch (err) {
        console.error("Failed to fetch student attendance", err);
      }
    };
    fetchAttendance();
  }, [username, role]);

  const toggleAttendance = (id) => {
    setStudents(students.map(student => {
      if (student.id === id) {
        return {
          ...student,
          attendance: {
            ...student.attendance,
            [selectedDay]: !student.attendance[selectedDay]
          }
        };
      }
      return student;
    }));
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent = {
      id: Date.now().toString(),
      studentName: newStudentName.trim(),
      teacherName: role === 'admin' ? 'admin' : (username || 'unknown'),
      attendance: { "27": false, "28": false, "29": false, "30": false }
    };
    setStudents([...students, newStudent]);
    setNewStudentName('');
  };

  const handleSave = async () => {
    try {
      await fetch('/api/student-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students) // Merge only modified/added students
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save student attendance");
    }
  };

  return (
    <div className="attendance-container fade-in">
      <div className="attendance-header glass-panel">
        <UserCheck size={40} color="#00d2ff" />
        <h2>{role === 'admin' ? "All Students Attendance" : "My Students' Attendance"}</h2>
        <p>Select a day, then tap a student's name to toggle their status.</p>
        
        {role !== 'admin' && (
          <div className="add-student-section fade-in">
            <input 
              type="text" 
              placeholder="Enter student name..." 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="add-student-input"
            />
            <button className="btn btn-primary add-student-btn" onClick={handleAddStudent}>
              <Plus size={18} /> Add
            </button>
          </div>
        )}

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
          ✅ Student Attendance saved successfully!
        </div>
      )}

      {students.length === 0 ? (
        <div className="empty-students glass-panel">
          <Users size={32} />
          <p>No students found. Add a student to start tracking attendance!</p>
        </div>
      ) : (
        <div className="teacher-grid">
          {students.map((student, idx) => {
            const isPresent = student.attendance && student.attendance[selectedDay];
            return (
              <button 
                key={student.id} 
                className={`teacher-button pop-in ${isPresent ? 'present' : 'absent'}`}
                onClick={() => toggleAttendance(student.id)}
                style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
              >
                <span className="status-indicator"></span>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                  <span className="teacher-name">{student.studentName}</span>
                  {role === 'admin' && <span className="teacher-badge" style={{fontSize: '0.7rem', opacity: 0.7}}>By: {student.teacherName}</span>}
                </div>
                <span className="status-text">{isPresent ? `Present on ${selectedDay}` : `Absent on ${selectedDay}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {students.length > 0 && (
        <div className="attendance-actions">
          <button className="btn btn-primary save-btn" onClick={handleSave}>
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
