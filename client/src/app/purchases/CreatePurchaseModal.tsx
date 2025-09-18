"use client"

import { type ChangeEvent, type FormEvent, useState } from "react"
import Header from "@/app/(components)/Header"

type PurchaseFormData = {
  productId: string
  quantity: number
  unitCost: number
  totalCost: number
}

type CreatePurchaseModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (formData: PurchaseFormData) => void
  products: any[]
}

const CreatePurchaseModal = ({ isOpen, onClose, onCreate, products }: CreatePurchaseModalProps) => {
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0,
    unitCost: 0,
    totalCost: 0,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: name === "productId" ? value : Number.parseFloat(value) || 0,
    }

    // Auto-calculate total cost when quantity or unit cost changes
    if (name === "quantity" || name === "unitCost") {
      newFormData.totalCost = newFormData.quantity * newFormData.unitCost
    }

    setFormData(newFormData)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onCreate(formData)
    onClose()
    setFormData({
      productId: "",
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
    })
  }

  if (!isOpen) return null

  const labelCssStyles = "block text-sm font-medium text-gray-700"
  const inputCssStyles = "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Add New Purchase" />
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="productId" className={labelCssStyles}>
            Product
          </label>
          <select
            name="productId"
            onChange={handleChange}
            value={formData.productId}
            className={inputCssStyles}
            required
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </select>

          <label htmlFor="quantity" className={labelCssStyles}>
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            onChange={handleChange}
            value={formData.quantity}
            className={inputCssStyles}
            required
            min="1"
          />

          <label htmlFor="unitCost" className={labelCssStyles}>
            Unit Cost
          </label>
          <input
            type="number"
            step="0.01"
            name="unitCost"
            placeholder="Unit Cost"
            onChange={handleChange}
            value={formData.unitCost}
            className={inputCssStyles}
            required
            min="0"
          />

          <label htmlFor="totalCost" className={labelCssStyles}>
            Total Cost
          </label>
          <input
            type="number"
            step="0.01"
            name="totalCost"
            placeholder="Total Cost"
            value={formData.totalCost}
            className={inputCssStyles}
            readOnly
          />

          <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">
            Add Purchase
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

export default CreatePurchaseModal
