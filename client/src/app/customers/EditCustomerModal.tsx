"use client"

import { type ChangeEvent, type FormEvent, useState, useEffect } from "react"
import { useUpdateCustomerMutation } from "@/state/api"
import Header from "@/app/(components)/Header"

type EditCustomerModalProps = {
  isOpen: boolean
  onClose: () => void
  customer: any
}

const EditCustomerModal = ({ isOpen, onClose, customer }: EditCustomerModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })

  const [updateCustomer] = useUpdateCustomerMutation()

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      })
    }
  }, [customer])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (customer) {
      // Remove empty optional fields
      const cleanData = {
        name: formData.name,
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.address && { address: formData.address }),
      }
      await updateCustomer({
        id: customer.customerId,
        data: cleanData,
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
        <Header name="Edit Customer" />
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="name" className={labelCssStyles}>
            Customer Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          <label htmlFor="phone" className={labelCssStyles}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (optional)"
            onChange={handleChange}
            value={formData.phone}
            className={inputCssStyles}
          />

          <label htmlFor="address" className={labelCssStyles}>
            Address
          </label>
          <textarea
            name="address"
            placeholder="Address (optional)"
            onChange={handleChange}
            value={formData.address}
            className={`${inputCssStyles} h-20 resize-none`}
            rows={3}
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

export default EditCustomerModal
