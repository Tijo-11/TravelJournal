import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function EditProfileCard({ user, onSuccess }) {
  // passing props from Profile.jsx
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    date_of_birth: user?.date_of_birth || "",
    country_of_birth: user?.country_of_birth || "",
    gender: user?.gender || "",
    current_password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axiosInstance.put("/api/Users/edit-profile/", formData);
      setLoading(false);
      onSuccess?.(); // Close the form on success
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.current_password || "Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gray-100 p-6 rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-4">Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="date_of_birth"
          placeholder="Date of Birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="country_of_birth"
          placeholder="Country of Birth"
          value={formData.country_of_birth}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonbinary">Non-Binary</option>
          <option value="other">Other</option>
        </select>

        <input
          type="password"
          name="current_password"
          placeholder="Confirm Current Password"
          value={formData.current_password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default EditProfileCard;
