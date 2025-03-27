import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import OrderListPage from './OrderListPage';
import CreateOrderPage from './CreateOrderPage';
import EditOrderPage from './EditOrderPage';

const App = () => {
    const [token, setToken] = useState(''); // State to store the token

    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> | 
                <Link to="/register">Register</Link> | 
                <Link to="/login">Login</Link> | 
                <Link to="/create">Create Order</Link>
            </nav>
            <Routes>
                <Route path="/" element={<LoginPage setToken={setToken} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage setToken={setToken} />} />
                <Route path="/orders" element={<OrderListPage token={token} />} />
                <Route path="/create" element={<CreateOrderPage token={token} />} />
                <Route path="/edit/:id" element={<EditOrderPage token={token} />} />
            </Routes>
        </Router>
    );
};

export default App;