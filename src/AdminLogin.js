import React, { useState } from 'react';

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Please enter username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify(data.admin));

            if (onLogin) {
                onLogin(data.admin);
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password');
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
            }
        } >
        <
        div style = {
            {
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }
        } >
        <
        div style = {
            { textAlign: 'center', marginBottom: '30px' } } >
        <
        h1 style = {
            { fontSize: '28px', color: '#333', margin: 0 } } > 👑Admin Panel < /h1> <
        p style = {
            { color: '#666', marginTop: '10px' } } > SRJ GLOBAL TECHNOLOGY < /p> <
        /div>

        <
        form onSubmit = { handleSubmit } >
        <
        div style = {
            { marginBottom: '20px' } } >
        <
        label style = {
            { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' } } > Username < /label> <
        input type = "text"
        placeholder = "Enter admin username"
        value = { username }
        onChange = {
            (e) => setUsername(e.target.value) }
        disabled = { loading }
        style = {
            {
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
            }
        }
        /> <
        /div>

        <
        div style = {
            { marginBottom: '20px' } } >
        <
        label style = {
            { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' } } > Password < /label> <
        input type = "password"
        placeholder = "Enter admin password"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        disabled = { loading }
        style = {
            {
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
            }
        }
        /> <
        /div>

        {
            error && ( <
                div style = {
                    {
                        background: '#fee',
                        color: '#c33',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }
                } > ⚠️{ error } <
                /div>
            )
        }

        <
        button type = "submit"
        disabled = { loading }
        style = {
            {
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s'
            }
        } >
        { loading ? '⏳ Logging in...' : '🚀 Login to Admin Panel' } <
        /button> <
        /form>

        <
        div style = {
            { marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0', textAlign: 'center' } } >
        <
        p style = {
            { fontSize: '12px', color: '#666', margin: 0 } } > Default Credentials: < /p> <
        small style = {
            { display: 'block', fontSize: '11px', color: '#999', marginTop: '5px' } } > Username: superadmin < /small> <
        small style = {
            { display: 'block', fontSize: '11px', color: '#999' } } > Password: Admin @123 < /small> <
        /div> <
        /div> <
        /div>
    );
}

export default AdminLogin;