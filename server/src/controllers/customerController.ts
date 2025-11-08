import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import type { AuthenticatedRequest } from "../types/http"

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search?.toString()
    const customers = await prisma.customers.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        sales: {
          include: {
            product: true,
          },
        },
      },
    })
    const shouldRedactProfit = req.user?.role !== "ADMIN"
    const payload = shouldRedactProfit
      ? customers.map((customer) => ({
          ...customer,
          sales: customer.sales?.map(({ profit, ...sale }) => sale) ?? [],
        }))
      : customers

    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customers" })
  }
}

export const getCustomerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const customer = await prisma.customers.findUnique({
      where: { customerId: id },
      include: {
        sales: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!customer) {
      res.status(404).json({ message: "Customer not found" })
      return
    }

    if (req.user?.role !== "ADMIN") {
      const safeCustomer = {
        ...customer,
        sales: customer.sales?.map(({ profit, ...sale }) => sale) ?? [],
      }
      res.json(safeCustomer)
      return
    }

    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customer" })
  }
}

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, address } = req.body
    const customer = await prisma.customers.create({
      data: {
        name,
        phone,
        address,
      },
    })
    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ message: "Error creating customer" })
  }
}

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, phone, address } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    const customer = await prisma.customers.update({
      where: { customerId: id },
      data: updateData,
    })

    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: "Error updating customer" })
  }
}

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.$transaction([
      prisma.sales.deleteMany({ where: { customerId: id } }),
      prisma.customers.delete({ where: { customerId: id } }),
    ])

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer" })
  }
}