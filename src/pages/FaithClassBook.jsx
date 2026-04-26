import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Upload, FileText, Edit3, Save, X, Download, Trash2 } from 'lucide-react';
import './FaithClassBook.css';

const FaithClassBook = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'admin';
  
  const [isEditing, setIsEditing] = useState(false);
  const [classBookContent, setClassBookContent] = useState({
    title: 'Faith Class Book - VBS 2026',
    description: 'PDF Books for different age groups',
    classes: [
      { name: 'Beginner', pdfUrl: null, fileName: '', className: 'Beginner' },
      { name: 'Primary', pdfUrl: null, fileName: '', className: 'Primary' },
      { name: 'Junior', pdfUrl: null, fileName: '', className: 'Junior' },
      { name: 'Inter', pdfUrl: null, fileName: '', className: 'Inter' },
      { name: 'Senior', pdfUrl: null, fileName: '', className: 'Senior' }
    ]
  });
  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUploadedBooks();
  }, []);

  const fetchUploadedBooks = async () => {
    try {
      const response = await fetch('/api/faith-class-books');
      if (response.ok) {
        const books = await response.json();
        setUploadedBooks(books);
        
        // Update classBookContent with uploaded books
        const updatedClasses = classBookContent.classes.map(cls => {
          const book = books.find(b => b.className === cls.className);
          if (book) {
            return {
              ...cls,
              pdfUrl: `/uploads/${book.filePath}`,
              fileName: book.fileName
            };
          }
          return cls;
        });
        setClassBookContent({ ...classBookContent, classes: updatedClasses });
      }
    } catch (err) {
      console.error('Failed to fetch uploaded books:', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUploadedBooks(); // Refresh from server
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("File size must be less than 10MB.");
      return;
    }

    setUploading(true);
    const className = classBookContent.classes[index].className;
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('className', className);

      const response = await fetch('/api/faith-class-books/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert('File uploaded successfully!');
        fetchUploadedBooks(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (className) => {
    if (!window.confirm(`Are you sure you want to delete the ${className} faith class book?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/faith-class-books/${className}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Book deleted successfully!');
        fetchUploadedBooks(); // Refresh the list
      } else {
        alert('Failed to delete book.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete book.');
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
              <label htmlFor="classBookTitle">Title:</label>
              <input 
                id="classBookTitle"
                name="classBookTitle"
                type="text" 
                value={classBookContent.title}
                onChange={(e) => updateContent('title', e.target.value)}
                className="edit-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="classBookDescription">Description:</label>
              <textarea 
                id="classBookDescription"
                name="classBookDescription"
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
                      id={`classBookFile-${index}`}
                      name={`classBookFile-${index}`}
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