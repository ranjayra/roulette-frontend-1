import React, { useState, useEffect } from 'react';

function AdminPanel({ admin, onLogout }) {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const updateUserBalance = async (userId, newBalance) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`http://localhost:5000/api/admin/users/${userId}/balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ balance: Number(newBalance) })
            });
            fetchUsers();
            alert('Balance updated successfully!');
        } catch (error) {
            alert('Failed to update balance');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a2e', color: 'white' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0 }}>👑 SRJ GLOBAL TECHNOLOGY - Admin Panel</h1>
                <div>
                    <span style={{ marginRight: '20px' }}>Welcome, {admin?.username}</span>
                    <button 
                        onClick={onLogout} 
                        style={{ 
                            padding: '8px 20px', 
                            cursor: 'pointer', 
                            background: '#e74c3c', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px' 
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '20px', background: 'rgba(0,0,0,0.2)' }}>
                <button 
                    onClick={() => setActiveTab('dashboard')} 
                    style={{ 
                        padding: '10px 20px', 
                        cursor: 'pointer', 
                        background: activeTab === 'dashboard' ? '#d4af37' : '#333', 
                        color: activeTab === 'dashboard' ? '#1a1a2e' : 'white', 
                        border: 'none', 
                        borderRadius: '5px' 
                    }}
                >
                    📊 Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('users')} 
                    style={{ 
                        padding: '10px 20px', 
                        cursor: 'pointer', 
                        background: activeTab === 'users' ? '#d4af37' : '#333', 
                        color: activeTab === 'users' ? '#1a1a2e' : 'white', 
                        border: 'none', 
                        borderRadius: '5px' 
                    }}
                >
                    👥 Users
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '20px', padding: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3>Total Users</h3>
                        <p style={{ fontSize: '32px', margin: 0 }}>{stats.totalUsers || 0}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3>Active Users</h3>
                        <p style={{ fontSize: '32px', margin: 0 }}>{stats.activeUsers || 0}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3>Total Games</h3>
                        <p style={{ fontSize: '32px', margin: 0 }}>{stats.totalGames || 0}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3>Total Wins</h3>
                        <p style={{ fontSize: '32px', margin: 0 }}>{stats.totalWins || 0}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h3>Total Bets</h3>
                        <p style={{ fontSize: '32px', margin: 0 }}>₹{(stats.totalBets || 0).toLocaleString()}</p>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '20px', color: '#d4af37' }}>👥 User Management</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(212,175,55,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Balance</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Games</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Wins</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No users found</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <td style={{ padding: '12px' }}>{user.username}</td>
                                        <td style={{ padding: '12px' }}>{user.email}</td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                defaultValue={user.balance}
                                                onBlur={(e) => updateUserBalance(user._id, e.target.value)}
                                                style={{ padding: '5px', borderRadius: '5px', width: '100px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>{user.totalGames || 0}</td>
                                        <td style={{ padding: '12px' }}>{user.totalWins || 0}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ color: user.isActive ? '#4caf50' : '#f44336' }}>
                                                {user.isActive ? '🟢 Active' : '🔴 Blocked'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;