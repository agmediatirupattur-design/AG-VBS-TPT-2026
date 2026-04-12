import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar fade-in">
      <div className="nav-brand">
        <Sun color="var(--accent-color)" size={28} fill="var(--accent-color)" />
        <NavLink to="/">VBS 2026</NavLink>
      </div>

      {isAuthenticated && (
        <>
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className={`nav-links ${isOpen ? 'open' : ''}`}>
            <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/schedule" onClick={() => setIsOpen(false)}>Schedule</NavLink>
            <NavLink to="/registration" onClick={() => setIsOpen(false)}>Registration</NavLink>
            <NavLink to="/attendance" onClick={() => setIsOpen(false)}>Teachers</NavLink>
            <NavLink to="/my-class" onClick={() => setIsOpen(false)}>My Class</NavLink>

            {/* Admin Features */}
            {role === 'admin' && (
              <>
                <NavLink to="/admin" onClick={() => setIsOpen(false)}>Admin</NavLink>
                <NavLink to="/report" onClick={() => setIsOpen(false)}>Report</NavLink>
                <NavLink to="/expenses" onClick={() => setIsOpen(false)}>Expenses</NavLink>
              </>
            )}

            <button onClick={handleLogout} className="btn" style={{ padding: '0.4rem 1rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
