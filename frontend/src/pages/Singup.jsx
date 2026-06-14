import { useState } from "react";
import { useNavigate } from "react-router-dom"

function Signup() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    const VITE_URL = import.meta.env.VITE_URL

    const handleSignup = async () => {
        const res = await fetch(`${VITE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fullname,
            email,
            password,
        }),
        });

        const data = await res.json();
        setMessage(data.message);

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/");
        }
    };

    return (
        <div>
        <h2>Signup</h2>

        <input
            placeholder="Full name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
        />

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

        <button onClick={handleSignup}>Sign up</button>
        <hr />
        <h3>{message}</h3>
        </div>
    );
}

export default Signup;