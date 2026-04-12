import React, { useState } from 'react';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    areaName: '',
    memberCount: '',
    inchargePerson: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple verification
    if (!formData.areaName || !formData.memberCount || !formData.inchargePerson) {
      alert("Please fill out all required fields.");
      return;
    }

    const newEntry = {
      ...formData,
      id: Date.now().toString(),
      dateSubmitted: new Date().toLocaleDateString()
    };

    try {
      await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
    } catch (err) {
      console.error("Failed to save to server, saving locally instead", err);
      const existingData = JSON.parse(localStorage.getItem('vbs-registrations') || '[]');
      existingData.push(newEntry);
      localStorage.setItem('vbs-registrations', JSON.stringify(existingData));
    }

    // Show Success, Reset Form
    setSuccess(true);
    setFormData({
      areaName: '',
      memberCount: '',
      inchargePerson: ''
    });

    // Hide success message after 5 seconds
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="registration-container fade-in">
      <div className="form-wrapper glass-panel">
        <h2>Register for VBS 2026</h2>
        <p className="form-subtitle">Join us for the best week of the summer!</p>

        {success && (
          <div className="success-msg pop-in">
            🎉 Registration Successful! We can't wait to see you!
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="areaName">Area Name</label>
            <input
              type="text"
              id="areaName"
              name="areaName"
              value={formData.areaName}
              onChange={handleChange}
              placeholder="e.g. North District"
            />
          </div>

          <div className="form-group">
            <label htmlFor="memberCount">How Many Members?</label>
            <input
              type="number"
              id="memberCount"
              name="memberCount"
              value={formData.memberCount}
              onChange={handleChange}
              placeholder="e.g. 15"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inchargePerson">Incharge Person Name</label>
            <input
              type="text"
              id="inchargePerson"
              name="inchargePerson"
              value={formData.inchargePerson}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn">
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
