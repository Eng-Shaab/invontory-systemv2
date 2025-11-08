import type { Request, Response } from "express"
import { prisma } from "../lib/prisma";
export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all dashboard data in parallel
    const [
      salesSummary,
      inventorySummary,
      customerSummary,
      topProducts,
      recentSales,
      recentPurchases,
    ] = await Promise.all([
      prisma.salesSummary.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.inventorySummary.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.customerSummary.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.products.findMany({
        orderBy: { stockQuantity: 'desc' },
        take: 10,
        include: {
          sales: true,
          purchases: true,
        },
      }),
      prisma.sales.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          product: true,
          customer: true,
        },
      }),
      prisma.purchases.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          product: true,
        },
      }),
    ])

    const dashboardMetrics = {
      salesSummary,
      inventorySummary,
      customerSummary,
      topProducts,
      recentSales,
      recentPurchases,
    }

    res.json(dashboardMetrics)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving dashboard metrics" })
  }
}