import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import UserList from "../components/UserList";
import CreateUserForm from "../components/CreateUserForm";
import Footer from "../components/Footer";
import EditUserModal from "../components/EditUserModal";

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    country_of_birth: "",
    gender: "",
    password: "",
    is_staff: false,
  });
  const [editForm, setEditForm] = useState(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!user?.is_staff) {
      navigate("/home");
    }
  }, [user, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/Users/admin/users/");
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) {
      fetchUsers();
    }
  }, [user]);

  // Handle create user
  const handleCreateUser = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/Users/admin/users/",
        createForm
      );
      setUsers([...users, response.data]);
      setCreateForm({
        email: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        country_of_birth: "",
        gender: "",
        password: "",
        is_staff: false,
      });
      alert("User created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
      throw err;
    }
  };

  // Handle edit user
  const handleEditUser = async (userId) => {
    try {
      const payload = {
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        date_of_birth: editForm.date_of_birth,
        country_of_birth: editForm.country_of_birth,
        gender: editForm.gender,
        is_staff: editForm.is_staff,
        is_blocked: editForm.is_blocked,
        ...(editForm.password && { password: editForm.password }),
      };
      const response = await axiosInstance.put(
        `/api/Users/admin/users/${userId}/`,
        payload
      );
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, ...response.data } : u))
      );
      setEditForm(null);
      alert("User updated successfully");
    } catch (err) {
      console.error("Edit error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update user");
      await fetchUsers();
    }
  };

  // Handle block/unblock user
  const handleBlockUser = async (userId) => {
    try {
      const response = await axiosInstance.post(
        `/api/Users/admin/users/${userId}/block/`
      );
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_blocked: !u.is_blocked } : u
        )
      );
      alert(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/api/Users/admin/users/${userId}/`);
        setUsers(users.filter((u) => u.id !== userId));
        alert("User deleted successfully");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        <UserList
          users={users}
          currentUser={user}
          handleBlockUser={handleBlockUser}
          handleDeleteUser={handleDeleteUser}
          handleEditUser={setEditForm}
        />

        <EditUserModal
          editForm={editForm}
          setEditForm={setEditForm}
          handleEditUser={handleEditUser}
        />

        <CreateUserForm
          createForm={createForm}
          setCreateForm={setCreateForm}
          handleCreateUser={handleCreateUser}
        />
      </div>
      <Footer />
    </>
  );
}

export default AdminDashboard;
