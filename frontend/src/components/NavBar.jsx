import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const DEFAULT_AVATAR = "https://static.thenounproject.com/png/4530368-200.png";

const getUserFromStorage = () => {
    try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

function NavBar() {
    const storedUser = getUserFromStorage();
    const [avatar, setAvatar] = useState(storedUser?.avatar || DEFAULT_AVATAR);
    const [isLoggedIn, setIsLoggedIn] = useState(!!storedUser);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleUserChange = () => {
            const user = getUserFromStorage();
            setAvatar(user?.avatar || DEFAULT_AVATAR);
            setIsLoggedIn(!!user);
        };

        window.addEventListener("storage", handleUserChange);
        window.addEventListener("userchange", handleUserChange);
        return () => {
            window.removeEventListener("storage", handleUserChange);
            window.removeEventListener("userchange", handleUserChange);
        };
    }, []);

    const openProfile = () => {
        setIsMenuOpen(false);
        if (isLoggedIn) {
            navigate("/profile");
        } else {
            navigate("/login");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAvatar(DEFAULT_AVATAR);
        setIsLoggedIn(false);
        setIsMenuOpen(false);
        window.dispatchEvent(new Event("userchange"));
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-mark">FT</div>
                <div>
                    <span className="brand-name">FlowTask</span>
                    <span className="brand-tag">Productivity suite</span>
                </div>
            </div>

            <button className="nav-toggle" onClick={() => setIsMenuOpen((current) => !current)} aria-label="Toggle navigation menu">
                <span />
                <span />
                <span />
            </button>

            <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
                <NavLink end to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} onClick={() => setIsMenuOpen(false)}>
                    Home
                </NavLink>
                <NavLink to="/todos" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} onClick={() => setIsMenuOpen(false)}>
                    Todos
                </NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} onClick={() => setIsMenuOpen(false)}>
                    Leaderboard
                </NavLink>
                {isLoggedIn && (
                    <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} onClick={() => setIsMenuOpen(false)}>
                        Profile
                    </NavLink>
                )}
                {isLoggedIn && (
                    <button type="button" className="nav-link logout-link" onClick={handleLogout}>
                        Log out
                    </button>
                )}
            </div>

            <button className="profile-button" onClick={openProfile}>
                <img src={avatar} alt="Profile" />
            </button>
        </nav>
    );
}

export default NavBar;
