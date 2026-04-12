import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, ArrowLeft, Edit3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './DaySchedule.css';

const detailedSchedules = {
  "day-1": {
    title: "Day 1: Welcome & Introduction",
    theme: "Jesus Loves Me",
    activities: [
      { time: "8:00 AM", name: "Starting Prayer", desc: "Sign-in, receive name tags and day groups.", location: "Main Hall" },
      { time: "9:00 AM", name: "Song and Dance", desc: "Singing fun VBS songs and learning the week's theme.", location: "Church" },
      { time: "10:00 AM", name: "Class Time", desc: "Interactive storytelling of the Good Shepherd.", location: "Classrooms" },
      { time: "11:00 AM", name: "Extra Activity", desc: "Creating sheep crafts and enjoying snacks.", location: "Church" },
      { time: "11:45 AM", name: "Closing Assembly", desc: "Recap of the day and memory verse challenge.", location: "Church" },
    ]
  },
  "day-2": {
    title: "Day 2: Bible Lessons & Activities",
    theme: "Jesus Has Power",
    activities: [
      { time: "8:00 AM", name: "Morning Gathering", desc: "Singing and welcoming new friends.", location: "Church" },
      { time: "9:00 AM", name: "Bible Lesson", desc: "Learning about Jesus calming the storm.", location: "Classrooms" },
      { time: "10:00 AM", name: "Outdoor Games", desc: "Water relay and team-building exercises.", location: "Playground" },
      { time: "11:00 AM", name: "Snacks & Music", desc: "Learning new worship dance moves.", location: "Main Hall" },
      { time: "11:45 AM", name: "Closing Assembly", desc: "Memory verse recitation.", location: "Church" },
    ]
  },
  "day-3": {
    title: "Day 3: Games & Memory Verses",
    theme: "Jesus is the Light",
    activities: [
      { time: "8:00 AM", name: "Praise & Worship", desc: "High-energy morning songs.", location: "Church" },
      { time: "9:00 AM", name: "Memory Verse Challenge", desc: "Group competitions for reciting verses.", location: "Main Hall" },
      { time: "10:00 AM", name: "Snacks & Crafts", desc: "Making glow-in-the-dark lanterns.", location: "Church" },
      { time: "11:00 AM", name: "Treasure Hunt", desc: "Searching for clues related to the Bible stories.", location: "Campus Wide" },
      { time: "11:45 AM", name: "Closing Assembly", desc: "Awarding points for the hunt.", location: "Church" },
    ]
  },
  "day-4": {
    title: "Day 4: Celebration & Prize Distribution",
    theme: "Jesus is my Friend",
    activities: [
      { time: "8:00 AM", name: "Final Worship", desc: "Singing all the songs learned this week.", location: "Church" },
      { time: "9:30 AM", name: "Parent Showcase", desc: "Kids perform songs/skits for parents.", location: "Church" },
      { time: "11:00 AM", name: "Awards Ceremony", desc: "Certificates and prize distribution.", location: "Main Hall" },
      { time: "12:00 PM", name: "Grand Feast", desc: "Special celebration lunch for everyone.", location: "Dining Area" },
      { time: "12:45 PM", name: "Farewell & Wrap-up", desc: "Final prayers and goodbyes.", location: "Main Courtyard" },
    ]
  }
};

const DaySchedule = () => {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'admin';
  
  const [schedule, setSchedule] = useState(detailedSchedules[dayId]);
  const [editingActivity, setEditingActivity] = useState(null);

  const handleActivityEdit = (index, field, value) => {
    setSchedule(prev => ({
      ...prev,
      activities: prev.activities.map((act, i) => 
        i === index ? { ...act, [field]: value } : act
      )
    }));
  };

  const startEditing = (index) => {
    setEditingActivity(index);
  };

  const stopEditing = () => {
    setEditingActivity(null);
  };

  if (!schedule) {
    return (
      <div className="day-schedule-container fade-in">
        <div className="section-header">
          <h2>Schedule Not Found</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/schedule')}>Back to Overview</button>
        </div>
      </div>
    );
  }

  return (
    <div className="day-schedule-container fade-in">
      <button className="btn back-btn" onClick={() => navigate('/schedule')}>
        <ArrowLeft size={20} /> Back to Overview
      </button>

      <div className="day-header glass-panel">
        <h2>{schedule.title}</h2>
        <p className="theme">Theme: {schedule.theme}</p>
      </div>

      <div className="detailed-timeline">
        {schedule.activities.map((act, index) => (
          <div key={index} className="activity-card pop-in" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="activity-time">
              <Clock size={18} /> 
              {editingActivity === index ? (
                <input 
                  type="text" 
                  value={act.time} 
                  onChange={(e) => handleActivityEdit(index, 'time', e.target.value)}
                  className="edit-input"
                />
              ) : (
                act.time
              )}
            </div>
            <div className="activity-info">
              {editingActivity === index ? (
                <div className="edit-form">
                  <input 
                    type="text" 
                    value={act.name} 
                    onChange={(e) => handleActivityEdit(index, 'name', e.target.value)}
                    className="edit-input"
                    placeholder="Activity Name"
                  />
                  <textarea 
                    value={act.desc} 
                    onChange={(e) => handleActivityEdit(index, 'desc', e.target.value)}
                    className="edit-textarea"
                    placeholder="Description"
                    rows="2"
                  />
                  <input 
                    type="text" 
                    value={act.location} 
                    onChange={(e) => handleActivityEdit(index, 'location', e.target.value)}
                    className="edit-input"
                    placeholder="Location"
                  />
                  <div className="edit-actions">
                    <button className="btn btn-primary" onClick={stopEditing}>Save</button>
                    <button className="btn btn-secondary" onClick={stopEditing}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{act.name}</h3>
                  <p>{act.desc}</p>
                  <span className="location"><MapPin size={14} /> {act.location}</span>
                  {isAdmin && (
                    <button className="edit-btn" onClick={() => startEditing(index)}>
                      <Edit3 size={16} /> Edit
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaySchedule;
