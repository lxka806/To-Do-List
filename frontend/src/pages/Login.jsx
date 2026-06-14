import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const VITE_URL = import.meta.env.VITE_URL;
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setMessage("");
        setMessageType("");

        try {
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
                window.dispatchEvent(new Event("userchange"));
                setMessage("Login successful! Redirecting...");
                setMessageType("success");
                
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } else {
                setMessage(data.message || "Login failed. Please try again.");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("Network error. Please check your connection.");
            setMessageType("error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                {/* Header */}
                <div className="page-header">
                    <Link to="/" className="back-home">
                        ← Back to Home
                    </Link>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to your dashboard</p>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`message-toast ${messageType}`}>
                        <span>{messageType === "success" ? "✓" : "⚠️"}</span>
                        {message}
                    </div>
                )}

                {/* Login Form */}
                <div className="login-card">
                    <form onSubmit={(e) => e.preventDefault()} className="login-form">
                        {/* Email Field */}
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: "" });
                                }}
                                onKeyPress={handleKeyPress}
                                className={errors.email ? "error" : ""}
                            />
                            {errors.email && (
                                <span className="error-msg">{errors.email}</span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: "" });
                                    }}
                                    onKeyPress={handleKeyPress}
                                    className={errors.password ? "error" : ""}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="error-msg">{errors.password}</span>
                            )}
                        </div>

                        {/* Additional Options */}
                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="general-error">
                                <span>⚠️</span> {errors.general}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="login-btn"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>

                        {/* Sign Up Link */}
                        <div className="signup-prompt">
                            Don't have an account? <Link to="/signup">Create Account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;