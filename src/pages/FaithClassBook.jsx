import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Upload, FileText, Edit3, Save, X, Download } from 'lucide-react';
import './FaithClassBook.css';

const FaithClassBook = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'admin';
  
  const [isEditing, setIsEditing] = useState(false);
  const [classBookContent, setClassBookContent] = useState(() => {
    const saved = localStorage.getItem('faith-class-book-pdfs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved faith class books', err);
      }
    }
    return {
      title: 'Faith Class Book - VBS 2026',
      description: 'PDF Books for different age groups',
      classes: [
        { name: 'Beginner', pdfUrl: null, fileName: '' },
        { name: 'Primary', pdfUrl: null, fileName: '' },
        { name: 'Junior', pdfUrl: null, fileName: '' },
        { name: 'Inter', pdfUrl: null, fileName: '' },
        { name: 'Senior', pdfUrl: null, fileName: '' }
      ]
    };
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    try {
      localStorage.setItem('faith-class-book-pdfs', JSON.stringify(classBookContent));
    } catch (err) {
      alert("Error saving: The PDF files might be too large for local storage.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const saved = localStorage.getItem('faith-class-book-pdfs');
    if (saved) {
      setClassBookContent(JSON.parse(saved));
    }
  };

  const handleFileUpload = (index, event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      // Check size < 2MB to prevent localStorage overflow
      if (file.size > 2 * 1024 * 1024) {
        alert("Warning: File size is large. It might exceed local storage quota.");
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedClasses = [...classBookContent.classes];
        updatedClasses[index] = {
          ...updatedClasses[index],
          pdfUrl: e.target.result,
          fileName: file.name
        };
        setClassBookContent({ ...classBookContent, classes: updatedClasses });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Please upload a valid PDF file.");
    }
  };

  const updateContent = (field, value) => {
    setClassBookContent({ ...classBookContent, [field]: value });
  };

  return (
    <div className="faith-class-book-container fade-in">
      <div className="class-book-header glass-panel">
        <BookOpen size={40} color="#00d2ff" />
        <div>
          <h2>{classBookContent.title}</h2>
          <p>{classBookContent.description}</p>
        </div>
        
        {isAdmin && (
          <div className="edit-actions">
            {!isEditing ? (
              <button className="btn btn-secondary" onClick={handleEdit}>
                <Edit3 size={18} />
                Edit Uploads
              </button>
            ) : (
              <div className="edit-buttons">
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={18} />
                  Save
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="class-book-content">
        {isEditing && (
          <div className="edit-form glass-panel">
            <div className="form-group">
              <label>Title:</label>
              <input 
                type="text" 
                value={classBookContent.title}
                onChange={(e) => updateContent('title', e.target.value)}
                className="edit-input"
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea 
                value={classBookContent.description}
                onChange={(e) => updateContent('description', e.target.value)}
                className="edit-textarea"
                rows="2"
              />
            </div>
          </div>
        )}

        <div className="lessons-grid">
          {classBookContent.classes.map((cls, index) => (
            <div key={index} className="lesson-card glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="lesson-header" style={{ width: '100%', marginBottom: '15px' }}>
                <h3>{cls.name} Class</h3>
              </div>
              
              {isEditing ? (
                <div className="lesson-edit" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="file-upload-wrapper" style={{ padding: '15px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                    <Upload size={24} color="#00d2ff" style={{ marginBottom: '10px' }} />
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => handleFileUpload(index, e)}
                      style={{ display: 'block', width: '100%' }}
                    />
                  </div>
                  {cls.fileName && (
                    <div style={{ fontSize: '0.9rem', color: '#00d2ff' }}>
                      Current: {cls.fileName}
                    </div>
                  )}
                </div>
              ) : (
                <div className="lesson-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <FileText size={48} color={cls.pdfUrl ? "#00d2ff" : "rgba(255,255,255,0.2)"} />
                  
                  {cls.pdfUrl ? (
                    <>
                      <p style={{ margin: '0' }}>{cls.fileName || `${cls.name} Book.pdf`}</p>
                      <a 
                        href={cls.pdfUrl} 
                        download={`${cls.name}-VBS-2026.pdf`}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      >
                        <Download size={18} />
                        Download PDF
                      </a>
                    </>
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', margin: 0 }}>
                      No PDF uploaded yet
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="back-navigation">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FaithClassBook;