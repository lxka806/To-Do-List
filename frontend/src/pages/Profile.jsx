import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VITE_URL = import.meta.env.VITE_URL;
const DEFAULT_AVATAR = "https://static.thenounproject.com/png/4530368-200.png";
const AVATARS = [
  { id: "avatar1", src: "https://static.thenounproject.com/png/4530368-200.png", label: "Blue avatar" },
  { id: "avatar2", src: "https://static.thenounproject.com/png/4487819-200.png", label: "Green avatar" },
  { id: "avatar3", src: "https://static.thenounproject.com/png/4728467-200.png", label: "Red avatar" },
  { id: "avatar4", src: "https://static.thenounproject.com/png/4728485-200.png", label: "Purple avatar" },
];

function Profile() {
  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setSelectedAvatar(data.user.avatar || "");
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      setMessage(error.message);
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
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <main className="profile-page">
      <section className="profile-header">
        <h1>My Profile</h1>
        {message && <p className="message">{message}</p>}
      </section>

      {isLoading ? (
        <p>Loading profile...</p>
      ) : user ? (
        <section className="profile-card">
          <img
            className="profile-avatar"
            src={user.avatar || DEFAULT_AVATAR}
            alt={`${user.fullname} avatar`}
          />
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {user.fullname}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Total Tasks:</strong> {user.totalTasks ?? 0}
            </p>
          </div>

          <form className="profile-form" onSubmit={updateProfile}>
            <p>Select a profile avatar:</p>
            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`avatar-option ${selectedAvatar === avatar.src ? "selected" : ""}`}
                  onClick={() => setSelectedAvatar(avatar.src)}
                >
                  <img src={avatar.src} alt={avatar.label} />
                  <span>{avatar.label}</span>
                </button>
              ))}
            </div>

            <button type="submit" disabled={isLoading || !selectedAvatar}>
              {isLoading ? "Saving..." : "Save avatar"}
            </button>
          </form>
        </section>
      ) : (
        <p>Unable to load profile.</p>
      )}
    </main>
  );
}

export default Profile;
