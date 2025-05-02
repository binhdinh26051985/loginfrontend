import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ImageGallery = ({ token }) => {
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch user's images
    useEffect(() => {
        const fetchImages = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('https://order-app-backend-5362.vercel.app/user/images', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setImages(response.data);
            } catch (error) {
                console.error('Failed to fetch images', error);
                setError('Failed to load images');
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, [token]);

    // Handle file selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Handle image upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !title) {
            setError('Please select a file and provide a title');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('title', title);

            const response = await axios.post(
                'https://order-app-backend-5362.vercel.app/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Add new image to the beginning of the list
            setImages([response.data, ...images]);
            setTitle('');
            setSelectedFile(null);
        } catch (error) {
            console.error('Failed to upload image', error);
            setError('Failed to upload image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Your Image Gallery</h1>
            
            {/* Upload Form */}
            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block mb-2">Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isLoading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            </div>

            {/* Image Gallery */}
            {isLoading && images.length === 0 ? (
                <p>Loading images...</p>
            ) : images.length === 0 ? (
                <p>No images uploaded yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="border rounded-lg overflow-hidden shadow">
                            <img
                                src={image.cloudinary_url}
                                alt={image.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-semibold">{image.title}</h3>
                                <p className="text-sm text-gray-500">
                                    Uploaded: {new Date(image.created_at).toLocaleDateString()}
                                </p>
                                <Link 
                                    to={`/image/${image.id}`} 
                                    className="text-blue-500 hover:underline mt-2 inline-block"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
