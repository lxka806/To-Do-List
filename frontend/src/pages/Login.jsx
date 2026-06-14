import { useState } from "react";
import { useNavigate } from "react-router-dom"

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const VITE_URL = import.meta.env.VITE_URL

    const navigate = useNavigate()


    const handleLogin = async () => {
        const res = await fetch(`${VITE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert("Login successful");
            navigate("/");
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
        <h2>Login</h2>

        <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;