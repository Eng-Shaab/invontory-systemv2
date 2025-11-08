import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"

export const getPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const purchases = await prisma.purchases.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.json(purchases)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving purchases" })
  }
}

export const getPurchaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const purchase = await prisma.purchases.findUnique({
      where: { purchaseId: id },
      include: {
        product: true,
      },
    })

    if (!purchase) {
      res.status(404).json({ message: "Purchase not found" })
      return
    }

    res.json(purchase)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving purchase" })
  }
}

export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity, unitCost, totalCost } = req.body
    
    // Start a transaction to update product stock and create purchase
    const result = await prisma.$transaction(async (tx: { purchases: { create: (arg0: { data: { productId: any; quantity: any; unitCost: any; totalCost: any }; include: { product: boolean } }) => any }; products: { update: (arg0: { where: { productId: any }; data: { stockQuantity: { increment: any } } }) => any } }) => {
      // Create the purchase
      const purchase = await tx.purchases.create({
        data: {
          productId,
          quantity,
          unitCost,
          totalCost,
        },
        include: {
          product: true,
        },
      })

      // Update product stock quantity
      await tx.products.update({
        where: { productId },
        data: {
          stockQuantity: {
            increment: quantity,
          },
        },
      })

      return purchase
    })

    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ message: "Error creating purchase" })
  }
}

export const updatePurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { productId, quantity, unitCost, totalCost } = req.body

    // Get the original purchase to calculate stock difference
    const originalPurchase = await prisma.purchases.findUnique({
      where: { purchaseId: id },
    })

    if (!originalPurchase) {
      res.status(404).json({ message: "Purchase not found" })
      return
    }

    const result = await prisma.$transaction(async (tx: { purchases: { update: (arg0: { where: { purchaseId: string }; data: any; include: { product: boolean } }) => any }; products: { update: (arg0: { where: { productId: any }; data: { stockQuantity: { increment: number } } }) => any } }) => {
      const updateData: any = {}
      if (productId !== undefined) updateData.productId = productId
      if (quantity !== undefined) updateData.quantity = quantity
      if (unitCost !== undefined) updateData.unitCost = unitCost
      if (totalCost !== undefined) updateData.totalCost = totalCost

      const purchase = await tx.purchases.update({
        where: { purchaseId: id },
        data: updateData,
        include: {
          product: true,
        },
      })

      // If quantity changed, update product stock
      if (quantity !== undefined && quantity !== originalPurchase.quantity) {
        const stockDifference = quantity - originalPurchase.quantity
        await tx.products.update({
          where: { productId: originalPurchase.productId },
          data: {
            stockQuantity: {
              increment: stockDifference,
            },
          },
        })
      }

      return purchase
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Error updating purchase" })
  }
}

export const deletePurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Get the purchase to reverse stock changes
    const purchase = await prisma.purchases.findUnique({
      where: { purchaseId: id },
    })

    if (!purchase) {
      res.status(404).json({ message: "Purchase not found" })
      return
    }

    await prisma.$transaction(async (tx: { purchases: { delete: (arg0: { where: { purchaseId: string } }) => any }; products: { update: (arg0: { where: { productId: any }; data: { stockQuantity: { decrement: any } } }) => any } }) => {
      // Delete the purchase
      await tx.purchases.delete({
        where: { purchaseId: id },
      })

      // Reverse the stock quantity
      await tx.products.update({
        where: { productId: purchase.productId },
        data: {
          stockQuantity: {
            decrement: purchase.quantity,
          },
        },
      })
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: "Error deleting purchase" })
  }
}