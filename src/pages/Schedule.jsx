import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Schedule.css';

const defaultDays = [
  {
    day: "Day 1",
    title: "Welcome & Introduction",
    time: "8:00 AM - 12:00 PM",
    desc: "Kick off the amazing VBS 2026! We will meet our team leaders, receive name tags, and have a fun introductory assembly with songs and skits.",
    leader1: 'Sis. Gethsiyal',
    leader2: 'Sharmila'
  },
  {
    day: "Day 2",
    title: "Bible Lessons & Activities",
    time: "8:00 AM - 12:00 PM",
    desc: "Dive deep into the word! Engaging Bible lessons followed by crafts and activities that reinforce the teachings of Jesus.",
    leader1: 'Sis. Gracepriya',
    leader2: 'Sis. Archana'
  },
  {
    day: "Day 3",
    title: "Games & Memory Verses",
    time: "8:00 AM - 12:00 PM",
    desc: "A day filled with energy! Outdoor team games, obstacle courses, and a special session dedicated to learning our daily memory verses.",
    leader1: 'Sis. Esther',
    leader2: 'Jecitha'
  },
  {
    day: "Day 4",
    title: "Celebration & Prize Distribution",
    time: "8:00 AM - 1:00 PM",
    desc: "Our grand finale! A big celebration with parents invited. Distribution of certificates, prizes, and a special closing worship session.",
    leader1: 'Sis. Lakshmi',
    leader2: 'Sis. Priyadarshini'
  }
];

const Schedule = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'admin';
  const [days, setDays] = useState(defaultDays);
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (index, field, value) => {
    setDays(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="schedule-container fade-in">
      <div className="section-header">
        <h2>VBS 2026 Schedule</h2>
        <p>Four days of faith, fun, and fellowship!</p>
      </div>

      {isAdmin && (
        <div className="schedule-actions">
          <button className="btn btn-secondary" onClick={() => setIsEditing(prev => !prev)}>
            {isEditing ? 'Close Edit' : 'Edit Program'}
          </button>
        </div>
      )}

      <div className="timeline">
        {days.map((item, index) => {
          const dayId = item.day.toLowerCase().replace(' ', '-');
          return (
            <div key={index} className="timeline-item glass-panel" style={{cursor: 'pointer'}} onClick={() => navigate(`/schedule/${dayId}`)}>
              <div className="day-badge">{item.day}</div>
              <div className="timeline-content">
                <h3>{item.title}</h3>
                <p className="time">{item.time}</p>
                <p className="desc">{item.desc}</p>
                <p className="leaders">Leaders: {item.leader1} & {item.leader2}</p>
                {isAdmin && isEditing && (
                  <div className="customize-panel" onClick={e => e.stopPropagation()}>
                    <div className="edit-field">
                      <label>Title</label>
                      <input value={item.title} onChange={(e) => handleFieldChange(index, 'title', e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Time</label>
                      <input value={item.time} onChange={(e) => handleFieldChange(index, 'time', e.target.value)} />
                    </div>
                    <div className="edit-field full-width">
                      <label>Description</label>
                      <textarea value={item.desc} onChange={(e) => handleFieldChange(index, 'desc', e.target.value)} rows="3" />
                    </div>
                    <div className="edit-field">
                      <label>Leader 1</label>
                      <input value={item.leader1} onChange={(e) => handleFieldChange(index, 'leader1', e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Leader 2</label>
                      <input value={item.leader2} onChange={(e) => handleFieldChange(index, 'leader2', e.target.value)} />
                    </div>
                  </div>
                )}
                <button className="btn btn-primary" style={{marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.9rem'}}>View Details</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;
