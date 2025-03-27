import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditOrderPage = ({ token }) => {
    const { id } = useParams();
    const [orderDetails, setOrderDetails] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrderDetails(response.data.order_details);
            } catch (error) {
                console.error('Failed to fetch order', error);
            }
        };
        fetchOrder();
    }, [id, token]);

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:3000/orders/${id}`, { order_details: orderDetails }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/orders');
        } catch (error) {
            console.error('Failed to update order', error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/orders');
        } catch (error) {
            console.error('Failed to delete order', error);
        }
    };

    return (
        <div>
            <h1>Edit Order</h1>
            <textarea value={orderDetails} onChange={(e) => setOrderDetails(e.target.value)} />
            <button onClick={handleUpdate}>Update</button>
            <button onClick={handleDelete}>Delete</button>
        </div>
    );
};

export default EditOrderPage;