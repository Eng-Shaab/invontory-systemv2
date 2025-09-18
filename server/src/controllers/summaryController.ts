import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET ONLY - Sales Summary
export const getSalesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const salesSummary = await prisma.salesSummary.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.json(salesSummary)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving sales summary" })
  }
}

// GET ONLY - Inventory Summary
export const getInventorySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const inventorySummary = await prisma.inventorySummary.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.json(inventorySummary)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving inventory summary" })
  }
}

// GET ONLY - Customer Summary
export const getCustomerSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerSummary = await prisma.customerSummary.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.json(customerSummary)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customer summary" })
  }
}