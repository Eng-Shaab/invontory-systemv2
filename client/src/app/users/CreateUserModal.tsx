"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Header from "@/app/(components)/Header"
import type { NewUserPayload, UserRole } from "@/state/api"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: NewUserPayload) => Promise<void> | void
}

const initialForm: NewUserPayload = {
  email: "",
  password: "",
  role: "USER",
  name: "",
}

const CreateUserModal = ({ isOpen, onClose, onCreate }: CreateUserModalProps) => {
  const [formData, setFormData] = useState<NewUserPayload>(initialForm)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = formData.name?.trim()
    await onCreate({
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(trimmedName ? { name: trimmedName } : {}),
    })
    setFormData(initialForm)
    onClose()
  }

  if (!isOpen) return null

  const labelClass = "block text-sm font-medium text-gray-700"
  const inputClass = "block w-full mb-2 p-2 border-2 border-gray-300 rounded-md"

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-60 z-30 flex items-start justify-center overflow-y-auto">
      <div className="bg-white rounded-md shadow-lg mt-24 w-full max-w-md p-6">
        <Header name="Invite New User" />
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label htmlFor="name" className={labelClass}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name ?? ""}
              onChange={handleChange}
              className={inputClass}
              placeholder="Optional display name"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Temporary Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Set an initial password"
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>
              Role *
            </label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputClass}>
              <option value="USER">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserModal
