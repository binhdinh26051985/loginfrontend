import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Images = ({ token }) => {
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch images on component mount
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get('https://order-app-backend-three.vercel.app/images', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setImages(response.data);
            } catch (error) {
                setError('Failed to fetch images');
                console.error(error);
            }
        };
        fetchImages();
    }, [token]);

    // Handle image upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !title) {
            setError('Please select a file and enter a title');
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('title', title);

            await axios.post(
                'https://order-app-backend-three.vercel.app/upload-image',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Refresh the image list after upload
            const response = await axios.get('https://order-app-backend-three.vercel.app/images', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(response.data);
            setTitle('');
            setSelectedFile(null);
        } catch (error) {
            setError('Failed to upload image');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle image deletion
    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://order-app-backend-three.vercel.app/images/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh the image list after deletion
            const updatedImages = images.filter(image => image.id !== id);
            setImages(updatedImages);
        } catch (error) {
            setError('Failed to delete image');
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Your Images</h1>
            
            {/* Upload Form */}
            <form onSubmit={handleUpload}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Image title"
                    required
                />
                <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    accept="image/*"
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>

            {/* Error Message */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Images List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {images.map(image => (
                    <div key={image.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
                        <h3>{image.title}</h3>
                        <img 
                            src={image.image_url} 
                            alt={image.title} 
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                        <button onClick={() => handleDelete(image.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Images;
