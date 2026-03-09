// Learning Hours Tracker JavaScript

let learningEntries = [];
let editingIndex = -1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadLearningData();
    updateStats();
    renderEntries();
    renderSkillProgress();
    renderAchievements();
    setDefaultDate();
});

// Load data from localStorage
function loadLearningData() {
    const savedData = localStorage.getItem('shebalance_learning_hours');
    if (savedData) {
        learningEntries = JSON.parse(savedData);
    } else {
        // Sample data for demonstration
        learningEntries = [
            {
                skillName: 'Advanced Embroidery Techniques',
                category: 'Craft Skills',
                hours: 3,
                date: '2024-02-26',
                notes: 'Learned mirror work and zardozi techniques. Practiced on sample fabric.'
            },
            {
                skillName: 'Social Media Marketing',
                category: 'Digital Skills',
                hours: 2,
                date: '2024-02-25',
                notes: 'Completed online course module on Instagram marketing for artisans.'
            },
            {
                skillName: 'Traditional Indian Desserts',
                category: 'Culinary Arts',
                hours: 4,
                date: '2024-02-24',
                notes: 'Mastered gulab jamun and rasgulla recipes. Practiced portion control.'
            },
            {
                skillName: 'Business Accounting Basics',
                category: 'Business Skills',
                hours: 2.5,
                date: '2024-02-23',
                notes: 'Learned about profit margins, expense tracking, and basic bookkeeping.'
            }
        ];
        saveLearningData();
    }
}

// Save data to localStorage
function saveLearningData() {
    localStorage.setItem('shebalance_learning_hours', JSON.stringify(learningEntries));
}

// Update statistics
function updateStats() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate total hours this month
    const totalHours = learningEntries
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        })
        .reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
    
    // Count unique skills
    const uniqueSkills = new Set(learningEntries.map(e => e.skillName)).size;
    
    // Calculate streak
    const streak = calculateStreak();
    
    // Count achievements
    const achievements = calculateAchievements();
    
    // Update UI
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('skillsCount').textContent = uniqueSkills;
    document.getElementById('achievementsCount').textContent = achievements.length;
    document.getElementById('streakDays').textContent = streak;
}

// Calculate learning streak
function calculateStreak() {
    if (learningEntries.length === 0) return 0;
    
    const sortedDates = learningEntries
        .map(e => new Date(e.date))
        .sort((a, b) => b - a);
    
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i]);
        const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            streak++;
            currentDate = prevDate;
        } else if (dayDiff > 1) {
            break;
        }
    }
    
    return streak;
}

// Calculate achievements
function calculateAchievements() {
    const achievements = [];
    const totalHours = learningEntries.reduce((sum, e) => sum + parseFloat(e.hours), 0);
    
    if (totalHours >= 10) achievements.push({ name: 'First 10 Hours', icon: 'fa-star' });
    if (totalHours >= 50) achievements.push({ name: '50 Hours Milestone', icon: 'fa-medal' });
    if (totalHours >= 100) achievements.push({ name: 'Century Club', icon: 'fa-trophy' });
    if (learningEntries.length >= 10) achievements.push({ name: '10 Sessions', icon: 'fa-check-circle' });
    if (calculateStreak() >= 7) achievements.push({ name: '7 Day Streak', icon: 'fa-fire' });
    
    return achievements;
}

