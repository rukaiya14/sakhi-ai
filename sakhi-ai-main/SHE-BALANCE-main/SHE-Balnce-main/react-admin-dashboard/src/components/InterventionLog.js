import React, { useState } from 'react';
import { MessageSquare, Phone, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import './InterventionLog.css';

const InterventionLog = ({ interventions, selectedArtisan, loading }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const getInterventionIcon = (type) => {
    const icons = {
      whatsapp_message: <MessageSquare size={20} />,
      voice_call: <Phone size={20} />,
      community_alert: <Users size={20} />
    };
    return icons[type] || <MessageSquare size={20} />;
  };

  const getInterventionColor = (type) => {
    const colors = {
      whatsapp_message: '#25D366',
      voice_call: '#3b82f6',
      community_alert: '#f59e0b'
    };
    return colors[type] || '#666';
  };

  const filteredInterventions = interventions.filter(intervention => {
    if (selectedArtisan && intervention.artisanId !== selectedArtisan.artisanId) {
      return false;
    }
    if (filter === 'all') return true;
    return intervention.interventionType === filter;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="intervention-log">
        <div className="log-header">
          <h3>Intervention Log</h3>
        </div>
        <div className="loading-spinner">Loading interventions...</div>
      </div>
    );
  }

  return (
    <div className="intervention-log">
      <div className="log-header">
        <h3>Intervention Log</h3>
        {selectedArtisan && (
          <span className="selected-artisan-badge">
            {selectedArtisan.artisanName}
          </span>
        )}
      </div>

      <div className="log-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'whatsapp_message' ? 'active' : ''}
          onClick={() => setFilter('whatsapp_message')}
        >
          <MessageSquare size={16} />
          WhatsApp
        </button>
        <button 
          className={filter === 'voice_call' ? 'active' : ''}
          onClick={() => setFilter('voice_call')}
        >
          <Phone size={16} />
          Calls
        </button>
        <button 
          className={filter === 'community_alert' ? 'active' : ''}
          onClick={() => setFilter('community_alert')}
        >
          <Users size={16} />
          Community
        </button>
      </div>

      <div className="log-timeline">
        {filteredInterventions.map((intervention) => {
          const isExpanded = expandedId === intervention.interventionId;
          const iconColor = getInterventionColor(intervention.interventionType);

          return (
            <div 
              key={intervention.interventionId}
              className={`log-item ${intervention.status}`}
            >
              <div className="log-item-header" onClick={() => toggleExpand(intervention.interventionId)}>
                <div className="log-icon" style={{ backgroundColor: iconColor }}>
                  {getInterventionIcon(intervention.interventionType)}
                </div>
                
                <div className="log-content">
                  <div className="log-title">
                    <span className="intervention-type">
                      {intervention.interventionType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`status-badge status-${intervention.status}`}>
                      {intervention.status}
                    </span>
                  </div>
                  
                  <div className="log-meta">
                    <span className="artisan-name">{intervention.artisanName}</span>
                    <span className="timestamp">
                      <Clock size={12} />
                      {format(new Date(intervention.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>

                <button className="expand-btn">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {isExpanded && (
                <div className="log-item-details">
                  {intervention.interventionType === 'whatsapp_message' && (
                    <>
                      <div className="detail-section">
                        <h4>Message Content</h4>
                        <div className="message-content">
                          {intervention.messageContent || 'Automated wellness check message sent'}
                        </div>
                      </div>
                      
                      {intervention.messageId && (
                        <div className="detail-row">
                          <span className="detail-label">Message ID:</span>
                          <span className="detail-value">{intervention.messageId}</span>
                        </div>
                      )}

                      {intervention.replyContent && (
                        <div className="detail-section">
                          <h4>Artisan Reply</h4>
                          <div className="reply-content">
                            {intervention.replyContent}
                          </div>
                          <div className="reply-meta">
                            <span>Sentiment: {intervention.sentiment}</span>
                            <span>Reply time: {intervention.replyTime}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {intervention.interventionType === 'voice_call' && (
                    <>
                      <div className="detail-section">
                        <h4>Call Transcript</h4>
                        <div className="transcript-content">
                          {intervention.transcript || 'Automated voice message delivered via Amazon Polly'}
                        </div>
                      </div>

                      {intervention.audioUrl && (
                        <div className="audio-player">
                          <audio controls src={intervention.audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}

                      <div className="detail-row">
                        <span className="detail-label">Call Duration:</span>
                        <span className="detail-value">{intervention.duration || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Call ID:</span>
                        <span className="detail-value">{intervention.callId}</span>
                      </div>
                    </>
                  )}

                  {intervention.interventionType === 'community_alert' && (
                    <>
                      <div className="detail-section">
                        <h4>Community Support Activated</h4>
                        <p>{intervention.alertReason}</p>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Coordinators Notified:</span>
                        <span className="detail-value">{intervention.coordinatorsNotified || 5}</span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Nearby Artisans Alerted:</span>
                        <span className="detail-value">{intervention.artisansAlerted || 10}</span>
                      </div>
                    </>
                  )}

                  <div className="detail-section">
                    <h4>AI Analysis</h4>
                    <div className="ai-analysis">
                      <div className="analysis-item">
                        <span>Days Inactive:</span>
                        <strong>{intervention.daysInactive}</strong>
                      </div>
                      <div className="analysis-item">
                        <span>Intervention Count:</span>
                        <strong>{intervention.interventionCount}</strong>
                      </div>
                      <div className="analysis-item">
                        <span>Success Rate:</span>
                        <strong>{intervention.successRate}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredInterventions.length === 0 && (
        <div className="empty-state">
          <MessageSquare size={48} />
          <p>No interventions recorded</p>
        </div>
      )}
    </div>
  );
};

export default InterventionLog;
