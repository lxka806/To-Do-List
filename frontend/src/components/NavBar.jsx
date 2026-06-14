import { NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav className="navbar">
            <div>Todo List</div>
            <div>
                <NavLink to="/">
                    Home
                </NavLink>
                <NavLink to="/signup">
                    Signup
                </NavLink>
                <NavLink to="/login" >
                    Login
                </NavLink>
            </div>
        </nav>
    );
}

export default NavBar;
