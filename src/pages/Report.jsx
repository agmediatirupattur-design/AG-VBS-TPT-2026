import React, { useState, useEffect, useCallback } from 'react';
import './Report.css';
import { Download, Users, UserCheck, Receipt, IndianRupee, RefreshCw, Save, Trash2 } from 'lucide-react';

const Report = () => {
  const [registrations, setRegistrations] = useState([]);
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    // Fetch registrations
    let normalizedData = [];
    try {
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        normalizedData = data.map(item => ({
          ...item,
          areaName: item.areaName || 'N/A',
          memberCount: item.memberCount || '0',
          inchargePerson: item.inchargePerson || 'N/A',
        })).filter(item => !(item.areaName === 'N/A' && item.memberCount === '0' && item.inchargePerson === 'N/A'));
      }
    } catch (err) {
      console.error("Failed to load correctly from server", err);
    }

    try {
      const localData = localStorage.getItem('vbs-registrations');
      if (localData && localData !== 'undefined') {
        const localRegistrations = JSON.parse(localData).map(item => ({
          ...item,
          areaName: item.areaName || 'N/A',
          memberCount: item.memberCount || '0',
          inchargePerson: item.inchargePerson || 'N/A',
        }));

        const merged = [...normalizedData];
        localRegistrations.forEach(localItem => {
          if (!merged.some(existing => existing.id === localItem.id)) {
            merged.push(localItem);
          }
        });
        setRegistrations(merged);
      } else {
        setRegistrations(normalizedData);
      }
    } catch (err) {
      console.warn("Failed to parse local registrations fallback", err);
      setRegistrations(normalizedData);
    }

    // Fetch teacher attendance
    let attendanceData = [];
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        attendanceData = await response.json();
      }
    } catch (err) {
      console.error("Failed to fetch teacher attendance data", err);
    }

    // Merge with localStorage data to ensure locally saved attendance is included
    try {
      const localAttendance = localStorage.getItem('vbs-attendance');
      if (localAttendance && localAttendance !== 'undefined') {
        const localData = JSON.parse(localAttendance);
        
        // Create a map of server data by id for quick lookup
        const serverMap = new Map(attendanceData.map(teacher => [teacher.id, teacher]));
        
        // Merge: prefer local data if it exists, otherwise use server data
        const merged = localData.map(localTeacher => {
          const serverTeacher = serverMap.get(localTeacher.id);
          if (serverTeacher) {
            // Merge attendance: local takes precedence for each day
            return {
              ...serverTeacher,
              attendance: {
                ...serverTeacher.attendance,
                ...localTeacher.attendance
              }
            };
          }
          return localTeacher;
        });
        
        // Add any server-only teachers that aren't in localStorage
        attendanceData.forEach(serverTeacher => {
          if (!localData.some(local => local.id === serverTeacher.id)) {
            merged.push(serverTeacher);
          }
        });
        
        attendanceData = merged;
      }
    } catch (err) {
      console.warn("Issue parsing cached attendance for merge", err);
    }

    setTeacherAttendance(attendanceData);

    // Fetch student attendance
    try {
      const response = await fetch('/api/student-attendance');
      if (response.ok) setStudentAttendance(await response.json());
    } catch (err) {
      console.error("Failed to fetch student attendance data", err);
    }

    // Fetch expenses
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) setExpenses(await response.json());
    } catch (err) {
      console.error("Failed to fetch expenses data", err);
    }
    
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleDeleteRegistration = async (id) => {
    if (window.confirm("Are you sure you want to delete this group registration? This action cannot be undone.")) {
      try {
        await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Error communicating with server for deletion", err);
      }
      
      // Update local React state reliably regardless of Server API result (handles offline/cached items)
      const updatedRegistrations = registrations.filter(reg => String(reg.id || reg._id) !== String(id));
      setRegistrations(updatedRegistrations);

      // Verify and remove from local storage if it was stored locally
      const localData = localStorage.getItem('vbs-registrations');
      if (localData) {
        const parsed = JSON.parse(localData);
        const filteredLocals = parsed.filter(reg => String(reg.id || reg._id) !== String(id));
        localStorage.setItem('vbs-registrations', JSON.stringify(filteredLocals));
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      try {
        await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Error communicating with server for deletion", err);
      }
      setExpenses(expenses.filter(exp => String(exp.id || exp._id) !== String(id)));
    }
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return alert("No data");
    const headers = ["ID", "Area Name", "Member Count", "Incharge Person", "Date Submitted"];
    const rows = registrations.map(reg => [
      reg.id, `"${reg.areaName}"`, reg.memberCount, `"${reg.inchargePerson}"`, reg.dateSubmitted
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "vbs-2026-group-registrations.csv"; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  const downloadTeachersCSV = () => {
    if (teacherAttendance.length === 0) return alert("No data");
    const headers = ["Teacher Name", "Day 27", "Day 28", "Day 29", "Day 30", "Total Days Present"];
    const rows = teacherAttendance.map(teacher => {
      const att = teacher.attendance || {};
      const present27 = att["27"] ? "Present" : "Absent";
      const present28 = att["28"] ? "Present" : "Absent";
      const present29 = att["29"] ? "Present" : "Absent";
      const present30 = att["30"] ? "Present" : "Absent";
      const teacherName = teacher.name || teacher.teacherName || 'Unknown Teacher';
      const total = (att["27"] ? 1 : 0) + (att["28"] ? 1 : 0) + (att["29"] ? 1 : 0) + (att["30"] ? 1 : 0);
      return [`"${teacherName}"`, present27, present28, present29, present30, total];
    });
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "vbs-2026-teachers-attendance.csv"; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  const downloadStudentAttendanceCSV = () => {
    if (studentAttendance.length === 0) return alert("No data");
    const headers = ["Student Name", "Teacher", "Day 27", "Day 28", "Day 29", "Day 30", "Total Days Present"];
    const rows = studentAttendance.map(student => {
      const att = student.attendance || {};
      const present27 = att["27"] ? "Present" : "Absent";
      const present28 = att["28"] ? "Present" : "Absent";
      const present29 = att["29"] ? "Present" : "Absent";
      const present30 = att["30"] ? "Present" : "Absent";
      const total = (att["27"] ? 1 : 0) + (att["28"] ? 1 : 0) + (att["29"] ? 1 : 0) + (att["30"] ? 1 : 0);
      return [`"${student.studentName}"`, `"${student.teacherName}"`, present27, present28, present29, present30, total];
    });
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "vbs-2026-student-attendance.csv"; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  const downloadExpensesCSV = () => {
    if (expenses.length === 0) return alert("No data");
    const headers = ["Date", "Bill Name", "Purchased By", "Amount"];
    const rows = expenses.map(exp => [
      exp.date, `"${exp.billName}"`, `"${exp.purchasedBy}"`, exp.amount
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "vbs-2026-expenses.csv"; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="report-container fade-in">
      {/* Registrations */}
      <div className="report-header">
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}><Users size={32} color="var(--primary-color)"/> Group Registrations</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn btn-secondary" onClick={() => { loadData(); setTimeout(() => alert('Data Refreshed!'), 500); }} disabled={isRefreshing}>
            <RefreshCw size={20} className={isRefreshing ? "spinning" : ""} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button className="btn btn-secondary download-btn" onClick={downloadCSV}>
            <Download size={20} />
            Download Forms CSV
          </button>
        </div>
      </div>

      <div className="table-responsive glass-panel" style={{marginBottom: '4rem'}}>
        <table className="report-table">
          <thead>
            <tr><th>Area Name</th><th>Member Count</th><th>Incharge Person</th><th>Date</th><th style={{textAlign: "center"}}>Action</th></tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (<tr><td colSpan="5" className="empty-state">No group registrations yet.</td></tr>) : (
              registrations.map(reg => (
                <tr key={reg.id || reg._id}>
                  <td>{reg.areaName}</td>
                  <td>{reg.memberCount}</td>
                  <td>{reg.inchargePerson}</td>
                  <td>{reg.dateSubmitted}</td>
                  <td style={{textAlign: "center"}}>
                    <button 
                      onClick={() => handleDeleteRegistration(reg._id || reg.id)} 
                      className="btn" 
                      style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem'}}
                      title="Delete Registration"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>

      {/* Teachers Attendance */}
      <div className="report-header">
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}><UserCheck size={32} color="var(--primary-color)"/> Teachers Attendance</h2>
        <button className="btn btn-secondary download-btn" onClick={downloadTeachersCSV}>
          <Download size={20} />
          Download Attendance CSV
        </button>
      </div>

      <div className="table-responsive glass-panel" style={{marginBottom: '4rem'}}>
        <table className="report-table">
          <thead>
            <tr><th>Teacher Name</th><th>Day 27</th><th>Day 28</th><th>Day 29</th><th>Day 30</th><th>Total Days</th></tr>
          </thead>
          <tbody>
            {teacherAttendance.length === 0 ? (<tr><td colSpan="6" className="empty-state">No attendance data.</td></tr>) : (
              teacherAttendance.map(teacher => {
                const att = teacher.attendance || {};
                const total = (att["27"] ? 1 : 0) + (att["28"] ? 1 : 0) + (att["29"] ? 1 : 0) + (att["30"] ? 1 : 0);
                return (
                  <tr key={teacher.id}>
                    <td style={{fontWeight: '600'}}>{teacher.name}</td>
                    <td>{att["27"] ? "✅" : "❌"}</td>
                    <td>{att["28"] ? "✅" : "❌"}</td>
                    <td>{att["29"] ? "✅" : "❌"}</td>
                    <td>{att["30"] ? "✅" : "❌"}</td>
                    <td style={{fontWeight: 'bold', color: total === 4 ? '#10b981' : (total > 0 ? '#f59e0b' : '#ef4444')}}>{total} / 4</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Student Attendance Section */}
      <div className="report-header">
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}><UserCheck size={32} color="var(--primary-color)"/> Student Attendance</h2>
        <button className="btn btn-secondary download-btn" onClick={downloadStudentAttendanceCSV}>
          <Download size={20} />
          Download Attendance CSV
        </button>
      </div>

      <div className="table-responsive glass-panel">
        <table className="report-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Teacher</th>
              <th>Day 27</th>
              <th>Day 28</th>
              <th>Day 29</th>
              <th>Day 30</th>
              <th>Total Days</th>
            </tr>
          </thead>
          <tbody>
            {studentAttendance.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No attendance data.</td></tr>
            ) : (
              studentAttendance.map(student => {
                const att = student.attendance || {};
                const total = (att["27"] ? 1 : 0) + (att["28"] ? 1 : 0) + (att["29"] ? 1 : 0) + (att["30"] ? 1 : 0);
                return (
                  <tr key={student.id}>
                    <td style={{fontWeight: '600'}}>{student.studentName}</td>
                    <td style={{opacity: 0.8, fontSize: '0.9rem'}}>{student.teacherName || student.name || 'Not Assigned'}</td>
                    <td>{att["27"] ? "✅" : "❌"}</td>
                    <td>{att["28"] ? "✅" : "❌"}</td>
                    <td>{att["29"] ? "✅" : "❌"}</td>
                    <td>{att["30"] ? "✅" : "❌"}</td>
                    <td style={{fontWeight: 'bold', color: total === 4 ? '#10b981' : (total > 0 ? '#f59e0b' : '#ef4444')}}>
                      {total} / 4
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expenses Section */}
      <div className="report-header">
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
          <Receipt size={32} color="var(--primary-color)"/> Expenses Report
        </h2>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div className="total-expenses-badge">
            <IndianRupee size={20} />
            <span>Total: ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <button className="btn btn-secondary download-btn" onClick={downloadExpensesCSV}>
            <Download size={20} />
            Download Expenses CSV
          </button>
        </div>
      </div>

      <div className="table-responsive glass-panel">
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bill Name</th>
              <th>Purchased By</th>
              <th>Amount</th>
              <th style={{textAlign: 'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan="5" className="empty-state">No expenses recorded yet.</td></tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id || idx}>
                  <td>{exp.date}</td>
                  <td style={{fontWeight: '600', color: 'var(--text-light)'}}>{exp.billName}</td>
                  <td>{exp.purchasedBy}</td>
                  <td className="amount-col">₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{textAlign: "center"}}>
                    <button 
                      onClick={() => handleDeleteExpense(exp._id || exp.id)} 
                      className="btn" 
                      style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem'}}
                      title="Delete Expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="4" style={{fontWeight: '700', textAlign: 'right', padding: '1rem 1rem 1rem 0'}}>
                  Total Expenses
                </td>
                <td className="amount-col" style={{padding: '1rem'}}>
                  ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

    </div>
  );
};

export default Report;
