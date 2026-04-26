import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, ArrowRight, Sparkles, Github } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Floating bubbles for background animation
  const [bubbles] = useState(() => Array.from({ length: 15 }).map(() => ({

    left: `${Math.random() * 100}%`,

    width: `${Math.random() * 80 + 20}px`,

    height: `${Math.random() * 80 + 20}px`,

    animationDuration: `${Math.random() * 10 + 5}s`,

    animationDelay: `${Math.random() * 5}s`
  })));

  const handleGitHubLogin = () => {
    window.location.href = '/auth/github';
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Valid teacher logins
    const validTeachers = [
      "gethsiyal", "sharmila", "gracepriya", "archana", "esther", "jecitha", "sofia", "keerthana",
      "jamuna", "lakshmi", "priya", "preethi", "megala", "puspalatha", "priyadarshini", "yuvashri",
      "jessica", "kishori", "shekina", "shamili", "nithya", "amutha", "lambert", "dharani", "remi",
      "vennila", "rajmary", "vasudevan", "hari", "jeba", "yessaiya", "vignesh", "chandra mohan"
    ];

    setTimeout(() => {
      const normalizedUser = username.toLowerCase().trim();
      const teacherNameMap = {
        gethsiyal: 'Sis. Gethsiyal',
        sharmila: 'Sharmila',
        gracepriya: 'Sis. Gracepriya',
        archana: 'Sis. Archana',
        esther: 'Sis. Esther',
        jecitha: 'Jecitha',
        sofia: 'Sofia',
        keerthana: 'Keerthana',
        jamuna: 'Sis. Jamuna',
        lakshmi: 'Sis. Lakshmi',
        priya: 'Priya Angel',
        preethi: 'Preethi',
        megala: 'Sis. Megala',
        puspalatha: 'Sis. Puspalatha',
        priyadarshini: 'Sis. Priyadarshini',
        yuvashri: 'Pr. Yuvashri',
        jessica: 'Jessica',
        kishori: 'Kishori',
        shekina: 'Shekina',
        shamili: 'Sis. Shamili',
        nithya: 'Sis. Nithya',
        amutha: 'Sis. Amutha Jose',
        lambert: 'Bro. Lambert',
        dharani: 'Sis. Dharani',
        remi: 'Sis. Remi',
        vennila: 'Sis. Vennila',
        rajmary: 'Sis. Rajmary',
        vasudevan: 'Bro. Vasudevan',
        hari: 'Hari',
        jeba: 'Jeba',
        yessaiya: 'Yessaiya',
        vignesh: 'Vignesh',
        'chandra mohan': 'Chandra Mohan'
      };

      if (username === 'Pr.Sam' && password === 'Sam2026') {
        login('admin', 'admin');
        navigate('/');
      } else if (username === 'Gabril' && password === 'Gabril2026') {
        login('admin', 'admin');
        navigate('/');
      } else if (username === 'Ashok' && password === 'Ashok2026') {
        login('admin', 'admin');
        navigate('/');
      } else if (username === 'Yesuraja' && password === 'Yesuraja2026') {
        login('admin', 'admin');
        navigate('/');
      } else if (validTeachers.includes(normalizedUser) && password === 'vbs2026') {
        const displayName = teacherNameMap[normalizedUser] || normalizedUser;
        login('user', displayName);
        navigate('/');
      } else {
        setError('Invalid username or password!');
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="login-wrapper">
      {/* Interactive Animated Background */}
      <div className="animated-background">
        {bubbles.map((bubbleStyle, i) => (
          <div key={i} className="bubble" style={bubbleStyle}></div>
        ))}
      </div>

      <div className="login-container fade-in">
        <div className="login-card premium-glass">
          <div className="login-header">
            <div className="icon-wrapper glow-pulse">
              <Sparkles size={32} color="#fff" />
            </div>
            <h2>VBS 2026</h2>
            <p>Sign in to your adventure</p>
          </div>

          {error && <div className="error-message shake-anim">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group slide-up-1">
              <div className="input-icon"><User size={20} /></div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="interactive-input"
              />
            </div>

            <div className="input-group slide-up-2">
              <div className="input-icon"><Lock size={20} /></div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="interactive-input"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary login-btn slide-up-3 ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              <span className="btn-text">
                {isSubmitting ? 'Verifying...' : 'Enter Doorway'}
                {!isSubmitting && <ArrowRight size={20} className="arrow-icon" />}
              </span>
            </button>
          </form>

          <div className="divider slide-up-3">
            <span>or</span>
          </div>

          <button
            onClick={handleGitHubLogin}
            className="btn btn-secondary github-btn slide-up-3"
          >
            <Github size={20} />
            <span>Continue with GitHub</span>
          </button>

          <div className="login-help slide-up-4">
            <p>Teacher Login Instructions:</p>
            <div className="cred-badges" style={{ flexWrap: 'wrap' }}>
              <span className="badge user-badge">Username: First Name (e.g. sharmila, kishori)</span>
              <span className="badge admin-badge">Password: vbs2026</span>
              <span className="badge admin-badge">Admins: Pr.Sam / Gabril</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
