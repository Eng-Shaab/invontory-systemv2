"use client"

import Header from "@/app/(components)/Header"

interface DeleteUserModalProps {
  isOpen: boolean
  userEmail?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

const DeleteUserModal = ({ isOpen, userEmail, onClose, onConfirm }: DeleteUserModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-60 z-30 flex items-start justify-center overflow-y-auto">
      <div className="bg-white rounded-md shadow-lg mt-24 w-full max-w-md p-6">
        <Header name="Remove User" />
        <p className="mt-3 text-sm text-gray-700">
          Are you sure you want to delete <span className="font-semibold">{userEmail}</span>? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2 pt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm()
              onClose()
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserModal
