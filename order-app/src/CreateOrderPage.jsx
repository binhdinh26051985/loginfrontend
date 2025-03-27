import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateOrderPage = ({ token }) => {
    const [orderDetails, setOrderDetails] = useState('');
    const navigate = useNavigate();

    const handleCreate = async () => {
        try {
            await axios.post('http://localhost:3000/orders', { order_details: orderDetails }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/orders');
        } catch (error) {
            console.error('Failed to create order', error);
        }
    };

    return (
        <div>
            <h1>Create Order</h1>
            <textarea value={orderDetails} onChange={(e) => setOrderDetails(e.target.value)} />
            <button onClick={handleCreate}>Create</button>
        </div>
    );
};

export default CreateOrderPage;