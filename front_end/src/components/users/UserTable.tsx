import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
  TableCell,
  Select,
} from "flowbite-react";
import type { User } from "../../types/User";
import { useEffect, useState } from "react";
import { api, getUserPhotoUrl } from "../../helper/api";
import { useLoggedInUsersContext } from "../auth/LoggedInUserContext";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { HiOutlineExclamationCircle, HiUser, HiUserAdd, HiUserRemove } from "react-icons/hi";

// ✅ YENİ: Kullanıcı fotoğrafı için component
const UserPhoto = ({ photo, username, userId }: { 
  photo?: string, 
  username: string,
  userId: number 
}) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!photo || photo.trim() === '') {
      setHasError(true);
      return;
    }

    const lastUpdate = localStorage.getItem('lastProfileUpdate');
    const shouldForceRefresh = lastUpdate ? 
      (Date.now() - parseInt(lastUpdate)) < 30 * 60 * 1000 : // 30 dakika
      false;
    
    const url = getUserPhotoUrl(photo, shouldForceRefresh);
    setPhotoUrl(url);
    setHasError(false);

    // Profil güncelleme event'ini dinle
    const handleProfileUpdate = (event: any) => {
      if (event.detail.userId === userId) {
        console.log(`🔄 UserTable: Kullanıcı ${userId} fotoğrafı güncellendi`);
        // Fotoğrafı yenile
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [photo, userId, refreshKey]);

  useEffect(() => {
    // refreshKey değiştiğinde URL'yi yenile
    if (photo) {
      const url = getUserPhotoUrl(photo, true);
      setPhotoUrl(url);
      setHasError(false);
    }
  }, [refreshKey, photo]);

  if (hasError || !photoUrl) {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <HiUser className="w-4 h-4 text-blue-600" />
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={username}
      className="w-8 h-8 rounded-full object-cover"
      onError={() => setHasError(true)}
      key={`user-photo-${userId}-${refreshKey}`}
    />
  );
};

const UserTable = () => {
  const { loggedInUser } = useLoggedInUsersContext();
  const [users, setUsers] = useState<User[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("user");

  // Sadece admin erişebilir
  if (loggedInUser?.role !== "admin") {
    return <Navigate to="/" />;
  }

  function fetchUsers() {
    api
      .get("auth/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch(() => toast.error("Failed to load users"));
  }

  useEffect(() => {
    fetchUsers();
    
    // ✅ YENİ: Profil güncelleme event'ini dinle
    const handleProfileUpdate = () => {
      console.log('🔄 UserTable: Profil güncellendi, kullanıcı listesi yenilenecek');
      fetchUsers();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  function handleDeleteClick(user: User) {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }

  function handleRoleClick(user: User) {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  }

  function confirmDelete() {
    if (!selectedUser) return;

    api
      .post(`auth/users/${selectedUser.id}/delete`, { id: selectedUser.id })
      .then(() => {
        fetchUsers();
        toast.success("User deleted successfully");
        setShowDeleteModal(false);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to delete user");
      });
  }

  function updateUserRole() {
    if (!selectedUser) return;

    api
      .post(`auth/users/${selectedUser.id}/update-role`, { 
        id: selectedUser.id, 
        role: selectedRole 
      })
      .then(() => {
        fetchUsers();
        toast.success("User role updated successfully");
        setShowRoleModal(false);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to update role");
      });
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "admin":
        return "red";
      case "user":
        return "blue";
      default:
        return "gray";
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex items-center space-x-2">
          <Badge color="green" size="sm">
            Total Users: {users.length}
          </Badge>
          <Badge color="red" size="sm">
            Admins: {users.filter(u => u.role === "admin").length}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table hoverable>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableHeadCell>ID</TableHeadCell>
              <TableHeadCell>Profile</TableHeadCell>
              <TableHeadCell>Username</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Role</TableHeadCell>
              <TableHeadCell>Joined</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <UserPhoto 
                      photo={user.photo} 
                      username={user.username} 
                      userId={user.id} 
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{user.username}</span>
                    {user.id === loggedInUser?.id && (
                      <Badge color="blue" size="xs">You</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <Badge color={getRoleBadgeColor(user.role)} size="sm">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  {user.createdAt ? formatDate(user.createdAt) : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="xs"
                      color="blue"
                      onClick={() => handleRoleClick(user)}
                      disabled={user.id === loggedInUser?.id}
                    >
                      <HiUserAdd className="w-4 h-4 mr-1" />
                      Change Role
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDeleteClick(user)}
                      disabled={user.id === loggedInUser?.id}
                    >
                      <HiUserRemove className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        size="md"
        onClose={() => setShowDeleteModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete user{" "}
              <span className="font-bold">{selectedUser?.username}</span>?
            </h3>
            <p className="mb-5 text-sm text-gray-400">
              This action cannot be undone. All user data will be permanently deleted.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="red" onClick={confirmDelete}>
                Yes, I'm sure
              </Button>
              <Button color="alternative" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        show={showRoleModal}
        size="md"
        onClose={() => setShowRoleModal(false)}
        popup
      >
        <ModalHeader>Change User Role</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Changing role for:{" "}
                <span className="font-bold">{selectedUser?.username}</span>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </Select>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <span className="font-bold">Warning:</span> Changing user roles 
                      can affect their permissions and access to certain features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button color="alternative" onClick={() => setShowRoleModal(false)}>
                Cancel
              </Button>
              <Button color="blue" onClick={updateUserRole}>
                Update Role
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default UserTable;