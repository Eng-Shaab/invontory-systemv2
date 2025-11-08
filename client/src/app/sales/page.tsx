"use client"

import {
  useCreateSaleMutation,
  useGetSalesQuery,
  useDeleteSaleMutation,
  useGetProductsQuery,
  useGetCustomersQuery,
} from "@/state/api"
import { PlusCircleIcon, Edit, Trash2, DollarSign, TrendingUp } from "lucide-react"
import { useState } from "react"
import Header from "@/app/(components)/Header"
import CreateSaleModal from "./CreateSaleModal"
import EditSaleModal from "./EditSaleModal"
import DeleteSaleModal from "./DeleteSaleModal"
import { useAuth } from "@/context/AuthContext"

const Sales = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)

  const { data: sales, isLoading, isError } = useGetSalesQuery()
  const { data: products } = useGetProductsQuery()
  const { data: customers } = useGetCustomersQuery()
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const [createSale] = useCreateSaleMutation()
  const [deleteSale] = useDeleteSaleMutation()

  const handleCreateSale = async (saleData: any) => {
    if (!isAdmin) return
    await createSale(saleData)
  }

  const handleEditClick = (sale: any) => {
    if (!isAdmin) return
    setSelectedSale(sale)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (sale: any) => {
    if (!isAdmin) return
    setSelectedSale(sale)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return
    if (selectedSale) {
      await deleteSale(selectedSale.saleId)
      setIsDeleteModalOpen(false)
      setSelectedSale(null)
    }
  }

  if (isLoading) return <div className="py-4 text-center">Loading...</div>
  if (isError || !sales) return <div className="text-center text-red-500 py-4">Failed to fetch sales</div>

  // Calculate totals
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalProfit = isAdmin ? sales.reduce((sum, sale) => sum + (sale.profit ?? 0), 0) : null

  return (
    <div className="mx-auto pb-5 w-full">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Sales" />
        {isAdmin && (
          <button
            className="flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Record Sale
          </button>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className={`grid grid-cols-1 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6 mb-6`}>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        {isAdmin && totalProfit !== null && (
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">${totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        </div>
    </div>

      {/* SALES TABLE */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.saleId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sale.product?.name || "Unknown Product"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sale.customer?.name || "Unknown Customer"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.unitPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${sale.totalAmount.toFixed(2)}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        (sale.profit ?? 0) > 0
                          ? "text-green-600"
                          : (sale.profit ?? 0) < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      ${(sale.profit ?? 0).toFixed(2)}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(sale)}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sale)}
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
          <CreateSaleModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateSale}
            products={products || []}
            customers={customers || []}
          />
          <EditSaleModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedSale(null)
            }}
            sale={selectedSale}
            products={products || []}
            customers={customers || []}
          />
          <DeleteSaleModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedSale(null)
            }}
            onConfirm={handleDeleteConfirm}
            saleId={selectedSale?.saleId}
          />
        </>
      )}
    </div>
  )
}

export default Sales
