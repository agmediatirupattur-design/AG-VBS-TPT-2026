import React, { useState, useEffect, useContext } from 'react';
import './Attendance.css';
import { UserCheck, Plus, Users, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StudentAttendance = () => {
  const { username, role } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedDay, setSelectedDay] = useState("27");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  const dataEntryUsers = ["hari", "jeba", "yessaiya", "vignesh", "chandra mohan"];
  const canAllocate = role === 'admin' || dataEntryUsers.includes(username?.toLowerCase()?.trim() || "");
  
  const days = ["27", "28", "29", "30"];

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('/api/student-attendance');
        if (res.ok) {
          const data = await res.json();
          // Filter students based on role
          const normalizeName = (name = '') =>
          name.toLowerCase().trim().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();

          if (canAllocate) {
            setStudents(data);
          } else {
            const isTeacherMatch = (storedName, currentName) => {
              const stored = normalizeName(storedName);
              const current = normalizeName(currentName);
              const storedFirst = stored.split(' ')[0];
              const currentFirst = current.split(' ')[0];
              return (
                stored === current ||
                stored.includes(current) ||
                current.includes(stored) ||
                storedFirst === currentFirst
              );
            };
            setStudents(data.filter(s => isTeacherMatch(s.teacherName, username)));
          }
        }
      } catch (err) {
        console.error("Failed to fetch student attendance", err);
      }

      if (canAllocate) {
        try {
          const tRes = await fetch('/api/attendance');
          if (tRes.ok) {
            const tData = await tRes.json();
            tData.sort((a,b) => a.name.localeCompare(b.name));
            const filteredTeachers = tData.filter(t => {
              const name = t.name.toLowerCase().trim();
              return !dataEntryUsers.includes(name) && name !== 'admin';
            });
            setTeachersList(filteredTeachers);
          }
        } catch (err) {
          console.error("Failed to fetch teachers", err);
        }
      }
    };
    fetchAttendance();
  }, [username, role, canAllocate]);

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

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) return;
    if (canAllocate && !selectedTeacher) {
      alert("Please select a teacher to allocate this student to.");
      return;
    }
    const newStudent = {
      id: Date.now().toString(),
      studentName: newStudentName.trim(),
      teacherName: canAllocate ? selectedTeacher : (username || 'unknown'),
      addedBy: canAllocate ? username : undefined,
      attendance: { "27": false, "28": false, "29": false, "30": false }
    };
    const newStudentsArray = [...students, newStudent];
    setStudents(newStudentsArray);
    setNewStudentName('');

    // Auto-save just this new student to backend instantly
    try {
      await fetch('/api/student-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([newStudent]) // Send just the new student to upsert
      });
    } catch(err) {
      console.error("Auto-save failed", err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/student-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students) // Merge only modified/added students
      });

      if (!response.ok) {
        throw new Error('Failed to save student attendance');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save student attendance");
    }
  };

  const handleDeleteStudent = async (e, id) => {
    e.stopPropagation(); // prevent toggling attendance
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    
    try {
      // First try to delete from the backend
      const response = await fetch(`/api/student-attendance/${id}`, {
        method: 'DELETE'
      });
      
      // Whether it succeeds or 404s, remove from UI
      setStudents(students.filter(student => student.id !== id));
      
      if (!response.ok && response.status !== 404) {
        console.warn('Student was removed locally but might not have been on server');
      }
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete student. They might have been removed locally only.");
      setStudents(students.filter(student => student.id !== id));
    }
  };


  return (
    <div className="attendance-container fade-in">
      <div className="attendance-header glass-panel">
        <UserCheck size={40} color="#00d2ff" />
        <h2>{canAllocate ? "Student Allocation & Attendance" : `My Students' Attendance - ${username ? (username.charAt(0).toUpperCase() + username.slice(1)) : 'Teacher'}`}</h2>
        <p>Select a day, then tap a student's name to toggle their status.</p>
        
        <div className="add-student-section fade-in" style={{flexWrap: 'wrap', gap: '10px', justifyContent: 'center'}}>
          <input 
            type="text" 
            placeholder="Enter student name..." 
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="add-student-input"
            style={{flex: canAllocate ? '1 1 200px' : '1'}}
          />
          {canAllocate && (
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.8rem', color: '#00d2ff', fontWeight: 'bold' }}>Assign to Teacher:</span>
              <select 
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                style={{
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: '#fff', 
                  color: '#000', 
                  border: '2px solid #00d2ff',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                <option value="">-- Choose Teacher --</option>
                {teachersList.map(t => (
                  <option key={t.id || t._id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <button className="btn btn-primary add-student-btn" onClick={handleAddStudent}>
            <Plus size={18} /> Add
          </button>
        </div>

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
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1}}>
                  <span className="teacher-name">{student.studentName}</span>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px'}}>
                    <span className="teacher-badge" style={{fontSize: '0.7rem', opacity: 0.85}}>🧑‍🏫 Teacher: {student.teacherName || 'Not Assigned'}</span>
                    {canAllocate && student.addedBy && <span className="teacher-badge" style={{fontSize: '0.65rem', opacity: 0.6, color: '#00d2ff'}}>✍️ Entered by: {student.addedBy}</span>}
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px'}}>
                  <button 
                    className="delete-student-btn" 
                    onClick={(e) => handleDeleteStudent(e, student.id)}
                    title="Remove Student"
                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="status-text">{isPresent ? `Present on ${selectedDay}` : `Absent on ${selectedDay}`}</span>
                </div>
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
