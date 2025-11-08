import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import type { AuthenticatedRequest } from "../types/http"

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search?.toString()
    const products = await prisma.products.findMany({
      where: search
        ? {
            name: { contains: search, mode: 'insensitive' },
          }
        : {},
      include: {
        purchases: true,
        sales: {
          include: {
            customer: true,
          },
        },
      },
    })
    const shouldRedactProfit = req.user?.role !== "ADMIN"
    const payload = shouldRedactProfit
      ? products.map((product) => ({
          ...product,
          sales: product.sales?.map(({ profit, ...sale }) => sale) ?? [],
        }))
      : products

    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" })
  }
}

export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const product = await prisma.products.findUnique({
      where: { productId: id },
      include: {
        purchases: true,
        sales: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (!product) {
      res.status(404).json({ message: "Product not found" })
      return
    }

    if (req.user?.role !== "ADMIN") {
      const redactedProduct = {
        ...product,
        sales: product.sales?.map(({ profit, ...sale }) => sale) ?? [],
      }
      res.json(redactedProduct)
      return
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product" })
  }
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, costPrice, price, stockQuantity = 0 } = req.body
    const product = await prisma.products.create({
      data: {
        name,
        costPrice,
        price,
        stockQuantity,
      },
    })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: "Error creating product" })
  }
}

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, costPrice, price, stockQuantity } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (costPrice !== undefined) updateData.costPrice = costPrice
    if (price !== undefined) updateData.price = price
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity

    const product = await prisma.products.update({
      where: { productId: id },
      data: updateData,
    })

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: "Error updating product" })
  }
}

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.$transaction([
      prisma.sales.deleteMany({ where: { productId: id } }),
      prisma.purchases.deleteMany({ where: { productId: id } }),
      prisma.products.delete({ where: { productId: id } }),
    ])

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" })
  }
}