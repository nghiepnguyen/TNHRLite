import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import NotificationBell from '../components/NotificationBell';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { activeWorkspace } = useWorkspace() || {};
  const navigate = useNavigate();
  const [aiStatus, setAiStatus] = useState('checking');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const profileRef = React.useRef(null);

  useEffect(() => {
    const checkAI = async () => {
      try {
        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
        // We use a shorter timeout and catch specifically to avoid console noise
        const res = await fetch(`${baseUrl}/parse-cv`, { 
          method: 'OPTIONS',
          mode: 'cors'
        }).catch(() => null);
        
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

  const navBase = activeWorkspace ? `/dashboard/w/${activeWorkspace.id}` : '/dashboard';

  const navItems = [
    { name: 'Dashboard', path: navBase, icon: 'dashboard' },
    { name: 'Jobs', path: `${navBase}/jobs`, icon: 'work' },
    { name: 'Candidates', path: `${navBase}/candidates`, icon: 'group' },
    { name: 'Pipeline', path: `${navBase}/pipeline`, icon: 'view_kanban' },
    { name: 'Reports', path: `${navBase}/reports`, icon: 'bar_chart' },
    { name: 'Members', path: `${navBase}/members`, icon: 'group' },
    { name: 'Settings', path: `${navBase}/settings`, icon: 'settings' },
  ];

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <Link to={navBase} className="logo" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[24px] logo-icon">work</span>
            HR Lite
          </Link>
        </div>

        {/* Workspace Switcher inside Sidebar for mobile access */}
        <div className="sidebar-workspace">
          <WorkspaceSwitcher />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              end
              className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink 
              to={`${navBase}/admin`} 
              className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
              style={{ marginTop: 'auto', borderTop: '1px solid var(--color-surface-border)', paddingTop: '1rem' }}
            >
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">shield</span>
              <span style={{ fontWeight: 600 }}>Admin Portal</span>
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="header">
          {/* Left group */}
          <div className="header-left">
            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined">
                {isSidebarOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Mobile brand name (shown beside hamburger on mobile) */}
            <Link to={navBase} className="header-brand-mobile" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">work</span>
              HR Lite
            </Link>

            <div className="header-search">
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] search-icon text-muted">search</span>
              <input type="text" placeholder="Search candidates, jobs..." className="search-input" />
            </div>

            <div className="header-workspace-switcher">
              <WorkspaceSwitcher variant="header" />
            </div>
          </div>

          {/* Right group */}
          <div className="header-right">
            {/* AI Status Indicator - hidden on mobile */}
            <div className="ai-status-indicator">
              <span className={`material-symbols-outlined flex-shrink-0 !text-[14px] ${ aiStatus === 'online' ? 'text-success' : 'text-danger' }`}>memory</span>
              <span>
                AI: <span className={aiStatus === 'online' ? 'text-success' : 'text-danger'}>{aiStatus}</span>
              </span>
            </div>

            <NotificationBell />
            
            <div className="user-profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
              <div className="avatar clickable" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {currentUser?.photoURL && !imgError ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Avatar" 
                    className="avatar-img" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'
                )}
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{currentUser?.displayName || 'Recruiter'}</p>
                    <p className="dropdown-email">{currentUser?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">logout</span>
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
