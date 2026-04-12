import React, { useState, useEffect } from 'react';
import './Report.css';
import { Download, Users, UserCheck, Receipt, IndianRupee } from 'lucide-react';

const Report = () => {
  const [registrations, setRegistrations] = useState([]);
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/registrations');
        if (response.ok) {
          const data = await response.json();
          const normalizedData = data.map(item => ({
            ...item,
            areaName: item.areaName || 'N/A',
            memberCount: item.memberCount || '0',
            inchargePerson: item.inchargePerson || 'N/A',
          }));
          setRegistrations(normalizedData);
        }
      } catch (err) {
        console.error("Failed to load correctly from server", err);
      }
    };
    
    const fetchTeacherAttendance = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (response.ok) setTeacherAttendance(await response.json());
      } catch (err) {
        console.error("Failed to fetch teacher attendance data", err);
      }
    };

    const fetchStudentAttendance = async () => {
      try {
        const response = await fetch('/api/student-attendance');
        if (response.ok) setStudentAttendance(await response.json());
      } catch (err) {
        console.error("Failed to fetch student attendance data", err);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) setExpenses(await response.json());
      } catch (err) {
        console.error("Failed to fetch expenses data", err);
      }
    };

    fetchData();
    fetchTeacherAttendance();
    fetchStudentAttendance();
    fetchExpenses();
  }, []);

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
      const total = (att["27"] ? 1 : 0) + (att["28"] ? 1 : 0) + (att["29"] ? 1 : 0) + (att["30"] ? 1 : 0);
      return [`"${teacher.name}"`, present27, present28, present29, present30, total];
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
        <button className="btn btn-secondary download-btn" onClick={downloadCSV}>
          <Download size={20} />
          Download Forms CSV
        </button>
      </div>

      <div className="table-responsive glass-panel" style={{marginBottom: '4rem'}}>
        <table className="report-table">
          <thead>
            <tr><th>Area Name</th><th>Member Count</th><th>Incharge Person</th><th>Date</th></tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (<tr><td colSpan="4" className="empty-state">No group registrations yet.</td></tr>) : (
              registrations.map(reg => (
                <tr key={reg.id}><td>{reg.areaName}</td><td>{reg.memberCount}</td><td>{reg.inchargePerson}</td><td>{reg.dateSubmitted}</td></tr>
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
                    <td style={{opacity: 0.8, fontSize: '0.9rem'}}>{student.teacherName}</td>
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
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan="4" className="empty-state">No expenses recorded yet.</td></tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id || idx}>
                  <td>{exp.date}</td>
                  <td style={{fontWeight: '600', color: 'var(--text-light)'}}>{exp.billName}</td>
                  <td>{exp.purchasedBy}</td>
                  <td className="amount-col">₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="3" style={{fontWeight: '700', textAlign: 'right', padding: '1rem 1rem 1rem 0'}}>
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
