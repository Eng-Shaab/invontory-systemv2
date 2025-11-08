"use client"

import { useEffect, useMemo, useState } from "react"
import Header from "@/app/(components)/Header"
import {
  type AppUser,
  type NewUserPayload,
  type UpdateUserPayload,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAuditLogsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/state/api"
import { Activity, Ban, CheckCircle, Clock4, PlusCircle, RefreshCw, Search, Shield, UserCog } from "lucide-react"
import CreateUserModal from "./CreateUserModal"
import EditUserModal from "./EditUserModal"
import DeleteUserModal from "./DeleteUserModal"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)

  const { user, status } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === "ADMIN"

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard")
    }
  }, [status, isAdmin, router])

  const queryArgs = useMemo(
    () => ({
      ...(searchTerm ? { search: searchTerm } : {}),
      includeInactive,
    }),
    [searchTerm, includeInactive],
  )

  const auditArgs = useMemo(() => ({ limit: 20, targetType: "USER" }), [])

  const { data: users = [], isLoading, isFetching } = useGetUsersQuery(queryArgs, { skip: !isAdmin })
  const { data: auditLogs = [], isLoading: auditLoading } = useGetAuditLogsQuery(auditArgs, { skip: !isAdmin })

  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const handleCreateUser = async (payload: NewUserPayload) => {
    await createUser(payload).unwrap()
  }

  const handleUpdateUser = async (id: string, payload: UpdateUserPayload) => {
    await updateUser({ id, data: payload }).unwrap()
  }

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id).unwrap()
  }

  const totalCount = users.length
  const activeCount = users.filter((user) => user.isActive).length
  const adminCount = users.filter((user) => user.role === "ADMIN").length
  const neverLoggedIn = users.filter((user) => !user.lastLoginAt).length

  if (status === "loading") {
    return <div className="py-6 text-center">Checking permissions...</div>
  }

  if (status === "authenticated" && !isAdmin) {
    return <div className="py-6 text-center text-red-500">You do not have permission to view this page.</div>
  }

  if (isLoading) {
    return <div className="py-6 text-center">Loading users...</div>
  }

  return (
    <div className="mx-auto pb-6 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <Header name="User Management" />
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Invite User
          </button>
          <button
            onClick={() => setIncludeInactive((prev) => !prev)}
            className={`flex items-center px-4 py-2 rounded-md border ${includeInactive ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
          >
            <Ban className="w-4 h-4 mr-2" /> {includeInactive ? "Hide inactive" : "Show inactive"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow p-4 flex items-center gap-3">
          <UserCog className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-gray-900">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white border-l-4 border-purple-500 rounded-lg shadow p-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-semibold text-gray-900">{adminCount}</p>
          </div>
        </div>
        <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center gap-3">
          <Clock4 className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-sm text-gray-500">Never Logged In</p>
            <p className="text-2xl font-semibold text-gray-900">{neverLoggedIn}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <Search className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search by email or name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button
            onClick={() => setSearchTerm("")}
            className="flex items-center gap-1 px-3 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
        {isFetching && <p className="text-xs text-gray-500 mt-2">Refreshing...</p>}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const statusColor = user.isActive ? "text-green-600" : "text-red-600"
              const roleBadgeColor = user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
              const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"

              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name ?? "—"}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeColor}`}>
                      {user.role === "ADMIN" ? "Admin" : "Staff"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${statusColor}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsEditModalOpen(true)
                        }}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteModalOpen(true)
                        }}
                        className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-6 text-center text-sm text-gray-600">No users matched your filters.</div>
        )}
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Recent Audit Log
          </h2>
          {auditLoading && <span className="text-xs text-gray-500">Loading…</span>}
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.summary ?? "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.actor ? `${log.actor.name ?? log.actor.email}` : "System"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && !auditLoading && (
            <div className="py-6 text-center text-sm text-gray-600">No audit entries yet.</div>
          )}
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        onSave={handleUpdateUser}
        user={selectedUser}
      />
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedUser(null)
        }}
        userEmail={selectedUser?.email}
        onConfirm={selectedUser ? () => handleDeleteUser(selectedUser.id) : () => Promise.resolve()}
      />
    </div>
  )
}

export default UsersPage
