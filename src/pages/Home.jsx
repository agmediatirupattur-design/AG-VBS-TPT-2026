import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Music, Smile } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container fade-in">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to AG VBS TIRUPATTUR</h1>
          <p className="subtitle">5G Christ Generation</p>
          <div className="event-details glass-panel">
            <p><strong>Dates:</strong> April 27 - April 30, 2026</p>
            <p><strong>Location:</strong> AG Church Tirupattur</p>
            <p><strong>Audience:</strong> Children of all ages!</p>
          </div>
          
          <div className="verse-card">
            "A posterity shall serve Him. It will be recounted of the Lord to the next generation"
            <br /><span>- Psalms 22:30</span>
          </div>

          <button className="btn btn-primary cta-button" onClick={() => navigate('/registration')}>
            Register Now
          </button>
        </div>
        <div className="hero-image-wrapper">
          <img src="/hero.png" alt="Happy children at VBS" className="hero-img float-anim" />
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card glass-panel">
          <Heart size={40} color="var(--primary-color)" />
          <h3>Faith</h3>
          <p>Learn beautiful Bible stories.</p>
        </div>
        <div className="feature-card glass-panel">
          <Star size={40} color="var(--accent-color)" />
          <h3>Fun</h3>
          <p>Awesome games and activities.</p>
        </div>
        <div className="feature-card glass-panel">
          <Music size={40} color="var(--secondary-color)" />
          <h3>Music</h3>
          <p>Joyful praise and worship.</p>
        </div>
        <div className="feature-card glass-panel">
          <Smile size={40} color="#FF9F43" />
          <h3>Friends</h3>
          <p>Make new friends that last a lifetime.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
