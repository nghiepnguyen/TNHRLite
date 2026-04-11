import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Kanban, BarChart3, LogOut, Search, Bell, Cpu, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [aiStatus, setAiStatus] = useState('checking');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = React.useRef(null);

  useEffect(() => {
    const checkAI = async () => {
      try {
        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
        const res = await fetch(`${baseUrl}/parse-cv`, { method: 'OPTIONS' }).catch(() => ({ ok: false }));
        // Note: OPTIONS might 404/405 if not handled, but we just check if server responds at all
        setAiStatus(res ? 'online' : 'offline');
      } catch (e) {
        setAiStatus('offline');
      }
    };
    checkAI();
    const interval = setInterval(checkAI, 30000); // Re-check every 30s
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Pipeline', path: '/pipeline', icon: Kanban },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Briefcase className="logo-icon" size={24} />
            HR Lite
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink 
              to="/admin" 
              className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
              style={{ marginTop: 'auto', borderTop: '1px solid var(--color-surface-border)', paddingTop: '1rem' }}
            >
              <Shield size={20} className="text-primary" />
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Admin Portal</span>
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="header">
          <div className="header-search">
            <Search className="search-icon text-muted" size={18} />
            <input type="text" placeholder="Search candidates, jobs..." className="search-input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* AI Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
              <Cpu size={14} className={aiStatus === 'online' ? 'text-success' : 'text-danger'} />
              <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                AI Proxy: <span className={aiStatus === 'online' ? 'text-success' : 'text-danger'}>{aiStatus}</span>
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <Bell size={20} className="text-secondary" style={{ cursor: 'pointer' }} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', backgroundColor: 'var(--color-danger)', borderRadius: '50%', border: '2px solid var(--color-surface-card)' }}></span>
            </div>
            
            <div className="user-profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
              <div className="avatar clickable" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{currentUser?.displayName || 'Recruiter'}</p>
                    <p className="dropdown-email">{currentUser?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
