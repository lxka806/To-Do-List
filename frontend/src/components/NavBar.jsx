import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const DEFAULT_AVATAR = "https://static.thenounproject.com/png/4530368-200.png";

function NavBar() {
    const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setAvatar(user.avatar || DEFAULT_AVATAR);
            } catch {
                setAvatar(DEFAULT_AVATAR);
            }
        }
    }, []);

    const openProfile = () => {
        navigate("/profile");
    };

    return (
        <nav className="navbar">
            <div>Todo List</div>
            <div>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/signup">Signup</NavLink>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/leaderboard">Leaderboard</NavLink>
                <button type="button" className="profile-button" onClick={openProfile}>
                    <img
                        src={avatar}
                        alt="Profile"
                        className="profile-avatar"
                    />
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
