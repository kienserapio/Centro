'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

export default function PostsPage() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general',
    priority: 'low',
    is_pinned: false,
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements on page load
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Success');
        setFormData({
          title: '',
          body: '',
          category: 'general',
          priority: 'low',
          is_pinned: false,
        });
        // Refresh announcements list
        fetchAnnouncements();
      } else {
        alert('Error');
      }
    } catch (error) {
      alert('Error');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Create Announcement</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border p-2 rounded"
                  placeholder="Enter title"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block mb-1 font-medium">Body *</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  required
                  className="w-full border p-2 rounded"
                  placeholder="Enter body"
                  rows={4}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1 font-medium">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border p-2 rounded"
                >
                  <option value="general">General</option>
                  <option value="utility">Utility</option>
                  <option value="security">Security</option>
                  <option value="meeting">Meeting</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block mb-1 font-medium">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  className="w-full border p-2 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Is Pinned */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_pinned"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
                <label htmlFor="is_pinned" className="font-medium">Is Pinned</label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded font-medium"
              >
                Create Announcement
              </button>
            </form>
          </div>
        </div>

        {/* Announcements List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-gray-500">No announcements yet</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{announcement.title}</h3>
                      {announcement.is_pinned && (
                        <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                          PINNED
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">{announcement.body}</p>

                    <div className="flex gap-2 mb-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {announcement.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${announcement.priority === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : announcement.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : announcement.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                      >
                        {announcement.priority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString()} at{' '}
                      {new Date(announcement.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
