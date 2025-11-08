"use client"

import { useCreateCustomerMutation, useGetCustomersQuery, useDeleteCustomerMutation } from "@/state/api"
import { PlusCircleIcon, SearchIcon, Edit, Trash2, Users, ShoppingBag, TrendingUp } from "lucide-react"
import { useState } from "react"
import Header from "@/app/(components)/Header"
import CreateCustomerModal from "./CreateCustomerModal"
import EditCustomerModal from "./EditCustomerModal"
import DeleteCustomerModal from "./DeleteCustomerModal"
import { useAuth } from "@/context/AuthContext"

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const { data: customers, isLoading, isError } = useGetCustomersQuery(searchTerm)

  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const [createCustomer] = useCreateCustomerMutation()
  const [deleteCustomer] = useDeleteCustomerMutation()

  const handleCreateCustomer = async (customerData: any) => {
    if (!isAdmin) return
    await createCustomer(customerData)
  }

  const handleEditClick = (customer: any) => {
    if (!isAdmin) return
    setSelectedCustomer(customer)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (customer: any) => {
    if (!isAdmin) return
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return
    if (selectedCustomer) {
      await deleteCustomer(selectedCustomer.customerId)
      setIsDeleteModalOpen(false)
      setSelectedCustomer(null)
    }
  }

  if (isLoading) return <div className="py-4 text-center">Loading...</div>
  if (isError || !customers) return <div className="text-center text-red-500 py-4">Failed to fetch customers</div>

  const totalCustomers = customers.length
  const totalPurchases = customers.reduce((sum, customer) => sum + (customer.sales?.length || 0), 0)
  const avgPurchasesPerCustomer = totalCustomers > 0 ? (totalPurchases / totalCustomers).toFixed(2) : "0"

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
        {isAdmin && (
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Customer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{totalPurchases}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Purchases/Customer</p>
              <p className="text-2xl font-bold text-gray-900">{avgPurchasesPerCustomer}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchases
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.customerId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.phone || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 truncate max-w-xs" title={customer.address}>
                    {customer.address || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-blue-600">
                    {customer.sales?.length || 0} purchase{customer.sales?.length !== 1 ? "s" : ""}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(customer)}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {isAdmin && (
        <>
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
        </>
      )}
    </div>
  )
}

export default Customers
