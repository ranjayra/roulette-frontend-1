import React, { useState, useEffect, useCallback } from "react";
import Auth from "./Auth";
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import "./App.css";

// 🎯 ROULETTE NUMBERS
const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17,
    34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14,
    31, 9, 22, 18, 29, 7, 28, 12,
    35, 3
];

const getColor = (num) => {
    if (num === 0) return "#2e7d32";
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? "#c62828" : "#1a1a1a";
};

// ✅ CORRECT BACKEND LIVE URL
const API_BASE_URL = "https://roulette-app-zov4.onrender.com";

// Navigation Bar Component
function NavigationBar({ user, onLogout, onAdminClick }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (onLogout) onLogout();
        navigate('/auth');
    };

    const handleAdminClick = () => {
        if (onAdminClick) onAdminClick();
        navigate('/admin-login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <h2>🎰 SRJ ROULETTE</h2>
            </div>
            <div className="nav-menu">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    🏠 Home
                </Link>
                <button onClick={handleAdminClick} className="nav-admin-btn">
                    👑 Admin
                </button>
                {user && (
                    <>
                        <span className="nav-username">
                            👤 {user.username || user.email?.split('@')[0]}
                        </span>
                        <span className="nav-balance">
                            💰 ₹{user.balance?.toLocaleString()}
                        </span>
                        <button onClick={handleLogout} className="nav-logout-btn">
                            🚪 Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

// Main Roulette Game Component
function RouletteGame() {
    const [rotation, setRotation] = useState(0);
    const [winningNumber, setWinningNumber] = useState(null);
    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(100);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [gameActive] = useState(true);
    const [ballXRotation, setBallXRotation] = useState(0);
    const [ballYRotation, setBallYRotation] = useState(0);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const angle = 360 / numbers.length;
    const POINTER_ANGLE = -90;

    const fetchHistory = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setHistory(Array.isArray(data) ? data : []);
        } catch {
            setHistory([]);
        }
    }, []);

    const fetchBalance = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/balance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.balance !== undefined) {
                setBalance(data.balance);
                // Update user object in localStorage
                const updatedUser = { ...user, balance: data.balance };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (error) {
            console.log("Balance fetch error:", error);
        }
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (token && savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setBalance(userData.balance);
            fetchHistory();
            fetchBalance();
        } else {
            navigate('/auth');
        }
    }, [navigate, fetchHistory, fetchBalance]); // ✅ Added missing dependencies

    const clearHistory = async () => {
        const confirmDelete = window.confirm("Delete all history?");
        if (!confirmDelete) return;
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE_URL}/api/history`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistory([]);
            alert("History cleared successfully!");
        } catch (err) {
            alert("Failed to delete history");
        }
    };

    const addMoney = async () => {
        const amount = prompt("Enter amount to add:", "1000");
        if (amount && !isNaN(amount) && Number(amount) > 0) {
            try {
                const token = localStorage.getItem("token");
                console.log("Adding money with token:", token);
                console.log("API URL:", `${API_BASE_URL}/api/add-balance`);
                
                const res = await fetch(`${API_BASE_URL}/api/add-balance`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ amount: Number(amount) })
                });
                
                console.log("Response status:", res.status);
                const data = await res.json();
                console.log("Response data:", data);
                
                if (data.balance !== undefined) {
                    setBalance(data.balance);
                    // Update user object in localStorage
                    const updatedUser = { ...user, balance: data.balance };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    alert(`✅ ₹${amount} added! New balance: ₹${data.balance}`);
                } else if (data.error) {
                    alert(`❌ Error: ${data.error}`);
                } else {
                    alert("Failed to add money. Please try again.");
                }
            } catch (error) {
                console.error("Add money error:", error);
                alert("Failed to add money. Check console for details.");
            }
        }
    };

    const spinWheel = () => {
        if (spinning) return;
        if (!gameActive) {
            alert("Game is paused by admin!");
            return;
        }
        if (selectedNumber === null) {
            alert("Select a number first!");
            return;
        }
        if (bet <= 0) {
            alert("Enter valid bet!");
            return;
        }
        if (bet > balance) {
            alert("Insufficient balance! Balance: ₹" + balance);
            return;
        }

        setSpinning(true);
        setBallXRotation(0);
        setBallYRotation(0);
        const token = localStorage.getItem("token");

        let ballXAngle = 0;
        let ballYAngle = 0;

        const ballXInterval = setInterval(() => {
            ballXAngle = (ballXAngle + 15) % 360;
            setBallXRotation(Math.sin(ballXAngle * Math.PI / 180) * 30);
        }, 50);

        const ballYInterval = setInterval(() => {
            ballYAngle = (ballYAngle + 12) % 360;
            setBallYRotation(Math.sin(ballYAngle * Math.PI / 180) * 20);
        }, 60);

        fetch(`${API_BASE_URL}/api/spin`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bet, selectedNumber })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    clearInterval(ballXInterval);
                    clearInterval(ballYInterval);
                    setSpinning(false);
                    return;
                }

                const winningNum = data.winningNumber;
                const winningIndex = numbers.indexOf(winningNum);
                const targetSegmentCenter = winningIndex * angle + angle / 2;
                let finalRotation = (POINTER_ANGLE - targetSegmentCenter + 360) % 360;
                finalRotation = (360 * 8) + finalRotation;

                setRotation(finalRotation);

                setTimeout(() => {
                    clearInterval(ballXInterval);
                    clearInterval(ballYInterval);
                    setWinningNumber(winningNum);
                    setBalance(data.balance);
                    // Update user object in localStorage
                    const updatedUser = { ...user, balance: data.balance };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    
                    if (data.result === "win") {
                        setMessage(`🎉 You WIN! +${data.winAmount}`);
                    } else {
                        setMessage(`❌ You LOSE! -${bet}`);
                    }
                    fetchHistory();
                    setSpinning(false);
                    setBallXRotation(0);
                    setBallYRotation(0);
                    setTimeout(() => setMessage(""), 3000);
                }, 4000);
            })
            .catch((error) => {
                console.error("Spin error:", error);
                alert("Server error: " + error.message);
                clearInterval(ballXInterval);
                clearInterval(ballYInterval);
                setSpinning(false);
            });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate('/auth');
    };

    if (!user) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a2e', color: 'white' }}>Loading...</div>;
    }

    return (
        <div className="container">
            <NavigationBar user={user} onLogout={handleLogout} onAdminClick={() => {}} />

            <div className="casino-top-banner">
                <h1>🎰 ROULETTE CASINO 🎰</h1>
                <p>SRJ GLOBAL TECHNOLOGY | European Roulette</p>
            </div>

            <div style={{ width: '100%' }}>
                <div className="balance-bar">
                    <span className="balance-amount">💰 BALANCE: ₹{balance.toLocaleString()}</span>
                    <button onClick={addMoney} className="add-money-nav-btn">➕ Add Money</button>
                    {!gameActive && <span className="game-paused-badge">⚠️ PAUSED</span>}
                </div>
            </div>

            <div className="game-layout">
                <div className="center-section">
                    <div className="bet-section">
                        <input
                            type="number"
                            placeholder="💰 Bet Amount"
                            value={bet}
                            onChange={(e) => setBet(Math.max(0, Number(e.target.value)))}
                            className="bet-input"
                            disabled={!gameActive || spinning}
                            min="1"
                        />
                        <button className="spin-btn" onClick={spinWheel} disabled={spinning || !gameActive}>
                            {spinning ? "🌀 SPINNING..." : "🎯 SPIN NOW"}
                        </button>
                    </div>

                    <div className="wheel-container">
                        <div className="pointer-top">
                            <div className="pointer-diamond"></div>
                        </div>
                        <div className="wheel-wrapper" style={{ transform: `rotate(${rotation}deg)` }}>
                            <svg width="320" height="320" viewBox="0 0 320 320">
                                <circle cx="160" cy="160" r="148" fill="none" stroke="#d4af37" strokeWidth="8" opacity="0.5" />
                                <circle cx="160" cy="160" r="144" fill="none" stroke="#ffd700" strokeWidth="3" strokeDasharray="4,4" />
                                <circle cx="160" cy="160" r="140" fill="none" stroke="#8b6914" strokeWidth="2" />
                                <circle cx="160" cy="160" r="135" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                                <circle cx="160" cy="160" r="132" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.8" />
                                {numbers.map((num, i) => {
                                    const startAngle = i * angle;
                                    const endAngle = (i + 1) * angle;
                                    const startRad = (startAngle * Math.PI) / 180;
                                    const endRad = (endAngle * Math.PI) / 180;
                                    const center = 160;
                                    const radius = 125;
                                    const x1 = center + radius * Math.cos(startRad);
                                    const y1 = center + radius * Math.sin(startRad);
                                    const x2 = center + radius * Math.cos(endRad);
                                    const y2 = center + radius * Math.sin(endRad);
                                    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
                                    const pathData = [`M ${center} ${center}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, 'Z'].join(' ');
                                    const midAngle = startAngle + angle / 2;
                                    const midRad = (midAngle * Math.PI) / 180;
                                    const textRadius = radius * 0.72;
                                    const textX = center + textRadius * Math.cos(midRad);
                                    const textY = center + textRadius * Math.sin(midRad);

                                    return (
                                        <g key={num}>
                                            <path d={pathData} fill={getColor(num)} stroke="#d4af37" strokeWidth="1.5" />
                                            <text x={textX} y={textY} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}>
                                                {num}
                                            </text>
                                        </g>
                                    );
                                })}
                                <circle cx="160" cy="160" r="100" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
                                <circle cx="160" cy="160" r="65" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="3,6" opacity="0.5" />
                                <circle cx="160" cy="160" r="35" fill="#d4af37" stroke="#8b6914" strokeWidth="3" />
                                <circle cx="160" cy="160" r="25" fill="#1a1a1a" />
                                <circle cx="160" cy="160" r="15" fill="#d4af37" />
                                <circle cx="160" cy="160" r="6" fill="#fff" />
                                <circle cx="160" cy="160" r="3" fill="#d4af37" />
                                <circle cx="160" cy="160" r="142" fill="none" stroke="rgba(255,215,0,0.15)" strokeWidth="14" />
                                <g transform={`translate(${ballXRotation}, ${ballYRotation})`}>
                                    <circle cx="160" cy="19" r="12" fill="rgba(255,215,0,0.2)" />
                                    <circle cx="160" cy="18" r="8" fill="#ffd700" stroke="#ff8c00" strokeWidth="2.5" />
                                    <circle cx="158" cy="16" r="3" fill="rgba(255,255,255,0.9)" />
                                    <line x1="160" y1="8" x2="160" y2="18" stroke="#8b6914" strokeWidth="1.5" opacity="0.6" />
                                </g>
                            </svg>
                        </div>
                        <div className="pointer-shadow"></div>
                    </div>

                    <div className="result-section">
                        {winningNumber !== null && (
                            <div className="result-card">
                                <h3>🎲 WINNING NUMBER</h3>
                                <div className="winner-number" style={{ background: getColor(winningNumber) }}>{winningNumber}</div>
                            </div>
                        )}
                        {message && <div className={`message ${message.includes("WIN") ? "win" : "lose"}`}>{message}</div>}
                    </div>

                    <div className="numbers-table">
                        <h3>🎯 SELECT YOUR NUMBER</h3>
                        <div className="table">
                            {numbers.map((num) => (
                                <div
                                    key={num}
                                    onClick={() => !spinning && gameActive && setSelectedNumber(num)}
                                    className={`cell ${selectedNumber === num ? "selected" : ""} ${winningNumber === num ? "win" : ""}`}
                                    style={{
                                        background: getColor(num),
                                        cursor: !spinning && gameActive ? 'pointer' : 'not-allowed',
                                        opacity: !spinning && gameActive ? 1 : 0.6
                                    }}
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="history-section-right">
                    <div className="history-header-right">
                        <h3>📜 WINNING HISTORY</h3>
                        <button onClick={clearHistory} disabled={history.length === 0} className="clear-btn-right">🗑️ Clear</button>
                    </div>
                    <div className="history-list">
                        {history.length > 0 ? (
                            history.filter(game => game.result === "win").map((game, index) => (
                                <div key={index} className="history-item-right">
                                    <span>🎯 {game.selectedNumber}</span>
                                    <span>→</span>
                                    <span>🎲 {game.winningNumber}</span>
                                    <span>💰 +{game.winAmount}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-history-right">No wins yet. Spin the wheel!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Admin Login Wrapper Component
function AdminLoginWrapper({ onAdminLogin }) {
    const navigate = useNavigate();

    const handleLogin = (adminData) => {
        if (onAdminLogin) {
            onAdminLogin(adminData);
        }
        navigate('/admin');
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div>
            <button 
                onClick={handleBack} 
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    padding: '10px 20px',
                    background: '#d4af37',
                    color: '#1a1a2e',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    zIndex: 1000
                }}
            >
                ← Back to Game
            </button>
            <AdminLogin onLogin={handleLogin} />
        </div>
    );
}

// Main App Component with Routing
export default function App() {
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        if (token && adminData) {
            setAdmin(JSON.parse(adminData));
        }
    }, []);

    const handleAdminLogin = (adminData) => {
        setAdmin(adminData);
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdmin(null);
        window.location.href = '/';
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<RouletteGame />} />
                <Route path="/auth" element={<Auth setIsLoggedIn={() => {}} setUser={() => {}} />} />
                <Route path="/admin-login" element={<AdminLoginWrapper onAdminLogin={handleAdminLogin} />} />
                <Route path="/admin" element={
                    admin ? (
                        <AdminPanel admin={admin} onLogout={handleAdminLogout} />
                    ) : (
                        <Navigate to="/" replace />
                    )
                } />
            </Routes>
        </Router>
    );
}