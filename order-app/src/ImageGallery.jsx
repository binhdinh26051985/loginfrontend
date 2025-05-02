import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ImageGallery = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch user's images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/user/images', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setImages(response.data);
      } catch (err) {
        setError('Failed to fetch images');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !title) {
      setError('Please select a file and provide a title');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Image uploaded successfully!');
      setImages([response.data, ...images]); // Add new image to the top
      setTitle('');
      setSelectedFile(null);
      document.getElementById('fileInput').value = ''; // Reset file input
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId, cloudinaryId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: { cloudinary_id: cloudinaryId }
      });

      setImages(images.filter(img => img.id !== imageId));
      setSuccess('Image deleted successfully');
    } catch (err) {
      setError('Failed to delete image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Gallery</h1>
      
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter image title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="fileInput">
              Choose Image
            </label>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
        
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </div>
      
      {/* Image Gallery */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Images</h2>
        
        {loading && images.length === 0 ? (
          <p>Loading images...</p>
        ) : images.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
                  <img
                    src={image.cloudinary_url}
                    alt={image.title}
                    className="w-full h-48 object-cover mb-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(image.id, image.cloudinary_id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
