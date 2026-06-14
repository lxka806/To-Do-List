import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

const VITE_URL = import.meta.env.VITE_URL;

// Avatar options for signup
const AVATARS = [
  { id: "avatar1", src: "https://ui-avatars.com/api/?background=3b82f6&color=fff&bold=true&size=80&name=U", label: "Blue", color: "#3b82f6" },
  { id: "avatar2", src: "https://ui-avatars.com/api/?background=06b6d4&color=fff&bold=true&size=80&name=U", label: "Cyan", color: "#06b6d4" },
  { id: "avatar3", src: "https://ui-avatars.com/api/?background=ef4444&color=fff&bold=true&size=80&name=U", label: "Red", color: "#ef4444" },
  { id: "avatar4", src: "https://ui-avatars.com/api/?background=8b5cf6&color=fff&bold=true&size=80&name=U", label: "Purple", color: "#8b5cf6" },
  { id: "avatar5", src: "https://ui-avatars.com/api/?background=10b981&color=fff&bold=true&size=80&name=U", label: "Green", color: "#10b981" },
  { id: "avatar6", src: "https://ui-avatars.com/api/?background=f59e0b&color=fff&bold=true&size=80&name=U", label: "Amber", color: "#f59e0b" },
];

function Signup() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].src);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 5);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#3b82f6", "#3b82f6"];

  const validateField = (field, value) => {
    switch (field) {
      case "fullname":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullname: validateField("fullname", fullname),
      email: validateField("email", email),
      password: validateField("password", password),
    };
    setErrors(newErrors);
    return !newErrors.fullname && !newErrors.email && !newErrors.password;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors({
      ...errors,
      [field]: validateField(field, field === "fullname" ? fullname : field === "email" ? email : password),
    });
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      setTouched({ fullname: true, email: true, password: true });
      setMessage("Please fix the errors above");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(`${VITE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          email,
          password,
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ ...data.user, avatar: selectedAvatar }));
        window.dispatchEvent(new Event("userchange"));
        setMessage("Account created successfully! Redirecting...");
        setMessageType("success");
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setMessage(data.message || "Signup failed. Please try again.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        {/* Header */}
        <div className="page-header">
          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
          <h1>Create Account</h1>
          <p>Join TaskFlow and start organizing your tasks</p>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`message-toast ${messageType}`}>
            <span>{messageType === "success" ? "✓" : "⚠️"}</span>
            {message}
          </div>
        )}

        {/* Signup Form */}
        <div className="signup-card">
          <form onSubmit={(e) => e.preventDefault()} className="signup-form">
            {/* Full Name Field */}
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value);
                  if (touched.fullname) {
                    setErrors({ ...errors, fullname: validateField("fullname", e.target.value) });
                  }
                }}
                onBlur={() => handleBlur("fullname")}
                onKeyPress={handleKeyPress}
                className={touched.fullname && errors.fullname ? "error" : ""}
              />
              {touched.fullname && errors.fullname && (
                <span className="error-msg">{errors.fullname}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    setErrors({ ...errors, email: validateField("email", e.target.value) });
                  }
                }}
                onBlur={() => handleBlur("email")}
                onKeyPress={handleKeyPress}
                className={touched.email && errors.email ? "error" : ""}
              />
              {touched.email && errors.email && (
                <span className="error-msg">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setErrors({ ...errors, password: validateField("password", e.target.value) });
                    }
                  }}
                  onBlur={() => handleBlur("password")}
                  onKeyPress={handleKeyPress}
                  className={touched.password && errors.password ? "error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`strength-bar ${i < passwordStrength ? "active" : ""}`}
                        style={{ backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : "#e2e8f0" }}
                      />
                    ))}
                  </div>
                  <span className="strength-text" style={{ color: strengthColors[passwordStrength - 1] }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
              
              {touched.password && errors.password && (
                <span className="error-msg">{errors.password}</span>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="input-group">
              <label>Choose Your Avatar</label>
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

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSignup}
              disabled={isLoading}
              className="signup-btn"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            {/* Login Link */}
            <div className="login-prompt">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;