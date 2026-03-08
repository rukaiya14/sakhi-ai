# How to Access AI Learning Mentor

## Three Ways to Access

### 1. From Dashboard Sidebar (Easiest)
1. Go to: `http://localhost:8080/dashboard.html`
2. Look at the left sidebar
3. Click on **"AI Learning Mentor"** (with purple NEW badge)
4. You'll be taken to the AI Learning Mentor page

### 2. From Dashboard Feature Card
1. Go to: `http://localhost:8080/dashboard.html`
2. Scroll down to see the purple gradient card with robot icon
3. Click the **"Start Learning"** button
4. You'll be taken to the AI Learning Mentor page

### 3. Direct URL
Simply go to: `http://localhost:8080/ai-learning-mentor.html`

## What You Added to Dashboard

### Sidebar Navigation
Added a new menu item:
- Icon: Graduation cap
- Text: "AI Learning Mentor"
- Badge: Purple "NEW" badge
- Link: `ai-learning-mentor.html`

### Feature Card
Added a prominent purple gradient card showing:
- Large robot icon
- Title: "Your AI Learning Mentor"
- Subtitle: "Get personalized learning roadmaps and career guidance"
- Three feature boxes:
  - Personalized Paths
  - Track Progress
  - Career Growth
- "Start Learning" button

## Quick Test

Run this command:
```bash
.\test-ai-learning-mentor.bat
```

Or manually:
1. Make sure backend is running: `cd backend && node server.js`
2. Make sure frontend is running: `node frontend-server.js`
3. Open: `http://localhost:8080/dashboard.html`
4. Click "AI Learning Mentor" in sidebar

## What You'll See

### On Dashboard
- New sidebar menu item with purple badge
- Large purple feature card promoting the AI Learning Mentor

### On AI Learning Mentor Page
- Purple gradient hero section
- 4 feature cards (Personalized Paths, Flexible Scheduling, Progress Tracking, Career Opportunities)
- Chat interface with AI mentor
- Quick action buttons
- Progress tracking sidebar
- Current milestones

## Features Available

1. **Chat with AI Mentor**
   - Ask about learning paths
   - Get skill recommendations
   - Career guidance
   - Progress tracking

2. **Quick Actions**
   - Create Learning Path
   - Skill Recommendations
   - My Progress
   - Career Opportunities

3. **Progress Display**
   - Overall learning progress
   - Skills mastered counter
   - Learning hours tracker

4. **Milestones**
   - Current learning goals
   - Achievement tracking

## Backend Integration

The AI Learning Mentor connects to:
- `/api/ai-mentor/chat` - For AI conversations
- `/api/learning/progress` - For progress data
- DynamoDB - For user skills and SkillScan results

Uses the same AI provider as AI Sakhi (Bedrock or Groq).

## Summary

You can now access the AI Learning Mentor from:
1. Dashboard sidebar (click "AI Learning Mentor")
2. Dashboard feature card (click "Start Learning")
3. Direct URL: `http://localhost:8080/ai-learning-mentor.html`

The feature is fully integrated with your dashboard and backend!
