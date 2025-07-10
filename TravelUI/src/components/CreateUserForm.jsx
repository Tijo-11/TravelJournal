import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function CreateUserForm({ createForm, setCreateForm, handleCreateUser }) {
  //props from AdminDashboard
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await handleCreateUser(createForm);
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.email) {
          setError(errors.email[0]);
        } else if (errors.password) {
          setError(errors.password[0]);
        } else {
          setError("User creation failed. Please check your inputs.");
        }
      } else {
        setError("User creation failed. Please try again.");
      }
      console.error("User creation error:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Create User</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm({ ...createForm, email: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="firstName">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter first name"
            value={createForm.first_name}
            onChange={(e) =>
              setCreateForm({ ...createForm, first_name: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="lastName">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter last name"
            value={createForm.last_name}
            onChange={(e) =>
              setCreateForm({ ...createForm, last_name: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="dateOfBirth">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={createForm.date_of_birth}
            onChange={(e) =>
              setCreateForm({ ...createForm, date_of_birth: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="countryOfBirth">
            Country of Birth
          </label>
          <input
            id="countryOfBirth"
            type="text"
            placeholder="Enter country of birth"
            value={createForm.country_of_birth}
            onChange={(e) =>
              setCreateForm({ ...createForm, country_of_birth: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            value={createForm.gender}
            onChange={(e) =>
              setCreateForm({ ...createForm, gender: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="C">Custom</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({ ...createForm, password: e.target.value })
            }
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={createForm.is_staff}
            onChange={(e) =>
              setCreateForm({ ...createForm, is_staff: e.target.checked })
            }
            className="mr-2"
          />
          Admin User
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Create User
        </button>
      </form>
    </div>
  );
}

export default CreateUserForm;