// Render learning entries
function renderEntries() {
    const container = document.getElementById('learningEntries');
    
    if (learningEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No learning sessions yet</h3>
                <p>Start tracking your learning journey by logging your first session!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedEntries = [...learningEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedEntries.map((entry, index) => {
        const originalIndex = learningEntries.indexOf(entry);
        const categoryColors = {
            'Craft Skills': '#E8F5E9',
            'Culinary Arts': '#FFF3E0',
            'Digital Skills': '#E3F2FD',
            'Business Skills': '#F3E5F5',
            'Language': '#FCE4EC',
            'Other': '#F5F5F5'
        };
        
        const categoryTextColors = {
            'Craft Skills': '#2E7D32',
            'Culinary Arts': '#f57c00',
            'Digital Skills': '#1976d2',
            'Business Skills': '#7b1fa2',
            'Language': '#C2185B',
            'Other': '#666'
        };
        
        return `
            <div class="learning-entry">
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${entry.skillName}</div>
                        <span class="entry-category" style="background: ${categoryColors[entry.category]}; color: ${categoryTextColors[entry.category]};">
                            ${entry.category}
                        </span>
                    </div>
                    <div class="entry-actions">
                        <button class="btn-action btn-edit" onclick="editEntry(${originalIndex})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteEntry(${originalIndex})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-details">
                    <div class="entry-detail">
                        <i class="fas fa-clock"></i>
                        <span>${entry.hours} hours</span>
                    </div>
                    <div class="entry-detail">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(entry.date)}</span>
                    </div>
                </div>
                ${entry.notes ? `<p style="margin-top: 12px; color: #666; font-size: 14px; line-height: 1.6;">${entry.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Render skill progress
function renderSkillProgress() {
    const container = document.getElementById('skillProgress');
    
    // Group by skill and calculate total hours
    const skillHours = {};
    learningEntries.forEach(entry => {
        if (!skillHours[entry.skillName]) {
            skillHours[entry.skillName] = 0;
        }
        skillHours[entry.skillName] += parseFloat(entry.hours);
    });
    
    // Get top 5 skills
    const topSkills = Object.entries(skillHours)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (topSkills.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No skills tracked yet</p>';
        return;
    }
    
    const maxHours = Math.max(...topSkills.map(s => s[1]));
    
    container.innerHTML = topSkills.map(([skill, hours]) => {
        const percentage = (hours / maxHours) * 100;
        return `
            <div class="progress-item">
                <div class="progress-label">
                    <span style="font-weight: 500; color: #5D4037;">${skill}</span>
                    <span style="font-weight: 600; color: #C97D60;">${hours.toFixed(1)}h</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Render achievements
function renderAchievements() {
    const container = document.getElementById('achievementsList');
    const achievements = calculateAchievements();
    
    if (achievements.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; font-size: 14px;">Complete learning sessions to unlock achievements!</p>';
        return;
    }
    
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-badge">
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <h4>${achievement.name}</h4>
                <p>Achievement unlocked!</p>
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Open add modal
function openAddModal() {
    editingIndex = -1;
    document.getElementById('modalTitle').textContent = 'Log Learning Hours';
    document.getElementById('learningForm').reset();
    setDefaultDate();
    document.getElementById('learningModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('learningModal').classList.remove('active');
    document.getElementById('learningForm').reset();
    editingIndex = -1;
}

// Edit entry
function editEntry(index) {
    editingIndex = index;
    const entry = learningEntries[index];
    
    document.getElementById('modalTitle').textContent = 'Edit Learning Entry';
    document.getElementById('skillName').value = entry.skillName;
    document.getElementById('category').value = entry.category;
    document.getElementById('hours').value = entry.hours;
    document.getElementById('date').value = entry.date;
    document.getElementById('notes').value = entry.notes || '';
    
    document.getElementById('learningModal').classList.add('active');
}

// Delete entry
function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this learning entry?')) {
        learningEntries.splice(index, 1);
        saveLearningData();
        updateStats();
        renderEntries();
        renderSkillProgress();
        renderAchievements();
        showNotification('Learning entry deleted successfully!', 'success');
    }
}

// Save learning entry
function saveLearningEntry(event) {
    event.preventDefault();
    
    const entry = {
        skillName: document.getElementById('skillName').value,
        category: document.getElementById('category').value,
        hours: parseFloat(document.getElementById('hours').value),
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value
    };
    
    if (editingIndex >= 0) {
        learningEntries[editingIndex] = entry;
        showNotification('Learning entry updated successfully!', 'success');
    } else {
        learningEntries.push(entry);
        showNotification('Learning entry added successfully!', 'success');
    }
    
    saveLearningData();
    updateStats();
    renderEntries();
    renderSkillProgress();
    renderAchievements();
    closeModal();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
