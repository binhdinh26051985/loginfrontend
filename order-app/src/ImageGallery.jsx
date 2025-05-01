import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ImageGallery = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // API configuration - IMPORTANT: Set your correct backend URL
  const API_BASE_URL = 'https://order-app-backend-5362.vercel.app';

  // Check authentication status
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    
    if (!file || !title) {
      setError('Please select a file and enter a title');
      return;
    }

    if (!isAuthenticated()) {
      setError('Please login to upload images');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setStatus({ message: 'Uploading image...', type: 'info' });

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      setStatus({ message: 'Upload successful!', type: 'success' });
      setFile(null);
      setTitle('');
      setPreviewUrl('');
      await fetchImages(); // Refresh the gallery
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.error || 
                      err.message || 
                      'Failed to upload image';
      setError(errorMsg);
      setStatus({ message: 'Upload failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images from backend
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (isAuthenticated()) {
        const token = localStorage.getItem('token');
        response = await axios.get(`${API_BASE_URL}/user/images`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
      } else {
        response = await axios.get(`${API_BASE_URL}/images`, {
          withCredentials: true
        });
      }
      
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching images:', err);
      
      // Handle 404 specifically
      if (err.response?.status === 404) {
        setError('Images endpoint not found. Please check backend configuration.');
      } else {
        setError(err.response?.data?.error || 'Failed to load images');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image deletion
  const handleDelete = async (imageId, cloudinaryId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete images');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      
      await axios.delete(`${API_BASE_URL}/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      await fetchImages(); // Refresh the gallery
      setStatus({ message: 'Image deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete image');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    fetchImages(); // Refresh to show public images
    setStatus({ message: 'Logged out successfully', type: 'success' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Image Gallery</h1>
      
      {isAuthenticated() && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            {previewUrl && (
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Preview</h3>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-48 rounded-md"
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? 'Uploading...' : 'Upload Image'}
            </button>
            
            {status.message && (
              <p className={`mt-2 ${
                status.type === 'success' ? 'text-green-600' : 
                status.type === 'error' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {status.message}
              </p>
            )}
          </form>
        </div>
      )}
      
      <div className="mb-4">
        {isAuthenticated() ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Login to Upload
          </button>
        )}
      </div>
      
      {isLoading && images.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            {isAuthenticated() ? 'Your Images' : 'Public Images'}
          </h2>
          
          {images.length === 0 ? (
            <p className="text-gray-500">No images found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative pb-[100%]">
                    <img
                      src={image.cloudinary_url}
                      alt={image.title}
                      className="absolute h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{image.title}</h3>
                    <p className="text-gray-500 text-sm">
                      Uploaded on {new Date(image.created_at).toLocaleDateString()}
                    </p>
                    {isAuthenticated() && (
                      <button
                        onClick={() => handleDelete(image.id, image.cloudinary_id)}
                        className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageGallery;
