"use client"

import { useCreateCustomerMutation, useGetCustomersQuery, useDeleteCustomerMutation } from "@/state/api"
import { PlusCircleIcon, SearchIcon, Edit, Trash2, User } from "lucide-react"
import { useState } from "react"
import Header from "@/app/(components)/Header"
import CreateCustomerModal from "./CreateCustomerModal"
import EditCustomerModal from "./EditCustomerModal"
import DeleteCustomerModal from "./DeleteCustomerModal"

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const { data: customers, isLoading, isError } = useGetCustomersQuery(searchTerm)

  const [createCustomer] = useCreateCustomerMutation()
  const [deleteCustomer] = useDeleteCustomerMutation()

  const handleCreateCustomer = async (customerData: any) => {
    await createCustomer(customerData)
  }

  const handleEditClick = (customer: any) => {
    setSelectedCustomer(customer)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (customer: any) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedCustomer) {
      await deleteCustomer(selectedCustomer.customerId)
      setIsDeleteModalOpen(false)
      setSelectedCustomer(null)
    }
  }

  if (isLoading) return <div className="py-4 text-center">Loading...</div>
  if (isError || !customers) return <div className="text-center text-red-500 py-4">Failed to fetch customers</div>

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Customers" />
        <button
          className="flex items-center bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Customer
        </button>
      </div>

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div
            key={customer.customerId}
            className="bg-white border shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              {/* Customer Avatar */}
              <div className="w-16 h-16 bg-purple-100 rounded-full mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600" />
              </div>

              {/* Customer Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{customer.name}</h3>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                {customer.phone && (
                  <p className="flex items-center justify-center">
                    <span className="font-medium">Phone:</span>
                    <span className="ml-1">{customer.phone}</span>
                  </p>
                )}
                {customer.address && (
                  <p className="flex items-center justify-center">
                    <span className="font-medium">Address:</span>
                    <span className="ml-1 truncate max-w-32" title={customer.address}>
                      {customer.address}
                    </span>
                  </p>
                )}
                {customer.sales && (
                  <p className="text-purple-600 font-medium">
                    {customer.sales.length} purchase{customer.sales.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleEditClick(customer)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(customer)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCustomer}
      />
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
      />
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedCustomer(null)
        }}
        onConfirm={handleDeleteConfirm}
        customerName={selectedCustomer?.name}
      />
    </div>
  )
}

export default Customers
