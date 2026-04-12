import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Receipt, Calendar, TrendingUp } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalExpenses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch registrations
        const regRes = await fetch('/api/registrations');
        const registrations = regRes.ok ? await regRes.json() : [];

        // Fetch teacher attendance
        const teacherRes = await fetch('/api/attendance');
        const teachers = teacherRes.ok ? await teacherRes.json() : [];

        // Fetch student attendance
        const studentRes = await fetch('/api/student-attendance');
        const students = studentRes.ok ? await studentRes.json() : [];

        // Fetch expenses
        const expenseRes = await fetch('/api/expenses');
        const expenses = expenseRes.ok ? await expenseRes.json() : [];
        const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

        setStats({
          totalRegistrations: registrations.length,
          totalTeachers: teachers.length,
          totalStudents: students.length,
          totalExpenses: totalExpenses
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-container fade-in">
      <div className="admin-header glass-panel">
        <TrendingUp size={40} color="var(--primary-color)" />
        <h2>Admin Dashboard</h2>
        <p>Overview of VBS 2026 activities and statistics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel slide-up-1">
          <Users size={32} color="var(--accent-color)" />
          <div className="stat-info">
            <h3>{stats.totalRegistrations}</h3>
            <p>Total Registrations</p>
          </div>
        </div>

        <div className="stat-card glass-panel slide-up-2">
          <UserCheck size={32} color="var(--success-color)" />
          <div className="stat-info">
            <h3>{stats.totalTeachers}</h3>
            <p>Teachers</p>
          </div>
        </div>

        <div className="stat-card glass-panel slide-up-3">
          <Calendar size={32} color="var(--warning-color)" />
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Students</p>
          </div>
        </div>

        <div className="stat-card glass-panel slide-up-4">
          <Receipt size={32} color="var(--error-color)" />
          <div className="stat-info">
            <h3>₹{stats.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Admin;