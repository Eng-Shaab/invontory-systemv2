"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import Header from "@/app/(components)/Header"
import type { AppUser, UpdateUserPayload, UserRole } from "@/state/api"

interface EditUserModalProps {
  isOpen: boolean
  user: AppUser | null
  onClose: () => void
  onSave: (id: string, payload: UpdateUserPayload) => Promise<void> | void
}

const defaultState: UpdateUserPayload & { email: string; role: UserRole } = {
  email: "",
  name: "",
  role: "USER",
  isActive: true,
  password: "",
}

const EditUserModal = ({ isOpen, user, onClose, onSave }: EditUserModalProps) => {
  const [formState, setFormState] = useState(defaultState)

  useEffect(() => {
    if (user && isOpen) {
      setFormState({
        email: user.email,
        name: user.name ?? "",
        role: user.role,
        isActive: user.isActive,
        password: "",
      })
    }
  }, [user, isOpen])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value,
    }))
  }

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    const payload: UpdateUserPayload = {
      email: formState.email,
      role: formState.role,
      isActive: formState.isActive,
      ...(formState.password ? { password: formState.password } : {}),
    }

    const trimmedName = (formState.name ?? "").trim()
    payload.name = trimmedName === "" ? null : trimmedName

    await onSave(user.id, payload)
    onClose()
  }

  if (!isOpen || !user) return null

  const labelClass = "block text-sm font-medium text-gray-700"
  const inputClass = "block w-full mb-2 p-2 border-2 border-gray-300 rounded-md"

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-60 z-30 flex items-start justify-center overflow-y-auto">
      <div className="bg-white rounded-md shadow-lg mt-24 w-full max-w-md p-6">
        <Header name="Edit User" />
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
              value={formState.email}
              onChange={handleChange}
              className={inputClass}
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
              value={formState.name ?? ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>
              Role *
            </label>
            <select id="role" name="role" value={formState.role} onChange={handleChange} className={inputClass}>
              <option value="USER">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={Boolean(formState.isActive)}
              onChange={handleToggle}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active account
            </label>
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Reset Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formState.password ?? ""}
              onChange={handleChange}
              className={inputClass}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal
