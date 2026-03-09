import React, { useState } from 'react';
import { AlertTriangle, MessageCircle, Clock, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import './EmergencyInbox.css';

const EmergencyInbox = ({ messages, onMessageSelect, loading }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const getPriorityConfig = (priority) => {
    const configs = {
      critical: {
        color: '#ef4444',
        label: 'Critical',
        icon: <AlertTriangle size={16} />
      },
      high: {
        color: '#f59e0b',
        label: 'High',
        icon: <AlertTriangle size={16} />
      },
      medium: {
        color: '#3b82f6',
        label: 'Medium',
        icon: <MessageCircle size={16} />
      }
    };
    return configs[priority] || configs.medium;
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    onMessageSelect(message);
  };

  if (loading) {
    return (
      <div className="emergency-inbox">
        <div className="inbox-header">
          <h3>Emergency Inbox</h3>
          <span className="unread-badge">0</span>
        </div>
        <div className="loading-spinner">Loading messages...</div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="emergency-inbox">
      <div className="inbox-header">
        <h3>Emergency Inbox</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      <div className="inbox-subtitle">
        "Unseen Circumstances" Messages
      </div>

      <div className="messages-list">
        {messages.map((message) => {
          const priorityConfig = getPriorityConfig(message.priority);
          const isSelected = selectedMessage?.messageId === message.messageId;

          return (
            <div
              key={message.messageId}
              className={`message-item ${!message.read ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleMessageClick(message)}
            >
              <div className="message-header">
                <div className="artisan-info">
                  <div className="artisan-avatar-small">
                    {message.artisanName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4>{message.artisanName}</h4>
                    <p className="message-skill">{message.skill}</p>
                  </div>
                </div>
                <div 
                  className="priority-badge"
                  style={{ backgroundColor: priorityConfig.color }}
                >
                  {priorityConfig.icon}
                  <span>{priorityConfig.label}</span>
                </div>
              </div>

              <div className="message-content">
                <p className="message-text">{message.messageText}</p>
              </div>

              <div className="message-meta">
                <span className="message-time">
                  <Clock size={12} />
                  {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                </span>
                <span className="message-location">
                  <MapPin size={12} />
                  {message.location}
                </span>
              </div>

              {message.circumstance && (
                <div className="circumstance-tag">
                  {message.circumstance}
                </div>
              )}

              {isSelected && (
                <div className="message-actions">
                  <button className="btn-call">
                    <Phone size={14} />
                    Call Now
                  </button>
                  <button className="btn-mark-read">
                    Mark as Read
                  </button>
                  <button className="btn-escalate">
                    Escalate to Community
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {messages.length === 0 && (
        <div className="empty-state">
          <MessageCircle size={48} />
          <p>No emergency messages</p>
          <span className="empty-subtitle">All artisans are doing well!</span>
        </div>
      )}
    </div>
  );
};

export default EmergencyInbox;
