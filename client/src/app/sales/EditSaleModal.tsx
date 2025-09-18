"use client"

import { type ChangeEvent, type FormEvent, useState, useEffect } from "react"
import { useUpdateSaleMutation } from "@/state/api"
import Header from "@/app/(components)/Header"

type EditSaleModalProps = {
  isOpen: boolean
  onClose: () => void
  sale: any
  products: any[]
  customers: any[]
}

const EditSaleModal = ({ isOpen, onClose, sale, products, customers }: EditSaleModalProps) => {
  const [formData, setFormData] = useState({
    productId: "",
    customerId: "",
    quantity: 0,
    unitPrice: 0,
    totalAmount: 0,
    profit: 0,
  })

  const [updateSale] = useUpdateSaleMutation()

  useEffect(() => {
    if (sale) {
      setFormData({
        productId: sale.productId || "",
        customerId: sale.customerId || "",
        quantity: sale.quantity || 0,
        unitPrice: sale.unitPrice || 0,
        totalAmount: sale.totalAmount || 0,
        profit: sale.profit || 0,
      })
    }
  }, [sale])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: name === "productId" || name === "customerId" ? value : Number.parseFloat(value) || 0,
    }

    // Auto-calculate total amount and profit when relevant fields change
    if (name === "quantity" || name === "unitPrice" || name === "productId") {
      newFormData.totalAmount = newFormData.quantity * newFormData.unitPrice

      // Calculate profit if product is selected
      if (newFormData.productId) {
        const selectedProduct = products.find((p) => p.productId === newFormData.productId)
        if (selectedProduct) {
          const costPerUnit = selectedProduct.costPrice
          newFormData.profit = (newFormData.unitPrice - costPerUnit) * newFormData.quantity
        }
      }
    }

    setFormData(newFormData)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sale) {
      await updateSale({
        id: sale.saleId,
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
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Edit Sale" />
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
                {product.name} (Stock: {product.stockQuantity})
              </option>
            ))}
          </select>

          <label htmlFor="customerId" className={labelCssStyles}>
            Customer
          </label>
          <select
            name="customerId"
            onChange={handleChange}
            value={formData.customerId}
            className={inputCssStyles}
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.customerId} value={customer.customerId}>
                {customer.name}
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

          <label htmlFor="unitPrice" className={labelCssStyles}>
            Unit Price
          </label>
          <input
            type="number"
            step="0.01"
            name="unitPrice"
            placeholder="Unit Price"
            onChange={handleChange}
            value={formData.unitPrice}
            className={inputCssStyles}
            required
            min="0"
          />

          <label htmlFor="totalAmount" className={labelCssStyles}>
            Total Amount
          </label>
          <input
            type="number"
            step="0.01"
            name="totalAmount"
            placeholder="Total Amount"
            value={formData.totalAmount}
            className={inputCssStyles}
            readOnly
          />

          <label htmlFor="profit" className={labelCssStyles}>
            Profit
          </label>
          <input
            type="number"
            step="0.01"
            name="profit"
            placeholder="Profit"
            value={formData.profit}
            className={`${inputCssStyles} ${formData.profit > 0 ? "text-green-600" : formData.profit < 0 ? "text-red-600" : "text-gray-600"}`}
            readOnly
          />

          <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Update Sale
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

export default EditSaleModal
