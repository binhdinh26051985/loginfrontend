import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OrderListPage = ({ token }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:3000/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            }
        };
        fetchOrders();
    }, [token]);

    return (
        <div>
            <h1>Your Orders</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        {order.order_details}
                        <Link to={`/edit/${order.id}`}>Edit</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderListPage;