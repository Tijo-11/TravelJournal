import React, { useState } from "react";

function EditUserModal({ editForm, setEditForm, handleEditUser }) {
  //passess props from AdminDashboard
  const [error, setError] = useState(null);

  if (!editForm) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await handleEditUser(editForm.id);
    } catch (err) {
      const errors = err.response?.data;
      if (errors?.email) {
        setError(errors.email[0]);
      } else if (errors?.password) {
        setError(errors.password[0]);
      } else {
        setError("User update failed. Please check your inputs.");
      }
    }
  };

  const handleClose = () => setEditForm(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={editForm.email || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="first_name">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={editForm.first_name || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="last_name">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={editForm.last_name || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="date_of_birth">
              Date of Birth
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={editForm.date_of_birth || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Country of Birth */}
          <div className="mb-4">
            <label
              className="block text-gray-700 mb-1"
              htmlFor="country_of_birth"
            >
              Country of Birth
            </label>
            <input
              id="country_of_birth"
              name="country_of_birth"
              type="text"
              value={editForm.country_of_birth || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={editForm.gender || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="C">Custom</option>
            </select>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password (leave blank to keep unchanged)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={editForm.password || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* is_staff checkbox */}
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="is_staff"
              checked={editForm.is_staff || false}
              onChange={handleChange}
              className="mr-2"
            />
            Admin User
          </label>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
