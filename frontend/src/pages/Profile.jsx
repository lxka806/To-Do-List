import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const VITE_URL = import.meta.env.VITE_URL;
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=120";

const AVATARS = [
  { id: "avatar1", src: "https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=80&name=U", label: "Blue", color: "#3b82f6" },
  { id: "avatar2", src: "https://ui-avatars.com/api/?background=06b6d4&color=fff&bold=true&size=80&name=U", label: "Cyan", color: "#06b6d4" },
  { id: "avatar3", src: "https://ui-avatars.com/api/?background=ef4444&color=fff&bold=true&size=80&name=U", label: "Red", color: "#ef4444" },
  { id: "avatar4", src: "https://ui-avatars.com/api/?background=8b5cf6&color=fff&bold=true&size=80&name=U", label: "Purple", color: "#8b5cf6" },
  { id: "avatar5", src: "https://ui-avatars.com/api/?background=10b981&color=fff&bold=true&size=80&name=U", label: "Green", color: "#10b981" },
  { id: "avatar6", src: "https://ui-avatars.com/api/?background=f59e0b&color=fff&bold=true&size=80&name=U", label: "Amber", color: "#f59e0b" },
];

const ACHIEVEMENTS = [
  { id: "first_task", icon: "✅", name: "First Step", description: "Completed first task", requirement: 1 },
  { id: "task_master", icon: "📋", name: "Task Master", description: "Completed 10 tasks", requirement: 10 },
  { id: "productivity_guru", icon: "📈", name: "Productivity Guru", description: "Completed 50 tasks", requirement: 50 },
  { id: "perfectionist", icon: "⭐", name: "Perfectionist", description: "100% completion rate", requirement: 100 },
];

function Profile() {
  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${VITE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile.");

      setUser(data.user);
      setSelectedAvatar(data.user.avatar || AVATARS[0].src);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedAvatar) {
      setMessage("Please choose an avatar.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${VITE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: selectedAvatar }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userchange"));
      setMessage("Profile updated successfully!");
      setMessageType("success");
      
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const totalTasks = user?.totalTasks || 0;
  const completedTasks = user?.completedTasks || 0;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const earnedAchievements = ACHIEVEMENTS.filter(achievement => {
    if (achievement.id === "first_task") return completedTasks >= 1;
    if (achievement.id === "task_master") return completedTasks >= 10;
    if (achievement.id === "productivity_guru") return completedTasks >= 50;
    if (achievement.id === "perfectionist") return productivityScore === 100 && totalTasks > 0;
    return false;
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading && !user) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load profile</h3>
          <p>Please try again later.</p>
          <button onClick={fetchProfile} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Profile</h1>
            <p>Manage your account and track your progress</p>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`message-toast ${messageType}`}>
            <span>{messageType === "success" ? "✓" : "⚠️"}</span>
            {message}
          </div>
        )}

        {/* Tabs */}
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <img
                  className="profile-avatar"
                  src={user?.avatar || DEFAULT_AVATAR}
                  alt={`${user?.fullname} avatar`}
                />
              </div>
              <h2>{user?.fullname}</h2>
              <p className="user-email">{user?.email}</p>
            </div>


            <form className="profile-form" onSubmit={updateProfile}>
              <div className="form-section">
                <h3>Choose Your Avatar</h3>
                <div className="avatar-grid">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={`avatar-option ${selectedAvatar === avatar.src ? "selected" : ""}`}
                      onClick={() => setSelectedAvatar(avatar.src)}
                    >
                      <img src={avatar.src} alt={avatar.label} />
                      {selectedAvatar === avatar.src && <div className="avatar-check">✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="save-btn">
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="stats-card">
            <div className="stats-header">
              <h3>Your Productivity Dashboard</h3>
            </div>
            
            <div className="stats-visualization">
              {/* Progress Ring */}
              <div className="progress-ring-container">
                <div className="progress-ring">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle
                      className="progress-ring-bg"
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      className="progress-ring-fill"
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - productivityScore / 100)}`}
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div className="progress-center">
                    <span className="progress-percentage">{productivityScore}%</span>
                    <span className="progress-label">Productivity</span>
                  </div>
                </div>
              </div>

              {/* Stats Bars */}
              <div className="stats-bars">
                <div className="stat-bar-item">
                  <div className="stat-bar-header">
                    <span>Completed</span>
                    <span>{completedTasks} / {totalTasks}</span>
                  </div>
                  <div className="stat-bar-bg">
                    <div className="stat-bar-fill completed" style={{ width: `${productivityScore}%` }}></div>
                  </div>
                </div>
                <div className="stat-bar-item">
                  <div className="stat-bar-header">
                    <span>Pending</span>
                    <span>{totalTasks - completedTasks} / {totalTasks}</span>
                  </div>
                  <div className="stat-bar-bg">
                    <div className="stat-bar-fill pending" style={{ width: `${100 - productivityScore}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="motivation-message">
              {productivityScore === 100 && totalTasks > 0 && "🎉 Perfect score! You're crushing it!"}
              {productivityScore >= 70 && productivityScore < 100 && "🚀 Amazing progress! Keep going!"}
              {productivityScore >= 30 && productivityScore < 70 && "💪 You're on the right track!"}
              {productivityScore < 30 && totalTasks > 0 && "🌱 Every task counts. You've got this!"}
              {totalTasks === 0 && "✨ Create your first task to get started!"}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="achievements-card">
            <div className="achievements-header">
              <h3>Badges & Achievements</h3>
              <span className="achievement-count">{earnedAchievements.length} / {ACHIEVEMENTS.length}</span>
            </div>

            <div className="achievements-grid">
              {ACHIEVEMENTS.map((achievement) => {
                const earned = earnedAchievements.some(a => a.id === achievement.id);
                return (
                  <div key={achievement.id} className={`achievement-item ${earned ? "earned" : "locked"}`}>
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-details">
                      <h4>{achievement.name}</h4>
                      <p>{achievement.description}</p>
                    </div>
                    <div className="achievement-status">
                      {earned ? "✓ Earned" : "🔒 Locked"}
                    </div>
                  </div>
                );
              })}
            </div>

            {earnedAchievements.length === ACHIEVEMENTS.length && (
              <div className="completion-message">
                🏆 Congratulations! You're an achievement master! 🏆
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;