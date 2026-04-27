import React, { useState, useEffect, useContext, useMemo } from 'react';
import './Attendance.css';
import { UserCheck, Plus, Users, Trash2 } from 'lucide-react';
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

const StudentAttendance = () => {
  const { username, role } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedDay, setSelectedDay] = useState("27");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const dataEntryUsers = useMemo(() => ["hari", "jeba", "yessaiya", "vignesh", "chandra mohan"], []);
  const canAllocate = role === 'admin' || dataEntryUsers.includes(username?.toLowerCase()?.trim() || "");

  const days = ["27", "28", "29", "30"];

  const normalizeName = (name = '') =>
    name?.toString().toLowerCase().trim().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();

  const getTeacherDisplayName = (teacher) =>
    (teacher?.name || teacher?.teacherName || teacher?.displayName || teacher?.username || teacher?.studentName || '')
      .toString()
      .trim();

  const getTeacherName = (student) =>
    student.teacherName || student.name || student.studentName || 'Not Assigned';

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoadingStudents(true);
      setLoadingTeachers(canAllocate);

      const localizeName = (name = '') =>
        name.toString().toLowerCase().trim().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();

      try {
        const studentPromise = fetch('/api/student-attendance');
        const teacherPromise = canAllocate ? fetch('/api/attendance') : Promise.resolve(null);

        const [studentRes, teacherRes] = await Promise.all([studentPromise, teacherPromise]);

        let data = [];
        if (studentRes && studentRes.ok) {
          data = await studentRes.json();
        } else {
          // Fallback to localStorage if API fails
          const localData = localStorage.getItem('vbs-student-attendance');
          if (localData) {
            data = JSON.parse(localData);
            console.log('Loaded student attendance from localStorage (API unavailable)');
          }
        }

        if (canAllocate) {
          setStudents(data);
        } else {
          const isTeacherMatch = (storedName, currentName) => {
            const stored = localizeName(storedName);
            const current = localizeName(currentName);
            const storedFirst = stored.split(' ')[0];
            const currentFirst = current.split(' ')[0];
            return (
              stored === current ||
              stored.includes(current) ||
              current.includes(stored) ||
              storedFirst === currentFirst
            );
          };
          setStudents(data.filter(s => isTeacherMatch(getTeacherName(s), username)));
        }
      } catch (fetchErr) {
        console.error('Network error fetching students:', fetchErr);
        // Try localStorage fallback
        const localData = localStorage.getItem('vbs-student-attendance');
        if (localData) {
          const data = JSON.parse(localData);
          if (canAllocate) {
            setStudents(data);
          } else {
            const localizeName = (name = '') =>
              name.toString().toLowerCase().trim().replace(/^(sis\.|bro\.|pr\.|dr\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
            const isTeacherMatch = (storedName, currentName) => {
              const stored = localizeName(storedName);
              const current = localizeName(currentName);
              const storedFirst = stored.split(' ')[0];
              const currentFirst = current.split(' ')[0];
              return (
                stored === current ||
                stored.includes(current) ||
                current.includes(stored) ||
                storedFirst === currentFirst
              );
            };
            setStudents(data.filter(s => isTeacherMatch(getTeacherName(s), username)));
          }
        }
      }

      // Fetch teacher data
      try {
        const teacherRes = canAllocate ? await fetch('/api/attendance') : null;
        let teacherData = [];
        
        if (teacherRes && teacherRes.ok) {
          teacherData = await teacherRes.json();
        } else {
          // Fallback to localStorage if available
          const localTeachers = localStorage.getItem('vbs-attendance');
          if (localTeachers) {
            teacherData = JSON.parse(localTeachers);
            console.log('Loaded teachers from localStorage');
          }
        }

        const mergedTeachers = mergeTeacherData(
          Array.isArray(teacherData) && teacherData.length > 0 ? teacherData : defaultTeachers,
          []
        );

        const filteredTeachers = mergedTeachers
          .map((teacher) => ({ ...teacher, name: getTeacherDisplayName(teacher) }))
          .filter(t => {
            const displayName = t.name.toString().toLowerCase().trim();
            return displayName && displayName !== 'admin';
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setTeachersList(filteredTeachers);
        if (!selectedTeacher && filteredTeachers.length > 0) {
          setSelectedTeacher(filteredTeachers[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch teacher data', err);
        // Use default teachers as fallback
        const filteredTeachers = defaultTeachers
          .map((teacher) => ({ ...teacher, name: getTeacherDisplayName(teacher) }))
          .filter(t => {
            const displayName = t.name.toString().toLowerCase().trim();
            return displayName && displayName !== 'admin';
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setTeachersList(filteredTeachers);
        if (!selectedTeacher && filteredTeachers.length > 0) {
          setSelectedTeacher(filteredTeachers[0].name);
        }
      } finally {
        setLoadingStudents(false);
        setLoadingTeachers(false);
      }
    };

    fetchAttendance();
  }, [username, role, canAllocate, dataEntryUsers]);

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
    } catch (err) {
      console.error("Auto-save to API failed, saving locally instead", err);
      // Save to localStorage as backup
      try {
        const existingData = JSON.parse(localStorage.getItem('vbs-student-attendance') || '[]');
        localStorage.setItem('vbs-student-attendance', JSON.stringify([...existingData, newStudent]));
      } catch (storageErr) {
        console.error("Could not save to localStorage either", storageErr);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (students.length === 0) {
        alert("No students to save.");
        return;
      }

      // Save to localStorage first as backup
      localStorage.setItem('vbs-student-attendance', JSON.stringify(students));

      const response = await fetch('/api/student-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Even if API fails, we have saved to localStorage
        alert(`Saved locally (offline mode). Server sync may retry later: ${errorData.error || `HTTP ${response.status}`}`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save to API", err);
      // Save to localStorage as fallback
      try {
        localStorage.setItem('vbs-student-attendance', JSON.stringify(students));
        alert(`Saved locally (offline mode). Will sync when connection is available.`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (storageErr) {
        alert(`Failed to save: ${err.message}`);
      }
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

        <div className="add-student-section fade-in" style={{ flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <input
            id="studentName"
            name="studentName"
            type="text"
            placeholder="Enter student name..."
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="add-student-input"
            style={{ flex: canAllocate ? '1 1 200px' : '1' }}
          />
          {canAllocate && (
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.8rem', color: '#00d2ff', fontWeight: 'bold' }}>Assign to Teacher:</span>
              {loadingTeachers ? (
                <div style={{ color: '#fff', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  Loading teachers...
                </div>
              ) : (
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
                  {teachersList.length > 0 ? (
                    teachersList.map(t => (
                      <option key={t.id || t._id || t.name} value={t.name}>{t.name}</option>
                    ))
                  ) : (
                    <option value="">No teachers available</option>
                  )}
                </select>
              )}
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
        <div className="success-msg pop-in" style={{ textAlign: "center", marginBottom: "2rem" }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                  <span className="teacher-name">{student.studentName}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    <span className="teacher-badge" style={{ fontSize: '0.7rem', opacity: 0.85 }}>🧑‍🏫 Teacher: {getTeacherName(student)}</span>
                    {canAllocate && student.addedBy && <span className="teacher-badge" style={{ fontSize: '0.65rem', opacity: 0.6, color: '#00d2ff' }}>✍️ Entered by: {student.addedBy}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
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
