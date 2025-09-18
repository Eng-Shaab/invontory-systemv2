"use client"

import { useState } from "react"
import { useGetProductsQuery, useGetPurchasesQuery, useGetSalesQuery } from "@/state/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Badge } from "@/app/(components)/ui/badge"
import { AlertTriangle, Package, TrendingDown, TrendingUp, Search } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Product {
  productId: string
  name: string
  price: number
  rating?: number
  stockQuantity: number
}

interface Purchase {
  purchaseId: string
  productId: string
  quantity: number
  unitCost: number
  totalCost: number
  timestamp: string
}

interface Sale {
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  totalAmount: number
  timestamp: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all")

const { data: products = [], isLoading: productsLoading } = useGetProductsQuery()
const { data: purchases = [] } = useGetPurchasesQuery()
const { data: sales = [] } = useGetSalesQuery()


  // Calculate inventory metrics
  const totalProducts = products.length
  const lowStockProducts = products.filter((p: Product) => p.stockQuantity <= 10 && p.stockQuantity > 0)
  const outOfStockProducts = products.filter((p: Product) => p.stockQuantity === 0)
  const totalInventoryValue = products.reduce((sum: number, p: Product) => sum + p.price * p.stockQuantity, 0)

  // Filter products based on search and stock filter
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stockQuantity <= 10 && product.stockQuantity > 0) ||
      (stockFilter === "out" && product.stockQuantity === 0)
    return matchesSearch && matchesFilter
  })

  // Prepare chart data
  const stockLevelData = [
    { name: "In Stock", value: totalProducts - lowStockProducts.length - outOfStockProducts.length, color: "#00C49F" },
    { name: "Low Stock", value: lowStockProducts.length, color: "#FFBB28" },
    { name: "Out of Stock", value: outOfStockProducts.length, color: "#FF8042" },
  ]

  const topProductsByValue = products
    .map((p: Product) => ({
      name: p.name,
      value: p.price * p.stockQuantity,
      quantity: p.stockQuantity,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (quantity <= 10) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor stock levels and inventory performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">≤10 units remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
            <CardDescription>Overview of inventory stock status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Value</CardTitle>
            <CardDescription>Highest value inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsByValue.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
          <CardDescription>Complete inventory listing with stock levels</CardDescription>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={stockFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("all")}
              >
                All
              </Button>
              <Button
                variant={stockFilter === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("low")}
              >
                Low Stock
              </Button>
              <Button
                variant={stockFilter === "out" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("out")}
              >
                Out of Stock
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock Quantity</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product: Product) => {
                  const status = getStockStatus(product.stockQuantity)
                  const totalValue = product.price * product.stockQuantity

                  return (
                    <tr key={product.productId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="font-medium">{product.name}</div>
                      </td>
                      <td className="p-4">${product.price.toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${
                            product.stockQuantity === 0
                              ? "text-red-600"
                              : product.stockQuantity <= 10
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="p-4 font-medium">${totalValue.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">No products found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
