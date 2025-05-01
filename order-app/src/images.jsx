import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ImageGallery = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type and size
    if (!selectedFile.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
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
    setStatus('Uploading...');
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setStatus('Upload successful!');
      setFile(null);
      setTitle('');
      setPreviewUrl('');
      fetchImages(); // Refresh the gallery
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
      setStatus('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images from the server
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (isAuthenticated()) {
        // Fetch user's images if authenticated
        const token = localStorage.getItem('token');
        response = await axios.get('/user/images', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Fetch public images if not authenticated
        response = await axios.get('/images');
      }
      
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.response?.data?.error || 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an image
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
      
      // First delete from Cloudinary
      await axios.delete(`/delete-image/${cloudinaryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Then delete from our database
      await axios.delete(`/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Refresh the gallery
      fetchImages();
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
            
            {status && <p className={`mt-2 ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
          </form>
        </div>
      )}
      
      <div className="mb-4">
        {isAuthenticated() ? (
          <button
            onClick={() => {
              localStorage.removeItem('token');
              fetchImages(); // Refresh to show public images
            }}
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
                  <div className="relative pb-[100%]"> {/* Square aspect ratio */}
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
