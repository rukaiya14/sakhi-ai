import React from 'react';
import { RefreshCw, Bell, Settings, User } from 'lucide-react';
import './DashboardHeader.css';

const DashboardHeader = ({ onRefresh, loading }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo-section">
          <img 
            src="/logo She balance.png" 
            alt="SheBalance Logo" 
            className="dashboard-logo"
          />
          <div className="header-title">
            <h1>AI Sakhi Admin</h1>
            <p className="header-subtitle">Real-time Artisan Health Monitoring</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button 
          className={`btn-refresh ${loading ? 'loading' : ''}`}
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        <button className="btn-icon" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <button className="btn-icon" title="Settings">
          <Settings size={20} />
        </button>

        <button className="btn-profile">
          <User size={20} />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
