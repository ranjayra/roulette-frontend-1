import React, { useState } from 'react';

// ✅ BACKEND LIVE URL - Add this at top
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://roulette-app-zov4.onrender.com";

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log("Admin login to:", `${API_BASE_URL}/api/admin/login`);

            const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log("Admin login response:", data);

            if (response.ok && data.token) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminData', JSON.stringify(data.admin));
                if (onLogin) onLogin(data.admin);
                alert('✅ Admin login successful!');
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error("Admin login error:", err);
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return ( <
        div style = {
            {
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
                padding: '20px'
            }
        } >
        <
        div style = {
            {
                background: 'rgba(0,0,0,0.9)',
                borderRadius: '20px',
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(212,175,55,0.3)',
                boxShadow: '0 0 30px rgba(212,175,55,0.2)'
            }
        } >
        <
        div style = {
            { textAlign: 'center', marginBottom: '30px' } } >
        <
        div style = {
            { fontSize: '48px', marginBottom: '10px' } } > 👑 < /div> <
        h2 style = {
            { color: '#d4af37', margin: 0 } } > Admin Login < /h2> <
        p style = {
            { color: '#888', fontSize: '14px', marginTop: '5px' } } > SRJ GLOBAL TECHNOLOGY < /p> <
        /div>

        <
        form onSubmit = { handleSubmit } >
        <
        div style = {
            { marginBottom: '20px' } } >
        <
        input type = "text"
        placeholder = "Admin Username"
        value = { username }
        onChange = {
            (e) => setUsername(e.target.value) }
        style = {
            {
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                borderRadius: '10px',
                fontSize: '16px',
                background: '#1a1a1a',
                color: 'white',
                boxSizing: 'border-box'
            }
        }
        required /
        >
        <
        /div>

        <
        div style = {
            { marginBottom: '20px' } } >
        <
        input type = "password"
        placeholder = "Admin Password"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        style = {
            {
                width: '100%',
                padding: '12px',
                border: '2px solid #333',
                borderRadius: '10px',
                fontSize: '16px',
                background: '#1a1a1a',
                color: 'white',
                boxSizing: 'border-box'
            }
        }
        required /
        >
        <
        /div>

        {
            error && ( <
                div style = {
                    {
                        background: 'rgba(231,76,60,0.2)',
                        color: '#e74c3c',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }
                } > ❌{ error } <
                /div>
            )
        }

        <
        button type = "submit"
        disabled = { loading }
        style = {
            {
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #d4af37, #8b6914)',
                color: '#1a1a2e',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
            }
        } >
        { loading ? 'Logging in...' : 'Login as Admin' } <
        /button> <
        /form>

        <
        div style = {
            { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' } } >
        Default: superadmin / Admin @123 <
        /div> <
        /div> <
        /div>
    );
}

export default AdminLogin;