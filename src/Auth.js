import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ YEH IMPORT KARO

export default function Auth({ setIsLoggedIn, setUser }) {
    const navigate = useNavigate(); // ✅ YEH ADD KARO
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async() => {
        setLoading(true);
        setError("");

        const url = isLogin ?
            "http://localhost:5000/api/auth/login" :
            "http://localhost:5000/api/auth/register";

        const body = isLogin ? { email, password } : { username, email, password };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            console.log("LOGIN RESPONSE:", data);

            if (res.ok && data.success) {
                if (isLogin) {
                    // Save token and user data
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user);
                    setIsLoggedIn(true);
                    navigate("/"); // ✅ YEH ADD KARO - Home page pe redirect
                } else {
                    alert("✅ Signup successful! Please login.");
                    setIsLogin(true);
                    setUsername("");
                    setEmail("");
                    setPassword("");
                }
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return ( <
        div style = {
            {
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
                padding: "20px"
            }
        } >
        <
        div style = {
            {
                background: "rgba(0, 0, 0, 0.85)",
                borderRadius: "20px",
                padding: "40px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 0 30px rgba(255, 215, 0, 0.2)",
                border: "1px solid rgba(255, 215, 0, 0.3)"
            }
        } >
        <
        div style = {
            { textAlign: "center", marginBottom: "30px" } } >
        <
        h2 style = {
            {
                fontSize: "28px",
                background: "linear-gradient(135deg, gold, orange)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                marginBottom: "10px"
            }
        } > 🎰ROULETTE GAME < /h2> <
        p style = {
            { color: "#ccc", fontSize: "14px" } } > { isLogin ? "Welcome Back!" : "Create New Account" } <
        /p> <
        /div>

        <
        div style = {
            { display: "flex", flexDirection: "column", gap: "15px" } } > {!isLogin && ( <
                input type = "text"
                placeholder = "👤 Username"
                value = { username }
                onChange = {
                    (e) => setUsername(e.target.value) }
                style = {
                    {
                        padding: "12px 15px",
                        borderRadius: "10px",
                        border: "2px solid rgba(255, 215, 0, 0.3)",
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "14px",
                        outline: "none"
                    }
                }
                />
            )
        }

        <
        input type = "email"
        placeholder = "📧 Email"
        value = { email }
        onChange = {
            (e) => setEmail(e.target.value) }
        style = {
            {
                padding: "12px 15px",
                borderRadius: "10px",
                border: "2px solid rgba(255, 215, 0, 0.3)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "14px",
                outline: "none"
            }
        }
        />

        <
        input type = "password"
        placeholder = "🔒 Password"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        onKeyPress = {
            (e) => e.key === 'Enter' && handleSubmit() }
        style = {
            {
                padding: "12px 15px",
                borderRadius: "10px",
                border: "2px solid rgba(255, 215, 0, 0.3)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "14px",
                outline: "none"
            }
        }
        />

        {
            error && ( <
                div style = {
                    {
                        background: "rgba(231, 76, 60, 0.2)",
                        color: "#e74c3c",
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        textAlign: "center"
                    }
                } > { error } <
                /div>
            )
        }

        <
        button onClick = { handleSubmit }
        disabled = { loading }
        style = {
            {
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #f39c12, #e67e22)",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
                opacity: loading ? 0.6 : 1
            }
        } >
        { loading ? "Loading..." : (isLogin ? "Login" : "Signup") } <
        /button>

        <
        p onClick = {
            () => {
                setIsLogin(!isLogin);
                setError("");
            }
        }
        style = {
            {
                textAlign: "center",
                marginTop: "20px",
                color: "gold",
                cursor: "pointer",
                fontSize: "14px"
            }
        } >
        { isLogin ? "🆕 New user? Create Account" : "🔙 Back to Login" } <
        /p> <
        /div> <
        /div> <
        /div>
    );
}