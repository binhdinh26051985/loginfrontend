import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import Link

const LoginPage = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3000/login', { username, password });
            setToken(response.data.token); // Use setToken to update the token state
            navigate('/orders'); // Redirect to the orders page
        } catch (error) {
            setError('Login failed. Please check your username and password.');
            console.error('Login failed', error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Login</h1>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.formGroup}>
                <label style={styles.label}>Username:</label>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Password:</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
            </div>
            <button onClick={handleLogin} style={styles.button}>
                Login
            </button>
            <p style={styles.registerText}>
                Don't have an account? <Link to="/register" style={styles.registerLink}>Register here</Link>
            </p>
        </div>
    );
};

// Styles for the page
const styles = {
    container: {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
    },
    formGroup: {
        marginBottom: '15px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px',
    },
    button: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginBottom: '15px',
    },
    registerText: {
        marginTop: '15px',
    },
    registerLink: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default LoginPage;