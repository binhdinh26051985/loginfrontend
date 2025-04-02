import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import OrderListPage from './OrderListPage';
import CreateOrderPage from './CreateOrderPage';
import EditOrderPage from './EditOrderPage';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> | 
                <Link to="/register">Register</Link> | 
                {!token && <Link to="/login">Login</Link>}
                {token && (
                    <>
                        | <Link to="/orders">Orders</Link>
                        | <Link to="/create">Create Order</Link>
                    </>
                )}
            </nav>
            <Routes>
                <Route 
                    path="/" 
                    element={token ? <Navigate to="/orders" /> : <LoginPage setToken={setToken} />} 
                />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage setToken={setToken} />} />
                <Route 
                    path="/orders" 
                    element={token ? <OrderListPage token={token} /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/create" 
                    element={token ? <CreateOrderPage token={token} /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/edit/:id" 
                    element={token ? <EditOrderPage token={token} /> : <Navigate to="/login" />} 
                />
            </Routes>
        </Router>
    );
};

export default App;
