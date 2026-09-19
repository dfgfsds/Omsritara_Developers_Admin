import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "@/hooks/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  status: "active" | "inactive";
  createdAt: string;
  role?: {
    _id?: string;
    name?: string;
  } | string;
}

interface Role {
  _id: string;
  name: string;
}

interface EditUser {
  name: string;
  email: string;
  mobile: string;
  status: "active" | "inactive";
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoleId, setUserRoleId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [editUser, setEditUser] = useState<EditUser>({
    name: "",
    email: "",
    mobile: "",
    status: "active",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const getErrorMessage = (
    error: any,
    defaultMessage: string
  ): string => {
    const data = error?.response?.data;

    if (typeof data?.msg === "string" && data.msg.trim()) {
      return data.msg;
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (Array.isArray(data?.error)) {
      return data.error
        .map((item: any) => {
          if (typeof item === "string") return item;
          if (typeof item?.message === "string") return item.message;
          return "";
        })
        .filter(Boolean)
        .join(", ");
    }

    return defaultMessage;
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/user");

      const result = response?.data?.result;

      if (Array.isArray(result)) {
        setUsers(result);
      } else if (Array.isArray(response?.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("FETCH USERS ERROR:", error);

      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Unable to fetch users."
        ),
        variant: "destructive",
      });
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/role");

      const result =
        response?.data?.result ||
        response?.data?.data ||
        response?.data;

      let roleList: Role[] = [];

      if (Array.isArray(result)) {
        roleList = result;
      } else if (Array.isArray(result?.data)) {
        roleList = result.data;
      }

      const validRoles = roleList.filter(
        (role) => role?._id
      );

      setRoles(validRoles);

      const normalUserRole = validRoles.find((role) => {
        const roleName = String(role.name || "")
          .trim()
          .toLowerCase();

        return (
          roleName === "user" ||
          roleName === "users" ||
          roleName === "normal user" ||
          roleName === "customer"
        );
      });

      if (normalUserRole?._id) {
        setUserRoleId(normalUserRole._id);
      } else if (validRoles.length > 0) {
        const nonAdminRole = validRoles.find((role) => {
          const roleName = String(role.name || "")
            .trim()
            .toLowerCase();

          return (
            roleName !== "admin" &&
            roleName !== "administrator"
          );
        });

        setUserRoleId(
          nonAdminRole?._id || validRoles[0]._id
        );
      }
    } catch (error: any) {
      console.error("FETCH ROLES ERROR:", error);

      toast({
        title: "Role Loading Failed",
        description: getErrorMessage(
          error,
          "Unable to load user roles."
        ),
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    const name = newUser.name.trim();
    const email = newUser.email.trim();
    const mobile = newUser.mobile.trim();
    const password = newUser.password.trim();

    if (!name || !email || !mobile || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast({
        title: "Invalid Mobile",
        description:
          "Mobile number must contain exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description:
          "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!userRoleId) {
      toast({
        title: "Role Error",
        description:
          "User role is not available. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAdding(true);

      const payload = {
        name,
        email,
        mobile,
        password,
        role: userRoleId,
      };

      const response = await axiosInstance.post(
        "/signup",
        payload
      );

      console.log("ADD USER RESPONSE:", response.data);

      toast({
        title: "Success",
        description: "User created successfully.",
      });

      setNewUser({
        name: "",
        email: "",
        mobile: "",
        password: "",
      });

      setIsAddDialogOpen(false);

      await fetchUsers();
    } catch (error: any) {
      console.error("ADD USER ERROR:", error);
      console.error(
        "STATUS:",
        error?.response?.status
      );
      console.error(
        "RESPONSE:",
        error?.response?.data
      );

      toast({
        title: "Add User Failed",
        description: getErrorMessage(
          error,
          "Unable to create user."
        ),
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);

    setEditUser({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      status: user.status || "active",
    });

    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const name = editUser.name.trim();
    const email = editUser.email.trim();
    const mobile = editUser.mobile.trim();
    const status = editUser.status;

    if (!name) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!mobile) {
      toast({
        title: "Validation Error",
        description: "Mobile is required.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast({
        title: "Invalid Mobile",
        description:
          "Mobile number must contain exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    /*
      Important fix:

      Existing database user email invalid-a irundhaalum,
      status mattum change panna email backend-ku send panna maatom.

      Same value irundha field payload-la pogadhu.
      Change pannina mattum validate + send pannuvom.
    */

    const updatePayload: Record<string, string> = {};

    if (name !== (selectedUser.name || "").trim()) {
      updatePayload.name = name;
    }

    if (email !== (selectedUser.email || "").trim()) {
      if (!email) {
        toast({
          title: "Invalid Email",
          description: "Email cannot be empty.",
          variant: "destructive",
        });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "Invalid Email",
          description:
            "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      updatePayload.email = email;
    }

    if (mobile !== (selectedUser.mobile || "").trim()) {
      updatePayload.mobile = mobile;
    }

    if (status !== selectedUser.status) {
      updatePayload.status = status;
    }

    if (Object.keys(updatePayload).length === 0) {
      toast({
        title: "No Changes",
        description:
          "Please change at least one user detail.",
      });
      return;
    }

    try {
      setIsUpdating(true);

      console.log("=================================");
      console.log(
        "UPDATE USER ID:",
        selectedUser._id
      );
      console.log(
        "UPDATE USER PAYLOAD:",
        updatePayload
      );

      const response = await axiosInstance.put(
        `/user/${selectedUser._id}`,
        updatePayload
      );

      console.log(
        "UPDATE USER RESPONSE:",
        response.data
      );
      console.log("=================================");

      toast({
        title: "Success",
        description:
          "User updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);

      await fetchUsers();
    } catch (error: any) {
      console.error("=================================");
      console.error(
        "UPDATE USER ERROR:",
        error
      );
      console.error(
        "STATUS:",
        error?.response?.status
      );
      console.error(
        "RESPONSE:",
        error?.response?.data
      );
      console.error(
        "REQUEST URL:",
        error?.config?.url
      );
      console.error(
        "REQUEST DATA:",
        error?.config?.data
      );
      console.error("=================================");

      toast({
        title: "Update Failed",
        description: getErrorMessage(
          error,
          "Unable to update user."
        ),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response =
        await axiosInstance.delete(
          `/user/${user._id}`
        );

      console.log(
        "DELETE USER RESPONSE:",
        response.data
      );

      toast({
        title: "Success",
        description:
          "User deleted successfully.",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      toast({
        title: "Delete Failed",
        description: getErrorMessage(
          error,
          "Unable to delete user."
        ),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const search =
      searchTerm.trim().toLowerCase();

    return (
      user.name
        ?.toLowerCase()
        .includes(search) ||
      user.email
        ?.toLowerCase()
        .includes(search) ||
      user.mobile?.includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Users
          </h1>

          <p className="text-muted-foreground">
            Manage users and their details
          </p>
        </div>

        <button
          onClick={() => {
            setNewUser({
              name: "",
              email: "",
              mobile: "",
              password: "",
            });

            setIsAddDialogOpen(true);
          }}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
        >
          + Add User
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="w-full max-w-md px-4 py-2 border rounded-md"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">
                  Name
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Mobile
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Created
                </th>

                <th className="text-right p-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t"
                  >
                    <td className="p-4">
                      {user.name || "-"}
                    </td>

                    <td className="p-4">
                      {user.email || "-"}
                    </td>

                    <td className="p-4">
                      {user.mobile || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openViewDialog(user)
                          }
                          className="px-3 py-1 border rounded-md"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            openEditDialog(user)
                          }
                          className="px-3 py-1 border rounded-md"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteUser(user)
                          }
                          disabled={isDeleting}
                          className="px-3 py-1 border rounded-md text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">
              Add User
            </h2>

            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  email: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="text"
              placeholder="Mobile"
              maxLength={10}
              value={newUser.mobile}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  mobile: e.target.value.replace(
                    /\D/g,
                    ""
                  ),
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  password: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <div className="text-sm text-muted-foreground">
              {userRoleId
                ? `Role: ${
                    roles.find(
                      (role) =>
                        role._id === userRoleId
                    )?.name || "User"
                  }`
                : "Loading user role..."}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setIsAddDialogOpen(false)
                }
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleAddUser}
                disabled={
                  isAdding || !userRoleId
                }
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                {isAdding
                  ? "Creating..."
                  : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-semibold">
              Edit User
            </h2>

            <input
              type="text"
              placeholder="Name"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="email"
              placeholder="Email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  email: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="text"
              placeholder="Mobile"
              maxLength={10}
              value={editUser.mobile}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  mobile: e.target.value.replace(
                    /\D/g,
                    ""
                  ),
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Status
              </label>

              <select
                value={editUser.status}
                onChange={(e) =>
                  setEditUser({
                    ...editUser,
                    status:
                      e.target.value as
                        | "active"
                        | "inactive",
                  })
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateUser}
                disabled={isUpdating}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                {isUpdating
                  ? "Updating..."
                  : "Update User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">
              User Details
            </h2>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong>{" "}
                {selectedUser.name || "-"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedUser.email || "-"}
              </p>

              <p>
                <strong>Mobile:</strong>{" "}
                {selectedUser.mobile || "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedUser.status || "-"}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {selectedUser.createdAt
                  ? new Date(
                      selectedUser.createdAt
                    ).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;