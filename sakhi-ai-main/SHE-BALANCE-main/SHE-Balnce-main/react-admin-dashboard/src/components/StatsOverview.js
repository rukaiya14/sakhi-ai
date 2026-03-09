import React from 'react';
import { Users, AlertCircle, Phone, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import './StatsOverview.css';

const StatsOverview = ({ artisans, interventions, emergencyMessages }) => {
  // Calculate statistics
  const totalArtisans = artisans.length;
  const activeArtisans = artisans.filter(a => a.status === 'active').length;
  const criticalArtisans = artisans.filter(a => a.status === 'critical').length;
  const alertsSent = artisans.filter(a => a.status === 'alert_sent').length;
  const callsPending = artisans.filter(a => a.status === 'call_pending').length;
  
  const totalInterventions = interventions.length;
  const successfulInterventions = interventions.filter(i => i.status === 'success').length;
  const successRate = totalInterventions > 0 
    ? Math.round((successfulInterventions / totalInterventions) * 100) 
    : 0;

  const unreadEmergencies = emergencyMessages.filter(m => !m.read).length;

  const avgResilienceScore = artisans.length > 0
    ? Math.round(artisans.reduce((sum, a) => sum + a.resilienceScore, 0) / artisans.length)
    : 0;

  const stats = [
    {
      icon: <Users size={24} />,
      label: 'Total Artisans',
      value: totalArtisans,
      subtext: `${activeArtisans} active`,
      color: '#3b82f6',
      trend: '+12 this week'
    },
    {
      icon: <AlertCircle size={24} />,
      label: 'Critical Cases',
      value: criticalArtisans,
      subtext: 'Require immediate attention',
      color: '#ef4444',
      trend: criticalArtisans > 0 ? 'Action needed' : 'All clear'
    },
    {
      icon: <Phone size={24} />,
      label: 'Active Interventions',
      value: alertsSent + callsPending,
      subtext: `${alertsSent} alerts, ${callsPending} calls`,
      color: '#f59e0b',
      trend: `${successRate}% success rate`
    },
    {
      icon: <Activity size={24} />,
      label: 'Avg Resilience Score',
      value: avgResilienceScore,
      subtext: 'Out of 100',
      color: '#10b981',
      trend: avgResilienceScore >= 70 ? 'Healthy' : 'Needs support'
    },
    {
      icon: <CheckCircle size={24} />,
      label: 'Total Interventions',
      value: totalInterventions,
      subtext: `${successfulInterventions} successful`,
      color: '#8b5cf6',
      trend: 'Last 30 days'
    },
    {
      icon: <TrendingUp size={24} />,
      label: 'Emergency Messages',
      value: emergencyMessages.length,
      subtext: `${unreadEmergencies} unread`,
      color: '#ec4899',
      trend: unreadEmergencies > 0 ? 'Review needed' : 'All reviewed'
    }
  ];

  return (
    <div className="stats-overview">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
          <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-subtext">{stat.subtext}</div>
          </div>
          <div className="stat-trend" style={{ color: stat.color }}>
            {stat.trend}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
