"use client"

import {
  useCreatePurchaseMutation,
  useGetPurchasesQuery,
  useDeletePurchaseMutation,
  useGetProductsQuery,
} from "@/state/api"
import { PlusCircleIcon, Edit, Trash2, ShoppingCart } from "lucide-react"
import { useState } from "react"
import Header from "@/app/(components)/Header"
import CreatePurchaseModal from "./CreatePurchaseModal"
import EditPurchaseModal from "./EditPurchaseModal"
import DeletePurchaseModal from "./DeletePurchaseModal"

const Purchases = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)

  const { data: purchases, isLoading, isError } = useGetPurchasesQuery()
  const { data: products } = useGetProductsQuery()

  const [createPurchase] = useCreatePurchaseMutation()
  const [deletePurchase] = useDeletePurchaseMutation()

  const handleCreatePurchase = async (purchaseData: any) => {
    await createPurchase(purchaseData)
  }

  const handleEditClick = (purchase: any) => {
    setSelectedPurchase(purchase)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (purchase: any) => {
    setSelectedPurchase(purchase)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedPurchase) {
      await deletePurchase(selectedPurchase.purchaseId)
      setIsDeleteModalOpen(false)
      setSelectedPurchase(null)
    }
  }

  if (isLoading) return <div className="py-4 text-center">Loading...</div>
  if (isError || !purchases) return <div className="text-center text-red-500 py-4">Failed to fetch purchases</div>

  return (
    <div className="mx-auto pb-5 w-full">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Purchases" />
        <button
          className="flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Purchase
        </button>
      </div>

      {/* PURCHASES TABLE */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.purchaseId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.product?.name || "Unknown Product"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${purchase.unitCost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${purchase.totalCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(purchase)}
                      className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(purchase)}
                      className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePurchase}
        products={products || []}
      />
      <EditPurchaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPurchase(null)
        }}
        purchase={selectedPurchase}
        products={products || []}
      />
      <DeletePurchaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedPurchase(null)
        }}
        onConfirm={handleDeleteConfirm}
        purchaseId={selectedPurchase?.purchaseId}
      />
    </div>
  )
}

export default Purchases
