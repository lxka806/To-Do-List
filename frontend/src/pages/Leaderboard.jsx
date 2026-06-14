import { useEffect, useState } from "react";

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
        getLeaderboard();
    }, []);

    return (
        <main className="leaderboard-page">
            <section className="leaderboard-header">
                <h1>Leaderboard</h1>
                {errorMessage && <p className="error">{errorMessage}</p>}
            </section>

            {isLoading ? (
                <p>Loading leaderboard...</p>
            ) : leaderboard.length === 0 ? (
                <p>No leaderboard data available yet.</p>
            ) : (
                <section className="leaderboard-list">
                    {leaderboard.map((user, index) => (
                        <article key={user._id} className="leaderboard-item">
                            <div className="leaderboard-rank">#{index + 1}</div>
                            <div>
                                <h2>{user.fullname}</h2>
                                <p>Completed Tasks: {user.completedTasks}</p>
                                <p>Total Tasks: {user.totalTasks}</p>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Leaderboard;
