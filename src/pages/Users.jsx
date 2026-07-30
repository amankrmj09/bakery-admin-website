import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, updateUserStatus, deleteUser } from '../store/slices/dashboardSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import SleekDropdown from '../components/ui/SleekDropdown';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useScrollTop } from '../hooks/useScrollTop';
import { Users as UsersIcon, Edit, Trash2 } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import TopSearchBar from '../components/shared/TopSearchBar';
import ActionIconButton from '../components/ui/ActionIconButton';
import ActionButton from '../components/ui/ActionButton';

export default function Users() {
  const dispatch = useDispatch();
  const isScrolled = useScrollTop();
  const { data: users, totalElements, loading } = useSelector((state) => state.dashboard.users);
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const totalPages = Math.ceil((totalElements || users?.length || 0) / pageSize) || 1;

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ role: '', status: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  useEffect(() => {
    dispatch(fetchUsers({ page, size: pageSize, query: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({ role: user.role || 'USER', status: user.status || 'ACTIVE' });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const promises = [];
      if (editForm.role !== selectedUser.role) {
        promises.push(dispatch(updateUserRole({ userId: selectedUser.id, role: editForm.role })).unwrap());
      }
      if (editForm.status !== selectedUser.status) {
        promises.push(dispatch(updateUserStatus({ userId: selectedUser.id, status: editForm.status })).unwrap());
      }
      await Promise.all(promises);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update user', err);
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    
    setIsSaving(true);
    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      toast.success('User deleted successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return 'purple';
    if (role === 'STAFF') return 'secondary';
    if (role === 'USER') return 'info';
    return 'outline';
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'LOCKED') return 'destructive';
    return 'warning';
  };

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      <div className={cn(
        "sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <UsersIcon className="text-[var(--color-primary)] h-6 w-6" />
            Users Management
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Manage administrators, staff, and customers.</p>
        </div>
        <TopSearchBar onSearch={handleSearch} placeholder="Search by name, email, or UID..." />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <div className="py-6 text-center">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                        <div className="text-xs text-muted-foreground">{user.username}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(user.status)}>
                          {user.status || 'ACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <ActionIconButton icon={Edit} onClick={() => handleEditClick(user)} title="Edit User" colorClass="text-blue-600 bg-blue-50 hover:bg-blue-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements || users?.length || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSaving && setIsEditModalOpen(false)}
        title="Edit User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <SleekDropdown
              formLabel="Role"
              value={editForm.role}
              onChange={(val) => setEditForm({ ...editForm, role: val })}
              disabled={isSaving}
              fullWidth
              options={[
                { value: "USER", label: "User" },
                { value: "STAFF", label: "Staff" },
                { value: "ADMIN", label: "Admin" }
              ]}
            />
            
            <SleekDropdown
              formLabel="Status"
              value={editForm.status}
              onChange={(val) => setEditForm({ ...editForm, status: val })}
              disabled={isSaving}
              fullWidth
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "LOCKED", label: "Locked" }
              ]}
            />

            <div className="pt-4 flex justify-between items-center border-t border-[var(--border-color)] mt-6">
              <ActionButton 
                text="Delete User"
                onClick={handleDeleteUser}
                icon={Trash2}
                bgClass="bg-red-500"
                hoverBgClass="bg-red-600"
                disabled={isSaving}
                className="px-4 h-10"
              />
              <div className="flex space-x-2">
                <ActionButton 
                  text="Cancel"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  bgClass="bg-gray-100 dark:bg-gray-800"
                  textClass="text-gray-700 dark:text-gray-300"
                  hoverBgClass="bg-gray-200 dark:bg-gray-700"
                  showArrow={false}
                  className="px-4 h-10"
                />
                <ActionButton 
                  text={isSaving ? 'Saving...' : 'Save Changes'}
                  onClick={handleSave} 
                  disabled={isSaving || (editForm.role === selectedUser.role && editForm.status === selectedUser.status)}
                  showArrow={true}
                  className="px-4 h-10"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


