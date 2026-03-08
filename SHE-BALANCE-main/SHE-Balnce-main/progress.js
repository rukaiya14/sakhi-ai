// Progress Page JavaScript

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    animateProgressBars();
    animateCounters();
});

// Main Progress Chart
function initializeCharts() {
    // Main Growth Chart
    const mainCtx = document.getElementById('mainProgressChart');
    if (mainCtx) {
        new Chart(mainCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Income (₹)',
                    data: [4100, 4800, 5500, 6200, 6900, 7600],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: '500'
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return 'Income: ₹' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            },
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Income Breakdown Chart
    const incomeCtx = document.getElementById('incomeChart');
    if (incomeCtx) {
        new Chart(incomeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Embroidery', 'Cooking', 'Henna'],
                datasets: [{
                    data: [4200, 2400, 1000],
                    backgroundColor: [
                        '#667eea',
                        '#f093fb',
                        '#4facfe'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 13
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ₹' + value.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Time Allocation Chart
    const timeCtx = document.getElementById('timeChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Household Work', 'Career Time', 'Self Care'],
                datasets: [{
                    data: [5, 2, 1],
                    backgroundColor: [
                        '#43e97b',
                        '#f5576c',
                        '#feca57'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 13
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ' + value + ' hrs (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.goal-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width;
                entry.target.style.width = '0%';
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => observer.observe(bar));
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('.overview-info h3');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const isPercentage = target.includes('%');
        const isPlus = target.includes('+');
        const numericValue = parseFloat(target.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(numericValue)) {
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                
                let displayValue = current.toFixed(1);
                if (isPlus) displayValue = '+' + displayValue;
                if (isPercentage) displayValue += '%';
                if (target.includes('hrs')) displayValue += ' hrs';
                
                counter.textContent = displayValue;
            }, 20);
        }
    });
}

// Chart period selector
function setChartPeriod(period) {
    // Remove active class from all buttons
    document.querySelectorAll('.chart-controls .btn-outline').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Update chart data based on period
    // This would typically fetch new data from an API
    console.log('Chart period changed to:', period);
}

// Export progress report
function exportProgress() {
    alert('Exporting your progress report as PDF...');
    // Implementation would generate and download PDF
}

// Share progress
function shareProgress() {
    if (navigator.share) {
        navigator.share({
            title: 'My SheBalance Progress',
            text: 'Check out my amazing progress on SheBalance! 300% income growth! 🎉',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        alert('Sharing your progress on social media...');
    }
}


// Modal Functions
function openModal(type) {
    const modal = document.getElementById('progressModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    let title = '';
    let content = '';
    
    switch(type) {
        case 'incomeGrowth':
            title = '📈 Income Growth Details';
            content = `
                <div class="detail-row">
                    <span class="detail-label-modal">Starting Income (Jan 2024)</span>
                    <span class="detail-value-modal">₹4,100</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">Current Income (Jun 2024)</span>
                    <span class="detail-value-modal">₹7,600</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">Total Growth</span>
                    <span class="detail-value-modal" style="color: #43e97b;">+₹3,500 (+85%)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">Average Monthly Growth</span>
                    <span class="detail-value-modal">₹583</span>
                </div>
                <div style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Monthly Breakdown</h3>
                    <div class="detail-row">
                        <span class="detail-label-modal">January</span>
                        <span class="detail-value-modal">₹4,100</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">February</span>
                        <span class="detail-value-modal">₹4,800 <span style="color: #43e97b; font-size: 0.9rem;">(+17%)</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">March</span>
                        <span class="detail-value-modal">₹5,500 <span style="color: #43e97b; font-size: 0.9rem;">(+15%)</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">April</span>
                        <span class="detail-value-modal">₹6,200 <span style="color: #43e97b; font-size: 0.9rem;">(+13%)</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">May</span>
                        <span class="detail-value-modal">₹6,900 <span style="color: #43e97b; font-size: 0.9rem;">(+11%)</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">June</span>
                        <span class="detail-value-modal">₹7,600 <span style="color: #43e97b; font-size: 0.9rem;">(+10%)</span></span>
                    </div>
                </div>
            `;
            break;
            
        case 'skillsImproved':
            title = '⭐ Skills Improved';
            content = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Your Skill Journey</h3>
                    <p style="color: #666; line-height: 1.6;">You've made significant progress in 3 key areas over the past 6 months!</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">🧵 Embroidery</h4>
                        <span style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem;">Advanced</span>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin: 10px 0;">Mastered Zardozi and Chikankari techniques</p>
                    <div class="progress-bar-modal">
                        <div class="progress-fill-modal" style="width: 92%;"></div>
                    </div>
                    <div style="text-align: right; margin-top: 5px; color: #667eea; font-weight: 600;">92%</div>
                </div>
                
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">👩‍🍳 Cooking</h4>
                        <span style="background: #f093fb; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem;">Intermediate</span>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin: 10px 0;">Expanded menu with 15 new recipes</p>
                    <div class="progress-bar-modal">
                        <div class="progress-fill-modal" style="width: 78%; background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);"></div>
                    </div>
                    <div style="text-align: right; margin-top: 5px; color: #f093fb; font-weight: 600;">78%</div>
                </div>
                
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">🎨 Henna Art</h4>
                        <span style="background: #4facfe; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem;">Beginner</span>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin: 10px 0;">Learning Arabic and bridal designs</p>
                    <div class="progress-bar-modal">
                        <div class="progress-fill-modal" style="width: 45%; background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);"></div>
                    </div>
                    <div style="text-align: right; margin-top: 5px; color: #4facfe; font-weight: 600;">45%</div>
                </div>
            `;
            break;
            
        case 'timeSaved':
            title = '⏰ Time Saved Daily';
            content = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Time Optimization</h3>
                    <p style="color: #666; line-height: 1.6;">Through smart scheduling and efficient workflows, you're saving 1.5 hours every day!</p>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label-modal">Daily Time Saved</span>
                    <span class="detail-value-modal" style="color: #43e97b;">1.5 hours</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">Weekly Time Saved</span>
                    <span class="detail-value-modal">10.5 hours</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">Monthly Time Saved</span>
                    <span class="detail-value-modal">45 hours</span>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; color: #333;">How You're Saving Time</h3>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">📱</span>
                            <h4 style="margin: 0; color: #333;">Smart Scheduling</h4>
                        </div>
                        <p style="color: #666; font-size: 0.9rem; margin: 0;">AI-powered calendar optimization saves 30 min/day</p>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">🤖</span>
                            <h4 style="margin: 0; color: #333;">Automated Tasks</h4>
                        </div>
                        <p style="color: #666; font-size: 0.9rem; margin: 0;">Order management automation saves 45 min/day</p>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">✅</span>
                            <h4 style="margin: 0; color: #333;">Efficient Workflows</h4>
                        </div>
                        <p style="color: #666; font-size: 0.9rem; margin: 0;">Streamlined processes save 15 min/day</p>
                    </div>
                </div>
            `;
            break;
            
        case 'goalAchievement':
            title = '🏆 Goal Achievement';
            content = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Your Progress Towards Goals</h3>
                    <p style="color: #666; line-height: 1.6;">You're 68% of the way to achieving all your set goals. Keep going!</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">Monthly Income Target</h4>
                        <span style="color: #667eea; font-weight: 700;">76%</span>
                    </div>
                    <div class="progress-bar-modal">
                        <div class="progress-fill-modal" style="width: 76%;"></div>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">₹7,600 / ₹10,000</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">Skill Certifications</h4>
                        <span style="color: #f093fb; font-weight: 700;">33%</span>
                    </div>
                    <div class="progress-bar-modal">
                        <div class="progress-fill-modal" style="width: 33%; background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);"></div>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">1 / 3 Completed</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333;">Network Connections</h4>
                        <span style="color: #4facfe; font-weight: 700;">60%</span>
                    </div>
                    <div class="progress-bar-modal">
                        <div class="progress-fill-modal" style="width: 60%; background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);"></div>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">18 / 30 Connections</p>
                </div>
            `;
            break;
            
        case 'totalEarnings':
            title = '💰 Total Earnings Breakdown';
            content = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">6-Month Earnings Summary</h3>
                    <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white; margin-bottom: 20px;">
                        <div style="font-size: 3rem; font-weight: 700;">₹38,000</div>
                        <p style="margin: 10px 0 0 0; opacity: 0.95;">Total Earnings (Jan - Jun 2024)</p>
                    </div>
                </div>
                
                <h3 style="margin-bottom: 15px; color: #333;">Monthly Earnings</h3>
                <div class="detail-row">
                    <span class="detail-label-modal">January 2024</span>
                    <span class="detail-value-modal">₹4,100</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">February 2024</span>
                    <span class="detail-value-modal">₹4,800</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">March 2024</span>
                    <span class="detail-value-modal">₹5,500</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">April 2024</span>
                    <span class="detail-value-modal">₹6,200</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">May 2024</span>
                    <span class="detail-value-modal">₹6,900</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label-modal">June 2024</span>
                    <span class="detail-value-modal">₹7,600</span>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Income Sources</h3>
                    <div class="detail-row">
                        <span class="detail-label-modal">Embroidery (55%)</span>
                        <span class="detail-value-modal">₹20,900</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">Cooking (32%)</span>
                        <span class="detail-value-modal">₹12,160</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">Henna Art (13%)</span>
                        <span class="detail-value-modal">₹4,940</span>
                    </div>
                </div>
            `;
            break;
            
        case 'networkConnections':
            title = '👥 Network Connections';
            content = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Your Growing Network</h3>
                    <p style="color: #666; line-height: 1.6;">You've connected with 18 amazing women entrepreneurs!</p>
                </div>
                
                <h3 style="margin-bottom: 15px; color: #333;">Recent Connections</h3>
                
                <div class="connection-item">
                    <div class="connection-avatar">SD</div>
                    <div class="connection-info">
                        <h4>Sunita Devi</h4>
                        <p>Embroidery Expert • Connected 2 weeks ago</p>
                    </div>
                </div>
                
                <div class="connection-item">
                    <div class="connection-avatar" style="background: linear-gradient(135deg, #f093fb, #f5576c);">MP</div>
                    <div class="connection-info">
                        <h4>Meera Patel</h4>
                        <p>Home Chef • Connected 3 weeks ago</p>
                    </div>
                </div>
                
                <div class="connection-item">
                    <div class="connection-avatar" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">KS</div>
                    <div class="connection-info">
                        <h4>Kavya Singh</h4>
                        <p>Catering Business Owner • Connected 1 month ago</p>
                    </div>
                </div>
                
                <div class="connection-item">
                    <div class="connection-avatar" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">FK</div>
                    <div class="connection-info">
                        <h4>Fatima Khan</h4>
                        <p>Henna Artist • Connected 1 month ago</p>
                    </div>
                </div>
                
                <div class="connection-item">
                    <div class="connection-avatar" style="background: linear-gradient(135deg, #fa709a, #fee140);">LR</div>
                    <div class="connection-info">
                        <h4>Lakshmi Reddy</h4>
                        <p>Tiffin Service Provider • Connected 2 months ago</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <p style="color: #666; margin: 0;">+ 13 more connections</p>
                </div>
            `;
            break;
            
        case 'ordersCompleted':
            title = '📦 Orders Completed';
            content = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Order History</h3>
                    <p style="color: #666; line-height: 1.6;">You've successfully completed 42 orders with excellent customer satisfaction!</p>
                </div>
                
                <h3 style="margin-bottom: 15px; color: #333;">Recent Orders</h3>
                
                <div class="order-item-modal">
                    <div class="order-header">
                        <span class="order-name">Bridal Lehenga Embroidery</span>
                        <span class="order-amount">₹2,500</span>
                    </div>
                    <div class="order-date">Completed: June 20, 2024</div>
                </div>
                
                <div class="order-item-modal">
                    <div class="order-header">
                        <span class="order-name">Weekly Tiffin Service (5 days)</span>
                        <span class="order-amount">₹1,200</span>
                    </div>
                    <div class="order-date">Completed: June 18, 2024</div>
                </div>
                
                <div class="order-item-modal">
                    <div class="order-header">
                        <span class="order-name">Bridal Mehendi Design</span>
                        <span class="order-amount">₹800</span>
                    </div>
                    <div class="order-date">Completed: June 15, 2024</div>
                </div>
                
                <div class="order-item-modal">
                    <div class="order-header">
                        <span class="order-name">Custom Saree Blouse</span>
                        <span class="order-amount">₹600</span>
                    </div>
                    <div class="order-date">Completed: June 12, 2024</div>
                </div>
                
                <div class="order-item-modal">
                    <div class="order-header">
                        <span class="order-name">Party Catering (20 people)</span>
                        <span class="order-amount">₹3,500</span>
                    </div>
                    <div class="order-date">Completed: June 8, 2024</div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Order Statistics</h3>
                    <div class="detail-row">
                        <span class="detail-label-modal">Total Orders</span>
                        <span class="detail-value-modal">42</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">Average Order Value</span>
                        <span class="detail-value-modal">₹905</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">Completion Rate</span>
                        <span class="detail-value-modal" style="color: #43e97b;">100%</span>
                    </div>
                </div>
            `;
            break;
            
        case 'averageRating':
            title = '⭐ Customer Reviews';
            content = `
                <div style="margin-bottom: 25px;">
                    <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 15px; margin-bottom: 20px;">
                        <div style="font-size: 4rem; font-weight: 700; color: #333;">4.6</div>
                        <div style="font-size: 2rem; color: #ffd700; margin: 10px 0;">★★★★★</div>
                        <p style="margin: 0; color: #666;">Based on 28 reviews</p>
                    </div>
                </div>
                
                <h3 style="margin-bottom: 15px; color: #333;">Recent Reviews</h3>
                
                <div class="rating-item">
                    <div class="rating-stars">★★★★★</div>
                    <div class="rating-comment">"Absolutely beautiful embroidery work! The attention to detail is amazing. Highly recommend!"</div>
                    <div class="rating-author">- Priya Sharma, June 2024</div>
                </div>
                
                <div class="rating-item">
                    <div class="rating-stars">★★★★★</div>
                    <div class="rating-comment">"Best tiffin service in the area! Food is always fresh and delicious. Thank you!"</div>
                    <div class="rating-author">- Anjali Verma, June 2024</div>
                </div>
                
                <div class="rating-item">
                    <div class="rating-stars">★★★★☆</div>
                    <div class="rating-comment">"Great mehendi design for my wedding. Very professional and creative!"</div>
                    <div class="rating-author">- Neha Kumar, May 2024</div>
                </div>
                
                <div class="rating-item">
                    <div class="rating-stars">★★★★★</div>
                    <div class="rating-comment">"Excellent work on the saree blouse. Perfect fit and beautiful stitching!"</div>
                    <div class="rating-author">- Lakshmi Reddy, May 2024</div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Rating Breakdown</h3>
                    <div class="detail-row">
                        <span class="detail-label-modal">5 Stars</span>
                        <span class="detail-value-modal">22 reviews (79%)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">4 Stars</span>
                        <span class="detail-value-modal">5 reviews (18%)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label-modal">3 Stars</span>
                        <span class="detail-value-modal">1 review (3%)</span>
                    </div>
                </div>
            `;
            break;
    }
    
    modalTitle.innerHTML = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    const modal = document.getElementById('progressModal');
    if (!event || event.target === modal || event.type === 'click') {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
