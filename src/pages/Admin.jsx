import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Receipt, Calendar, TrendingUp, Settings, Save } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalExpenses: 0
  });

  const [adminSettings, setAdminSettings] = useState({
    eventName: '',
    startDate: '',
    endDate: '',
    contactEmail: '',
    theme: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch registrations
      let registrations = [];
      try {
        const regRes = await fetch('/api/registrations');
        registrations = regRes.ok ? await regRes.json() : [];
      } catch {
        registrations = [];
      }

      if (!registrations.length) {
        const localData = localStorage.getItem('vbs-registrations');
        if (localData) {
          registrations = JSON.parse(localData);
        }
      }

      // Fetch teacher attendance
      let teachers = [];
      try {
        const teacherRes = await fetch('/api/attendance');
        teachers = teacherRes.ok ? await teacherRes.json() : [];
      } catch {
        teachers = [];
      }

      const cachedAttendance = localStorage.getItem('vbs-attendance');
      if (cachedAttendance) {
        const localTeachers = JSON.parse(cachedAttendance);
        const merged = teachers.map(teacher => {
          const localTeacher = localTeachers.find(item => item.id === teacher.id);
          return localTeacher ? { ...teacher, ...localTeacher } : teacher;
        });
        localTeachers.forEach(localTeacher => {
          if (!merged.some(item => item.id === localTeacher.id)) {
            merged.push(localTeacher);
          }
        });
        teachers = merged;
      }

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

  const fetchAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const settings = await response.json();
        setAdminSettings(settings);
      }
    } catch (err) {
      console.error('Failed to fetch admin settings', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdminSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminSettings),
      });
      
      if (response.ok) {
        alert('Admin settings saved successfully!');
        setIsEditing(false);
      } else {
        alert('Failed to save admin settings');
      }
    } catch (err) {
      console.error('Error saving admin settings', err);
      alert('Error saving admin settings');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header glass-panel">
        <TrendingUp size={40} color="var(--primary-color)" />
        <h2>Admin Dashboard</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={fetchStats}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            🔄 Refresh Data
          </button>
          <p>Overview of VBS 2026 activities and statistics</p>
        </div>
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

      <div className="admin-settings glass-panel slide-up-5">
        <div className="settings-header">
          <Settings size={24} color="var(--primary-color)" />
          <h3>Admin Settings</h3>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Settings'}
          </button>
        </div>

        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="eventName">Event Name:</label>
            <input
              id="eventName"
              type="text"
              name="eventName"
              value={adminSettings.eventName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="VBS 2026"
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={adminSettings.startDate}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={adminSettings.endDate}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email:</label>
            <input
              id="contactEmail"
              type="email"
              name="contactEmail"
              value={adminSettings.contactEmail}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="theme">Theme:</label>
            <input
              id="theme"
              type="text"
              name="theme"
              value={adminSettings.theme}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Faith & Fun"
            />
          </div>

          {isEditing && (
            <button className="save-btn" onClick={handleSaveSettings}>
              <Save size={16} />
              Save Settings
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default Admin;