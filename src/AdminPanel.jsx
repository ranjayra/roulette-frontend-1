import React, { useState, useEffect } from 'react';

// ✅ BACKEND LIVE URL - Same as App.jsx
const API_BASE_URL = "https://roulette-app-zov4.onrender.com";

function AdminPanel({ admin, onLogout }) {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            console.log("Fetching users with token:", token);
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Users fetched:", data);
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            console.log("Fetching stats with token:", token);
            const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Stats fetched:", data);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
            // Set default stats if API fails
            setStats({
                totalUsers: 0,
                activeUsers: 0,
                totalGames: 0,
                totalWins: 0,
                totalBets: 0
            });
        }
    };

    const updateUserBalance = async (userId, newBalance) => {
        if (!userId || newBalance === undefined || newBalance === null) {
            alert("Invalid user ID or balance");
            return;
        }
        
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ balance: Number(newBalance) })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update balance');
            }
            
            const data = await response.json();
            console.log("Balance updated:", data);
            alert('✅ Balance updated successfully!');
            fetchUsers(); // Refresh users list
        } catch (error) {
            console.error('Failed to update balance:', error);
            alert(`❌ Failed to update balance: ${error.message}`);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            
            if (!response.ok) {
                throw new Error('Failed to toggle user status');
            }
            
            alert(`✅ User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            fetchUsers(); // Refresh users list
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            alert('❌ Failed to toggle user status');
        }
    };

    const deleteUser = async (userId) => {
        const confirm = window.confirm("Are you sure you want to delete this user?");
        if (!confirm) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            
            alert('✅ User deleted successfully!');
            fetchUsers(); // Refresh users list
            fetchStats(); // Refresh stats
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('❌ Failed to delete user');
        }
    };

    const refreshData = () => {
        fetchUsers();
        fetchStats();
    };

    if (loading && users.length === 0) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                background: '#1a1a2e', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>🔄 Loading Admin Panel...</h2>
                    <p>Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a2e', color: 'white' }}>
            <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap' 
            }}>
                <h1 style={{ margin: 0 }}>👑 SRJ GLOBAL TECHNOLOGY - Admin Panel</h1>
                <div>
                    <span style={{ marginRight: '20px' }}>Welcome, {admin?.username || admin?.email || 'Admin'}</span>
                    <button 
                        onClick={refreshData}
                        style={{ 
                            padding: '8px 20px', 
                            cursor: 'pointer', 
                            background: '#d4af37', 
                            color: '#1a1a2e', 
                            border: 'none', 
                            borderRadius: '5px',
                            marginRight: '10px'
                        }}
                    >
                        🔄 Refresh
                    </button>
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

            <div style={{ display: 'flex', gap: '10px', padding: '20px', background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap' }}>
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
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '20px', padding: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <h3>Total Users</h3>
                            <p style={{ fontSize: '32px', margin: 0, color: '#d4af37' }}>{stats.totalUsers || 0}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <h3>Active Users</h3>
                            <p style={{ fontSize: '32px', margin: 0, color: '#4caf50' }}>{stats.activeUsers || 0}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <h3>Total Games</h3>
                            <p style={{ fontSize: '32px', margin: 0, color: '#2196f3' }}>{stats.totalGames || 0}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <h3>Total Wins</h3>
                            <p style={{ fontSize: '32px', margin: 0, color: '#4caf50' }}>{stats.totalWins || 0}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <h3>Total Bets</h3>
                            <p style={{ fontSize: '32px', margin: 0, color: '#ff9800' }}>₹{(stats.totalBets || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <h3>Win Rate</h3>
                            <p style={{ fontSize: '32px', margin: 0, color: '#d4af37' }}>
                                {stats.totalGames > 0 ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#d4af37' }}>👥 User Management</h3>
                        <div>
                            <span style={{ marginRight: '10px' }}>Total: {users.length} users</span>
                        </div>
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(212,175,55,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Balance</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Games</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Wins</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
                                        <p>No users found</p>
                                        <button onClick={fetchUsers}>🔄 Refresh</button>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <td style={{ padding: '12px' }}>
                                            <strong>{user.username || 'N/A'}</strong>
                                        </td>
                                        <td style={{ padding: '12px' }}>{user.email || 'N/A'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                defaultValue={user.balance}
                                                onBlur={(e) => updateUserBalance(user._id, e.target.value)}
                                                style={{ 
                                                    padding: '5px', 
                                                    borderRadius: '5px', 
                                                    width: '100px',
                                                    background: '#333',
                                                    color: 'white',
                                                    border: '1px solid #d4af37'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>{user.totalGames || 0}</td>
                                        <td style={{ padding: '12px' }}>{user.totalWins || 0}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => toggleUserStatus(user._id, user.isActive)}
                                                style={{
                                                    padding: '5px 10px',
                                                    cursor: 'pointer',
                                                    background: user.isActive ? '#4caf50' : '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px'
                                                }}
                                            >
                                                {user.isActive ? '🟢 Active' : '🔴 Blocked'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => deleteUser(user._id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    cursor: 'pointer',
                                                    background: '#e74c3c',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px'
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
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