"use client"

import { type ChangeEvent, type FormEvent, useState, useEffect } from "react"
import { useUpdateProductMutation } from "@/state/api"
import Header from "@/app/(components)/Header"

type EditProductModalProps = {
  isOpen: boolean
  onClose: () => void
  product: any
}

const EditProductModal = ({ isOpen, onClose, product }: EditProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    costPrice: 0,
    price: 0,
    stockQuantity: 0,
  })

  const [updateProduct] = useUpdateProductMutation()

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        costPrice: product.costPrice || 0,
        price: product.price || 0,
        stockQuantity: product.stockQuantity || 0,
      })
    }
  }, [product])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "costPrice" || name === "price" || name === "stockQuantity" ? Number.parseFloat(value) || 0 : value,
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (product) {
      await updateProduct({
        id: product.productId,
        data: formData,
      })
      onClose()
    }
  }

  if (!isOpen) return null

  const labelCssStyles = "block text-sm font-medium text-gray-700"
  const inputCssStyles = "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Edit Product" />
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="name" className={labelCssStyles}>
            Product Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          <label htmlFor="costPrice" className={labelCssStyles}>
            Cost Price
          </label>
          <input
            type="number"
            step="0.01"
            name="costPrice"
            placeholder="Cost Price"
            onChange={handleChange}
            value={formData.costPrice}
            className={inputCssStyles}
            required
          />

          <label htmlFor="price" className={labelCssStyles}>
            Selling Price
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Selling Price"
            onChange={handleChange}
            value={formData.price}
            className={inputCssStyles}
            required
          />

          <label htmlFor="stockQuantity" className={labelCssStyles}>
            Stock Quantity
          </label>
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            onChange={handleChange}
            value={formData.stockQuantity}
            className={inputCssStyles}
            required
          />

          <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Update
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditProductModal
