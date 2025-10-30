"use client"

import Header from "@/app/(components)/Header"

type DeleteCustomerModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  customerName?: string
}

const DeleteCustomerModal = ({ isOpen, onClose, onConfirm, customerName }: DeleteCustomerModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Delete Customer" />
        <div className="mt-5">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete customer &quot;{customerName}&quot;? This action cannot be undone and will also remove
            all associated sales records.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteCustomerModal
