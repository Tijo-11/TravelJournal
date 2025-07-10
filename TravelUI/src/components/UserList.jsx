function UserList({
  //props from Admin Dashboard
  users,
  currentUser,
  handleBlockUser,
  handleEditUser,
  handleDeleteUser,
}) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-6 py-4 whitespace-nowrap">{u.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {`${u.first_name} ${u.last_name}`.trim() || "No Name"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {u.is_blocked ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Blocked
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleBlockUser(u.id)}
                  className={`mr-2 px-4 py-2 rounded text-white ${
                    u.id === currentUser.id || u.is_superuser
                      ? "bg-gray-400 cursor-not-allowed"
                      : u.is_blocked
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                  disabled={u.id === currentUser.id || u.is_superuser}
                >
                  {u.is_blocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={() =>
                    handleEditUser({
                      id: u.id,
                      first_name: u.first_name,
                      last_name: u.last_name,
                      email: u.email,
                      is_staff: u.is_staff,
                      is_blocked: u.is_blocked,
                      password: "",
                    })
                  }
                  className={`mr-2 px-4 py-2 rounded text-white ${
                    u.is_superuser && !currentUser.is_superuser
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={u.is_superuser && !currentUser.is_superuser}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className={`px-4 py-2 rounded text-white ${
                    u.id === currentUser.id || u.is_superuser
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  disabled={u.id === currentUser.id || u.is_superuser}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
