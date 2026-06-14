import { useEffect, useState } from "react";
import "./Leaderboard.css";

const VITE_URL = import.meta.env.VITE_URL;

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getLeaderboard = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const res = await fetch(`${VITE_URL}/api/leaderboard`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Unable to load leaderboard.");
            }

            setLeaderboard(data);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadLeaderboard = async () => {
            await getLeaderboard();
        };

        loadLeaderboard();

        const handleUserChange = () => {
            loadLeaderboard();
        };

        window.addEventListener("userchange", handleUserChange);
        return () => {
            window.removeEventListener("userchange", handleUserChange);
        };
    }, []);

    const topThree = leaderboard.slice(0, 3);

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-content">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Leaderboard</h1>
                        <p>Top performers ranked by completed tasks</p>
                    </div>
                    <div className="total-users-badge">
                        <span className="badge-icon">👥</span>
                        <span>{leaderboard.length} participants</span>
                    </div>
                </div>

                {errorMessage && (
                    <div className="error-message">
                        <span>⚠️</span> {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏆</div>
                        <h3>No data yet</h3>
                        <p>Complete tasks to appear on the leaderboard!</p>
                    </div>
                ) : (
                    <>
                        {/* Podium Section */}
                        {topThree.length > 0 && (
                            <div className="podium-section">
                                <div className="podium">
                                    {/* 2nd Place */}
                                    {topThree[1] && (
                                        <div className="podium-place second">
                                            <div className="podium-rank">2</div>
                                            <div className="podium-avatar">
                                                {topThree[1].fullname?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="podium-name">{topThree[1].fullname?.split(" ")[0] || "User"}</div>
                                            <div className="podium-stats">
                                                <span>✅ {topThree[1].completedTasks || 0}</span>
                                            </div>
                                            <div className="podium-pedestal"></div>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {topThree[0] && (
                                        <div className="podium-place first">
                                            <div className="crown">👑</div>
                                            <div className="podium-rank">1</div>
                                            <div className="podium-avatar">
                                                {topThree[0].fullname?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="podium-name">{topThree[0].fullname?.split(" ")[0] || "User"}</div>
                                            <div className="podium-stats">
                                                <span>✅ {topThree[0].completedTasks || 0}</span>
                                            </div>
                                            <div className="podium-pedestal first-pedestal"></div>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {topThree[2] && (
                                        <div className="podium-place third">
                                            <div className="podium-rank">3</div>
                                            <div className="podium-avatar">
                                                {topThree[2].fullname?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="podium-name">{topThree[2].fullname?.split(" ")[0] || "User"}</div>
                                            <div className="podium-stats">
                                                <span>✅ {topThree[2].completedTasks || 0}</span>
                                            </div>
                                            <div className="podium-pedestal"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ranking Table */}
                        <div className="ranking-table-wrapper">
                            <div className="table-header">
                                <h3>All Rankings</h3>
                                <span className="table-count">{leaderboard.length} total</span>
                            </div>
                            <div className="ranking-table">
                                <div className="table-row header">
                                    <div className="col-rank">Rank</div>
                                    <div className="col-user">User</div>
                                    <div className="col-completed">Completed</div>
                                    <div className="col-total">Total</div>
                                    <div className="col-rate">Rate</div>
                                </div>
                                {leaderboard.map((user, idx) => {
                                    const rank = idx + 1;
                                    const isTop3 = rank <= 3;
                                    const completionRate = user.totalTasks > 0 
                                        ? Math.round((user.completedTasks / user.totalTasks) * 100) 
                                        : 0;
                                    
                                    return (
                                        <div key={user._id} className={`table-row ${isTop3 ? "top-three" : ""}`}>
                                            <div className="col-rank">
                                                <span className={`rank-number ${rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : ""}`}>
                                                    #{rank}
                                                </span>
                                            </div>
                                            <div className="col-user">
                                                <div className="user-info">
                                                    <div className="user-avatar" style={{ backgroundColor: isTop3 ? "#3b82f6" : "#94a3b8" }}>
                                                        {user.fullname?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <span className="user-name">{user.fullname || "Anonymous User"}</span>
                                                </div>
                                            </div>
                                            <div className="col-completed">
                                                <span className="completed-count">{user.completedTasks || 0}</span>
                                            </div>
                                            <div className="col-total">
                                                {user.totalTasks || 0}
                                            </div>
                                            <div className="col-rate">
                                                <div className="rate-bar">
                                                    <div className="rate-fill" style={{ width: `${completionRate}%` }}></div>
                                                    <span className="rate-value">{completionRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Motivational Message */}
                        {leaderboard.length > 0 && (
                            <div className="motivation-message">
                                <span>💪</span>
                                <span>Complete more tasks to climb the ranks!</span>
                                <span>🏆</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;