"use client"

import { useCreateProductMutation, useGetProductsQuery, useDeleteProductMutation } from "@/state/api"
import { PlusCircleIcon, SearchIcon, Edit, Trash2, Package } from "lucide-react" // Package icon for alaaab
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
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create Product
        </button>
      </div>

      {/* PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <div
            key={product.productId}
            className="border shadow rounded-md p-4 max-w-full w-full mx-auto hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center">
              {/* ICON instead of No Image */}
              <div className="w-36 h-36 bg-gray-100 rounded-2xl mb-3 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-500" />
              </div>

              {/* Product Info */}
              <h3 className="text-lg text-gray-900 font-semibold text-center">{product.name}</h3>
              <div className="mt-2 text-center">
                <p className="text-gray-800 font-bold">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Cost: ${product.costPrice.toFixed(2)}</p>
                <div className="text-sm text-gray-600 mt-1">Stock: {product.stockQuantity}</div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditClick(product)}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(product)}
                  className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
