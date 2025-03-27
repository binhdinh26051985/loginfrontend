import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Validate inputs
        if (!username || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Send registration request to the backend
            const response = await axios.post('http://localhost:3000/register', {
                username,
                password,
            });

            if (response.status === 201) {
                // Redirect to the login page after successful registration
                navigate('/login');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError('Username already exists');
            } else {
                setError('Registration failed. Please try again.');
            }
            console.error('Registration failed', error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Register</h1>
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
            <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password:</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                />
            </div>
            <button onClick={handleRegister} style={styles.button}>
                Register
            </button>
            <p style={styles.loginText}>
                Already have an account? <Link to="/login" style={styles.loginLink}>Login here</Link>
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
        backgroundColor: '#28a745',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginBottom: '15px',
    },
    loginText: {
        marginTop: '15px',
    },
    loginLink: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default RegisterPage;