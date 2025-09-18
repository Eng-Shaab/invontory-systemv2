import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getProducts = async (req: Request, res: Response): Promise<void> => {
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
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" })
  }
}

export const getProductById = async (req: Request, res: Response): Promise<void> => {
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

    await prisma.products.delete({
      where: { productId: id },
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" })
  }
}