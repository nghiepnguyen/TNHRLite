import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/common/SEO';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import NotificationBell from '../components/NotificationBell';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UsageMeter from '../components/UsageMeter';
import UpgradeModal from '../components/UpgradeModal';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { currentUser, isAdmin, logout } = useAuth();
  const { activeWorkspace, loading } = useWorkspace() || {};
  const navigate = useNavigate();
  const [aiStatus, setAiStatus] = useState('checking');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      } catch (_error) {
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

  const navItems = useMemo(() => [
    { name: t('nav.dashboard'), path: navBase, icon: 'dashboard' },
    { name: t('nav.jobs'), path: `${navBase}/jobs`, icon: 'work' },
    { name: t('nav.candidates'), path: `${navBase}/candidates`, icon: 'group' },
    { name: t('nav.pipeline'), path: `${navBase}/pipeline`, icon: 'view_kanban' },
    { name: t('nav.reports'), path: `${navBase}/reports`, icon: 'bar_chart' },
    { name: t('nav.members'), path: `${navBase}/members`, icon: 'group' },
    { name: t('nav.settings'), path: `${navBase}/settings`, icon: 'settings' },
  ], [t, navBase]);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <SEO noindex />
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-collapse-toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="material-symbols-outlined">
            {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Unified Workspace/Brand Header */}
        <div className="sidebar-identity">
          <WorkspaceSwitcher isCollapsed={isSidebarCollapsed} />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end
              className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={() => setIsSidebarOpen(false)}
              title={isSidebarCollapsed ? item.name : undefined}
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
              <span style={{ fontWeight: 600 }}>{t('nav.admin')}</span>
            </NavLink>
          )}
        </nav>
        <UsageMeter />
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="header">
          {/* Left group */}
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined">
                {isSidebarOpen ? 'close' : 'menu'}
              </span>
            </button>
            
            <Link to={navBase} className="logo header-logo" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[24px] logo-icon">work</span>
              <span className="logo-text">HR Lite</span>
            </Link>

            <div className="header-page-title">
              {/* This space can be used for breadcrumbs or page titles in the future */}
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

            <div className="header-language">
              <LanguageSwitcher />
            </div>

            <NotificationBell />
            
            <div className="user-profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
              <div className="avatar clickable" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {currentUser?.photoURL && !imgError ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Avatar" 
                    className="avatar-img" 
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'
                )}
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{currentUser?.displayName || t('common.recruiter') || 'Recruiter'}</p>
                    <p className="dropdown-email">{currentUser?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>

                  <Link to={`${navBase}/profile`} className="dropdown-item" onClick={() => setShowProfileMenu(false)} style={{ textDecoration: 'none' }}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">person</span>
                    <span>{t('nav.settings')}</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">logout</span>
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-headline font-bold text-on-surface-variant animate-pulse">{t('common.loading') || 'Loading Workspace...'}</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <UpgradeModal />
    </div>
  );
}
