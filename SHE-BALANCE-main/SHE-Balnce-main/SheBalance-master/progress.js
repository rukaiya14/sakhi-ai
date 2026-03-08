// Progress Page JavaScript

let mainChart, incomeChart, timeChart;

// Initialize all charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Progress page loaded, initializing charts...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Initialize charts after a short delay
    setTimeout(() => {
        initializeMainChart();
        initializeIncomeChart();
        initializeTimeChart();
    }, 500);
    
    // Load user name
    const userData = JSON.parse(localStorage.getItem('shebalance_user_data') || '{}');
    if (userData.fullName) {
        const userNameElement = document.getElementById('userNameProfile');
        if (userNameElement) {
            userNameElement.textContent = userData.fullName;
        }
    }
});

// Main Progress Chart
function initializeMainChart() {
    const ctx = document.getElementById('mainProgressChart');
    if (!ctx) {
        console.log('Main chart canvas not found');
        return;
    }

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Monthly Income (₹)',
                data: [3000, 4500, 6200, 8500, 11000, 12500],
                borderColor: '#5D4037',
                backgroundColor: 'rgba(93, 64, 55, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: 'Skills Mastered',
                data: [1, 2, 2, 3, 4, 5],
                borderColor: '#CC5500',
                backgroundColor: 'rgba(204, 85, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                yAxisID: 'y1'
            },
            {
                label: 'Time Saved (hrs/day)',
                data: [0.5, 1.2, 1.8, 2.5, 3.0, 3.5],
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                yAxisID: 'y2'
            }
        ]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1A1A1A',
                    bodyColor: '#666666',
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(224, 224, 224, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Income (₹)',
                        color: '#5D4037'
                    },
                    grid: {
                        color: 'rgba(224, 224, 224, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#5D4037',
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Skills',
                        color: '#CC5500'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        color: '#CC5500',
                        stepSize: 1
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    min: 0,
                    max: 4
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    };

    try {
        mainChart = new Chart(ctx, config);
        console.log('Main chart initialized successfully');
    } catch (error) {
        console.error('Error initializing main chart:', error);
    }
}

// Income Breakdown Chart (Doughnut)
function initializeIncomeChart() {
    const ctx = document.getElementById('incomeChart');
    if (!ctx) return;

    const config = {
        type: 'doughnut',
        data: {
            labels: ['Embroidery', 'Cooking', 'Henna'],
            datasets: [{
                data: [7500, 3200, 1800],
                backgroundColor: [
                    '#5D4037',
                    '#CC5500',
                    '#8D6E63'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₹' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    };

    try {
        incomeChart = new Chart(ctx, config);
    } catch (error) {
        console.error('Error initializing income chart:', error);
    }
}

// Time Allocation Chart (Doughnut)
function initializeTimeChart() {
    const ctx = document.getElementById('timeChart');
    if (!ctx) return;

    const config = {
        type: 'doughnut',
        data: {
            labels: ['Household Work', 'Career Time', 'Self Care'],
            datasets: [{
                data: [4.5, 2, 1.5],
                backgroundColor: [
                    '#FF9800',
                    '#2E7D32',
                    '#2196F3'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' hours';
                        }
                    }
                }
            }
        }
    };

    try {
        timeChart = new Chart(ctx, config);
    } catch (error) {
        console.error('Error initializing time chart:', error);
    }
}

// Chart period controls
function setChartPeriod(period) {
    // Remove active class from all buttons
    document.querySelectorAll('.chart-controls .btn-outline').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Update chart data based on period
    if (mainChart) {
        let newData, newLabels;
        
        switch(period) {
            case '6months':
                newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                newData = {
                    income: [3000, 4500, 6200, 8500, 11000, 12500],
                    skills: [1, 2, 2, 3, 4, 5],
                    time: [0.5, 1.2, 1.8, 2.5, 3.0, 3.5]
                };
                break;
            case '1year':
                newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                newData = {
                    income: [2000, 3000, 4500, 6200, 8500, 11000, 12500, 14000, 15500, 16800, 18000, 19500],
                    skills: [0, 1, 2, 2, 3, 4, 5, 6, 7, 8, 8, 9],
                    time: [0, 0.5, 1.2, 1.8, 2.5, 3.0, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8]
                };
                break;
            case 'all':
                newLabels = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'];
                newData = {
                    income: [1500, 2200, 3800, 5500, 8200, 12500],
                    skills: [0, 1, 2, 3, 4, 5],
                    time: [0, 0.8, 1.5, 2.2, 2.8, 3.5]
                };
                break;
        }
        
        mainChart.data.labels = newLabels;
        mainChart.data.datasets[0].data = newData.income;
        mainChart.data.datasets[1].data = newData.skills;
        mainChart.data.datasets[2].data = newData.time;
        mainChart.update('active');
    }
}

// Voice command integration
function startVoiceCommand() {
    alert('Voice command integration coming soon! You\'ll be able to say things like "Show my progress this month" or "What are my top achievements?".');
}

// Export functions for global access
window.setChartPeriod = setChartPeriod;
window.startVoiceCommand = startVoiceCommand;