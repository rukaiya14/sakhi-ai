import { API } from 'aws-amplify';
import axios from 'axios';

// Mock data for development (replace with actual API calls)
const MOCK_MODE = true;

// Mock data generators
const generateMockArtisans = () => {
  const names = [
    'Priya Sharma', 'Lakshmi Devi', 'Meera Patel', 'Anjali Singh', 
    'Radha Kumar', 'Sunita Rao', 'Kavita Reddy', 'Pooja Gupta',
    'Rekha Nair', 'Savita Joshi', 'Deepa Verma', 'Nisha Agarwal'
  ];
  
  const skills = ['Embroidery', 'Tailoring', 'Henna Art', 'Cooking', 'Jewelry Making', 'Pottery'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Jaipur', 'Kolkata', 'Chennai'];
  const statuses = ['active', 'alert_sent', 'call_pending', 'critical'];
  
  return names.map((name, index) => ({
    artisanId: `ART${1000 + index}`,
    artisanName: name,
    skill: skills[index % skills.length],
    location: locations[index % locations.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    daysInactive: Math.floor(Math.random() * 10),
    resilienceScore: 50 + Math.floor(Math.random() * 50),
    heritageScore: 60 + Math.floor(Math.random() * 40),
    lastActivityDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bulkOrder: Math.random() > 0.7 ? {
      orderName: 'Taj Hotels Wedding Collection',
      orderValue: '₹45,000'
    } : null
  }));
};

const generateMockInterventions = () => {
  const types = ['whatsapp_message', 'voice_call', 'community_alert'];
  const statuses = ['success', 'pending', 'failed'];
  const artisans = generateMockArtisans();
  
  return Array.from({ length: 20 }, (_, index) => {
    const artisan = artisans[index % artisans.length];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      interventionId: `INT${2000 + index}`,
      artisanId: artisan.artisanId,
      artisanName: artisan.artisanName,
      interventionType: type,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysInactive: Math.floor(Math.random() * 10),
      interventionCount: Math.floor(Math.random() * 5) + 1,
      successRate: 60 + Math.floor(Math.random() * 40),
      messageContent: type === 'whatsapp_message' ? 'नमस्ते! हमें आपकी चिंता है। क्या सब ठीक है?' : null,
      messageId: type === 'whatsapp_message' ? `MSG${Math.random().toString(36).substr(2, 9)}` : null,
      replyContent: Math.random() > 0.5 ? 'हाँ, सब ठीक है। धन्यवाद!' : null,
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
      replyTime: '2 hours',
      transcript: type === 'voice_call' ? 'Automated wellness check call delivered successfully.' : null,
      callId: type === 'voice_call' ? `CALL${Math.random().toString(36).substr(2, 9)}` : null,
      duration: type === 'voice_call' ? '45 seconds' : null,
      alertReason: type === 'community_alert' ? 'Extended inactivity detected - community support activated' : null,
      coordinatorsNotified: type === 'community_alert' ? 5 : null,
      artisansAlerted: type === 'community_alert' ? 10 : null
    };
  });
};

const generateMockEmergencyMessages = () => {
  const circumstances = [
    'Family illness - need to care for sick child',
    'Unexpected medical emergency',
    'Power outage affecting work',
    'Raw material shortage',
    'Transportation issues',
    'Family wedding preparations'
  ];
  
  const priorities = ['critical', 'high', 'medium'];
  const artisans = generateMockArtisans();
  
  return Array.from({ length: 8 }, (_, index) => {
    const artisan = artisans[index % artisans.length];
    
    return {
      messageId: `EMG${3000 + index}`,
      artisanId: artisan.artisanId,
      artisanName: artisan.artisanName,
      skill: artisan.skill,
      location: artisan.location,
      messageText: circumstances[index % circumstances.length],
      circumstance: circumstances[index % circumstances.length].split(' - ')[0],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: Math.random() > 0.5
    };
  });
};

// API Functions
export const fetchArtisans = async () => {
  if (MOCK_MODE) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockArtisans();
  }
  
  try {
    const response = await API.get('AISakhiAPI', '/artisans', {});
    return response.data;
  } catch (error) {
    console.error('Error fetching artisans:', error);
    throw error;
  }
};

export const fetchInterventions = async () => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockInterventions();
  }
  
  try {
    const response = await API.get('AISakhiAPI', '/interventions', {});
    return response.data;
  } catch (error) {
    console.error('Error fetching interventions:', error);
    throw error;
  }
};

export const fetchEmergencyMessages = async () => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockEmergencyMessages();
  }
  
  try {
    const response = await API.get('AISakhiAPI', '/emergency-messages', {});
    return response.data;
  } catch (error) {
    console.error('Error fetching emergency messages:', error);
    throw error;
  }
};

export const initiateManualCall = async (artisanId) => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Manual call initiated' };
  }
  
  try {
    const response = await API.post('AISakhiAPI', '/manual-call', {
      body: { artisanId }
    });
    return response.data;
  } catch (error) {
    console.error('Error initiating manual call:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId) => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
  
  try {
    const response = await API.put('AISakhiAPI', `/messages/${messageId}/read`, {});
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const escalateToComm unity = async (artisanId, reason) => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Community alert sent' };
  }
  
  try {
    const response = await API.post('AISakhiAPI', '/escalate', {
      body: { artisanId, reason }
    });
    return response.data;
  } catch (error) {
    console.error('Error escalating to community:', error);
    throw error;
  }
};
