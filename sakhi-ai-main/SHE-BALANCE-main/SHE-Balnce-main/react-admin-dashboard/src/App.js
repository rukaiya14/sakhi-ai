import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import ArtisanHealthGrid from './components/ArtisanHealthGrid';
import InterventionLog from './components/InterventionLog';
import EmergencyInbox from './components/EmergencyInbox';
import DashboardHeader from './components/DashboardHeader';
import StatsOverview from './components/StatsOverview';
import { fetchArtisans, fetchInterventions, fetchEmergencyMessages } from './services/api';
import './App.css';

// Configure Amplify (replace with your actual configuration)
Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_CLIENT_ID'
  },
  API: {
    endpoints: [
      {
        name: 'AISakhiAPI',
        endpoint: 'YOUR_API_ENDPOINT',
        region: 'us-east-1'
      }
    ]
  }
});

function App() {
  const [artisans, setArtisans] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [emergencyMessages, setEmergencyMessages] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch data on mount and set up auto-refresh
  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [artisansData, interventionsData, messagesData] = await Promise.all([
        fetchArtisans(),
        fetchInterventions(),
        fetchEmergencyMessages()
      ]);
      
      setArtisans(artisansData);
      setInterventions(interventionsData);
      setEmergencyMessages(messagesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtisanSelect = (artisan) => {
    setSelectedArtisan(artisan);
  };

  const handleManualCall = async (artisanId) => {
    // Implement manual call functionality
    console.log('Initiating manual call for artisan:', artisanId);
    // Call API to initiate manual intervention
  };

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="app">
      <DashboardHeader onRefresh={handleRefresh} loading={loading} />
      
      <div className="dashboard-container">
        <div className="main-content">
          <StatsOverview 
            artisans={artisans}
            interventions={interventions}
            emergencyMessages={emergencyMessages}
          />
          
          <ArtisanHealthGrid
            artisans={artisans}
            onArtisanSelect={handleArtisanSelect}
            onManualCall={handleManualCall}
            loading={loading}
          />
        </div>
        
        <div className="sidebar">
          <InterventionLog
            interventions={interventions}
            selectedArtisan={selectedArtisan}
            loading={loading}
          />
          
          <EmergencyInbox
            messages={emergencyMessages}
            onMessageSelect={(message) => console.log('Selected message:', message)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
