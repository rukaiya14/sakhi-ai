/**
 * Growth Roadmap Component
 * Displays artisan's personalized growth path as a vertical timeline
 */

import React, { useState, useEffect } from 'react';
import './GrowthRoadmap.css';

const GrowthRoadmap = ({ artisanId }) => {
    const [growthPath, setGrowthPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const [nextAction, setNextAction] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchGrowthPath();
    }, [artisanId]);

    const fetchGrowthPath = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('shebalance_token');
            
            const response = await fetch('http://localhost:5000/api/growth-path', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                // No growth path exists yet
                setGrowthPath(null);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch growth path');
            }

            const data = await response.json();
            setGrowthPath(data.growthPath);
            setOverallProgress(data.overallProgress);
            setNextAction(data.nextAction);
            setLoading(false);

        } catch (err) {
            console.error('Error fetching growth path:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const generateGrowthPath = async () => {
        try {
            setGenerating(true);
            const token = localStorage.getItem('shebalance_token');
            
            const response = await fetch('http://localhost:5000/api/growth-path/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate growth path');
            }

            const data = await response.json();
            setGrowthPath(data.growthPath);
            setGenerating(false);
            
            // Refresh to get progress data
            await fetchGrowthPath();

        } catch (err) {
            console.error('Error generating growth path:', err);
            setError(err.message);
            setGenerating(false);
        }
    };

    const updateStepProgress = async (stepNumber, completed) => {
        try {
            const token = localStorage.getItem('shebalance_token');
            
            const response = await fetch(`http://localhost:5000/api/growth-path/step/${stepNumber}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed,
                    progress: completed ? 100 : 0
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update step');
            }

            // Refresh growth path
            await fetchGrowthPath();

        } catch (err) {
            console.error('Error updating step:', err);
            alert('Failed to update step progress');
        }
    };

    if (loading) {
        return (
            <div className="growth-roadmap-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading your growth path...</p>
                </div>
            </div>
        );
    }

    if (!growthPath) {
        return (
            <div className="growth-roadmap-container">
                <div className="no-path-card">
                    <i className="fas fa-route"></i>
                    <h2>Create Your Growth Path</h2>
                    <p>Get a personalized roadmap to advance your skills and qualify for high-value orders.</p>
                    <button 
                        className="btn-generate-path"
                        onClick={generateGrowthPath}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Generating...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-magic"></i> Generate My Growth Path
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="growth-roadmap-container">
            {/* Header */}
            <div className="roadmap-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-route"></i> Your Growth Roadmap
                    </h1>
                    <p className="subtitle">Powered by AI - Personalized for You</p>
                </div>
                <button 
                    className="btn-regenerate"
                    onClick={generateGrowthPath}
                    disabled={generating}
                >
                    <i className="fas fa-sync-alt"></i> Regenerate
                </button>
            </div>

            {/* Overall Progress */}
            <div className="overall-progress-card">
                <div className="progress-header">
                    <h3>Overall Progress</h3>
                    <span className="progress-percentage">{overallProgress}%</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
                <div className="progress-info">
                    <div className="info-item">
                        <i className="fas fa-bullseye"></i>
                        <span>Target: {growthPath.target_tier}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-clock"></i>
                        <span>Timeline: {growthPath.estimated_timeline}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-chart-line"></i>
                        <span>Cluster: {growthPath.target_cluster}</span>
                    </div>
                </div>
            </div>

            {/* Current Status */}
            <div className="current-status-card">
                <h3>
                    <i className="fas fa-map-marker-alt"></i> Current Status
                </h3>
                <div className="status-content">
                    <div className="tier-badge">{growthPath.current_milestone?.tier}</div>
                    <p>{growthPath.current_milestone?.description}</p>
                    {growthPath.current_milestone?.strengths && (
                        <div className="strengths-list">
                            <strong>Your Strengths:</strong>
                            <ul>
                                {growthPath.current_milestone.strengths.map((strength, idx) => (
                                    <li key={idx}>
                                        <i className="fas fa-check-circle"></i> {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Next Action */}
            {nextAction && (
                <div className="next-action-card">
                    <h3>
                        <i className="fas fa-arrow-right"></i> Next Action
                    </h3>
                    <div className="action-content">
                        <h4>{nextAction.milestoneName}</h4>
                        <p>{nextAction.description}</p>
                        <div className="action-timeline">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{nextAction.timeline}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Steps */}
            <div className="timeline-container">
                <h3>
                    <i className="fas fa-list-ol"></i> Your Roadmap Steps
                </h3>
                
                <div className="timeline">
                    {growthPath.actionable_steps?.map((step, index) => (
                        <div 
                            key={index} 
                            className={`timeline-item ${step.completed ? 'completed' : ''}`}
                        >
                            <div className="timeline-marker">
                                {step.completed ? (
                                    <i className="fas fa-check-circle"></i>
                                ) : (
                                    <span className="step-number">{step.step_number}</span>
                                )}
                            </div>
                            
                            <div className="timeline-content">
                                <div className="step-header">
                                    <h4>{step.milestone_name}</h4>
                                    <span className="step-timeline">
                                        <i className="fas fa-clock"></i> {step.timeline}
                                    </span>
                                </div>
                                
                                <p className="step-description">{step.description}</p>
                                
                                {/* Techniques to Master */}
                                <div className="techniques-section">
                                    <strong>
                                        <i className="fas fa-tools"></i> Techniques to Master:
                                    </strong>
                                    <ul className="techniques-list">
                                        {step.techniques_to_master?.map((technique, idx) => (
                                            <li key={idx}>{technique}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Time Investment */}
                                <div className="time-investment">
                                    <div className="time-item">
                                        <i className="fas fa-hammer"></i>
                                        <span>Craft: {step.craft_hours}h</span>
                                    </div>
                                    <div className="time-item">
                                        <i className="fas fa-home"></i>
                                        <span>Household: {step.household_hours}h</span>
                                    </div>
                                    <div className="time-item total">
                                        <i className="fas fa-clock"></i>
                                        <span>Total: {step.invisible_labor_hours}h</span>
                                    </div>
                                </div>
                                
                                {/* Success Criteria */}
                                <div className="success-criteria">
                                    <strong>
                                        <i className="fas fa-trophy"></i> Success Criteria:
                                    </strong>
                                    <ul>
                                        {step.success_criteria?.map((criteria, idx) => (
                                            <li key={idx}>{criteria}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Resources Needed */}
                                {step.resources_needed && step.resources_needed.length > 0 && (
                                    <div className="resources-needed">
                                        <strong>
                                            <i className="fas fa-box"></i> Resources Needed:
                                        </strong>
                                        <ul>
                                            {step.resources_needed.map((resource, idx) => (
                                                <li key={idx}>{resource}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Mark Complete Button */}
                                <div className="step-actions">
                                    <button
                                        className={`btn-mark-complete ${step.completed ? 'completed' : ''}`}
                                        onClick={() => updateStepProgress(step.step_number, !step.completed)}
                                    >
                                        {step.completed ? (
                                            <>
                                                <i className="fas fa-check"></i> Completed
                                            </>
                                        ) : (
                                            <>
                                                <i className="far fa-circle"></i> Mark as Complete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
                <div className="info-card">
                    <h4>
                        <i className="fas fa-chart-line"></i> Potential Earnings Increase
                    </h4>
                    <p className="earnings-value">{growthPath.potential_earnings_increase}</p>
                </div>
                
                {growthPath.recommended_training && (
                    <div className="info-card">
                        <h4>
                            <i className="fas fa-graduation-cap"></i> Recommended Training
                        </h4>
                        <ul>
                            {growthPath.recommended_training.map((training, idx) => (
                                <li key={idx}>{training}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {growthPath.mentorship_opportunities && (
                    <div className="info-card">
                        <h4>
                            <i className="fas fa-user-friends"></i> Mentorship Opportunities
                        </h4>
                        <ul>
                            {growthPath.mentorship_opportunities.map((opportunity, idx) => (
                                <li key={idx}>{opportunity}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="roadmap-footer">
                <p>
                    <i className="fas fa-robot"></i> Generated by Claude 3.5 Sonnet via Amazon Bedrock
                </p>
                <p className="timestamp">
                    Last updated: {new Date(growthPath.generated_at).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default GrowthRoadmap;
