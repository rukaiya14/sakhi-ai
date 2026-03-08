import React, { useState } from 'react';
import { Phone, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import './ArtisanHealthGrid.css';

const ArtisanHealthGrid = ({ artisans, onArtisanSelect, onManualCall, loading }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('status');

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: 'green',
        icon: <CheckCircle size={20} />,
        label: 'Active',
        bgClass: 'status-active'
      },
      alert_sent: {
        color: 'yellow',
        icon: <AlertCircle size={20} />,
        label: 'Alert Sent',
        bgClass: 'status-alert'
      },
      call_pending: {
        color: 'orange',
        icon: <Clock size={20} />,
        label: 'Call Pending',
        bgClass: 'status-pending'
      },
      critical: {
        color: 'red',
        icon: <AlertCircle size={20} />,
        label: 'Critical',
        bgClass: 'status-critical'
      }
    };
    return configs[status] || configs.active;
  };

  const filteredArtisans = artisans.filter(artisan => {
    if (filter === 'all') return true;
    return artisan.status === filter;
  });

  const sortedArtisans = [...filteredArtisans].sort((a, b) => {
    if (sortBy === 'status') {
      const statusOrder = { critical: 0, call_pending: 1, alert_sent: 2, active: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    } else if (sortBy === 'daysInactive') {
      return b.daysInactive - a.daysInactive;
    } else if (sortBy === 'resilienceScore') {
      return a.resilienceScore - b.resilienceScore;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="artisan-grid-container">
        <div className="loading-spinner">Loading artisans...</div>
      </div>
    );
  }

  return (
    <div className="artisan-grid-container">
      <div className="grid-header">
        <h2>Artisan Health Monitor</h2>
        <div className="grid-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="alert_sent">Alert Sent</option>
            <option value="call_pending">Call Pending</option>
            <option value="critical">Critical</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="status">Sort by Status</option>
            <option value="daysInactive">Sort by Days Inactive</option>
            <option value="resilienceScore">Sort by Resilience</option>
          </select>
        </div>
      </div>

      <div className="artisan-grid">
        {sortedArtisans.map((artisan) => {
          const statusConfig = getStatusConfig(artisan.status);
          
          return (
            <div 
              key={artisan.artisanId}
              className={`artisan-card ${statusConfig.bgClass}`}
              onClick={() => onArtisanSelect(artisan)}
            >
              <div className="card-header">
                <div className="artisan-avatar">
                  {artisan.artisanName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="artisan-info">
                  <h3>{artisan.artisanName}</h3>
                  <p className="artisan-skill">{artisan.skill}</p>
                  <p className="artisan-location">{artisan.location}</p>
                </div>
              </div>

              <div className="status-badge">
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </div>

              <div className="artisan-metrics">
                <div className="metric">
                  <span className="metric-label">Days Inactive</span>
                  <span className="metric-value">{artisan.daysInactive}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Resilience Score</span>
                  <span className="metric-value">{artisan.resilienceScore}/100</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Heritage Score</span>
                  <span className="metric-value">{artisan.heritageScore}/100</span>
                </div>
              </div>

              {artisan.bulkOrder && (
                <div className="bulk-order-badge">
                  <TrendingUp size={16} />
                  <span>On Bulk Order: {artisan.bulkOrder.orderName}</span>
                </div>
              )}

              <div className="last-activity">
                <Clock size={14} />
                <span>Last active: {artisan.lastActivityDate}</span>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-view-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArtisanSelect(artisan);
                  }}
                >
                  View Details
                </button>
                <button 
                  className="btn-manual-call"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManualCall(artisan.artisanId);
                  }}
                >
                  <Phone size={16} />
                  Manual Call
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedArtisans.length === 0 && (
        <div className="empty-state">
          <CheckCircle size={48} />
          <p>No artisans match the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default ArtisanHealthGrid;
