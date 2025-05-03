import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Images = () => {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get auth token from localStorage (assuming you store it there after login)
  const token = localStorage.getItem('token');

  // Fetch user's images
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://order-app-backend-three.vercel.app/images', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setImages(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload image
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

      await axios.post('https://order-app-backend-three.vercel.app/upload-image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Image uploaded successfully');
      setTitle('');
      setSelectedFile(null);
      document.getElementById('fileInput').value = ''; // Reset file input
      fetchImages(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`https://order-app-backend-three.vercel.app/images/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Image deleted successfully');
      fetchImages(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete image');
    } finally {
      setIsLoading(false);
    }
  };

  // Update title
  const handleUpdateTitle = async (id, newTitle) => {
    try {
      setIsLoading(true);
      await axios.put(
        `https://order-app-backend-three.vercel.app/images/${id}/title`,
        { title: newTitle },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Title updated successfully');
      fetchImages(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update title');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Images</h1>

      {/* Success/Error messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="fileInput">
              Image
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded"
              accept="image/*"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Image Gallery */}
      {isLoading && !images.length ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">No images found. Upload your first image!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    value={image.title}
                    onChange={(e) => handleUpdateTitle(image.id, e.target.value)}
                    onBlur={(e) => handleUpdateTitle(image.id, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded mr-2"
                  />
                </div>
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Images;
