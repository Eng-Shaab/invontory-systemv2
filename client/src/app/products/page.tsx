"use client"

import { useCreateProductMutation, useGetProductsQuery, useDeleteProductMutation } from "@/state/api"
import { PlusCircleIcon, SearchIcon, Edit, Trash2, Package, AlertTriangle, DollarSign, Layers } from "lucide-react"
import { useState } from "react"
import Header from "@/app/(components)/Header"
import CreateProductModal from "./CreateProductModal"
import EditProductModal from "./EditProductModal"
import DeleteProductModal from "./DeleteProductModal"

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm)

  const [createProduct] = useCreateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const handleCreateProduct = async (productData: any) => {
    await createProduct(productData)
  }

  const handleEditClick = (product: any) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.productId)
      setIsDeleteModalOpen(false)
      setSelectedProduct(null)
    }
  }

  if (isLoading) return <div className="py-4 text-center">Loading...</div>
  if (isError || !products) return <div className="text-center text-red-500 py-4">Failed to fetch products</div>

  const totalProducts = products.length
  const totalStockValue = products.reduce((sum, product) => sum + product.stockQuantity * product.price, 0)
  const lowStockItems = products.filter((p) => p.stockQuantity < 10).length
  const avgPrice =
    products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : "0"

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalStockValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <Layers className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">${avgPrice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const stockStatus =
                product.stockQuantity === 0 ? "Out of Stock" : product.stockQuantity < 10 ? "Low Stock" : "In Stock"
              const statusColor =
                product.stockQuantity === 0
                  ? "text-red-600"
                  : product.stockQuantity < 10
                    ? "text-yellow-600"
                    : "text-green-600"
              return (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">${product.costPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.stockQuantity} units</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${statusColor}`}>{stockStatus}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProduct}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedProduct(null)
        }}
        onConfirm={handleDeleteConfirm}
        productName={selectedProduct?.name}
      />
    </div>
  )
}

export default Products
