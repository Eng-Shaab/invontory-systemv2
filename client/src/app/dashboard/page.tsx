"use client"

import { useGetDashboardMetricsQuery } from "@/state/api"
import { TrendingUp, Package, Users, ShoppingCart, Truck, FileText } from "lucide-react"
import Header from "@/app/(components)/Header"
import { useState } from "react"
import { Button } from "@/app/(components)/ui/button"
import InventoryReportModal from "./InventoryReportModal"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const Dashboard = () => {
  const { data: dashboardMetrics, isLoading, isError } = useGetDashboardMetricsQuery()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  if (isLoading) {
    return <div className="py-4">Loading dashboard...</div>
  }

  if (isError || !dashboardMetrics) {
    return <div className="text-center text-red-500 py-4">Failed to fetch dashboard metrics</div>
  }

  const { salesSummary, inventorySummary, customerSummary, topProducts, recentSales, recentPurchases } =
    dashboardMetrics

  console.log("[v0] dashboardMetrics:", dashboardMetrics)
  console.log("[v0] salesSummary:", salesSummary)
  console.log("[v0] inventorySummary:", inventorySummary)
  console.log("[v0] customerSummary:", customerSummary)

  const saleSummaryData = Array.isArray(salesSummary) ? salesSummary[0] : salesSummary
  const inventorySummaryData = Array.isArray(inventorySummary) ? inventorySummary[0] : inventorySummary
  const customerSummaryData = Array.isArray(customerSummary) ? customerSummary[0] : customerSummary

  const salesChartData =
    recentSales?.slice(0, 7).map((sale, index) => ({
      name: `Day ${index + 1}`,
      sales: sale.totalAmount,
      quantity: sale.quantity,
    })) || []

  const inventoryChartData =
    topProducts?.slice(0, 5).map((product) => ({
      name: product.name.substring(0, 10),
      stock: product.stockQuantity,
      value: product.price * product.stockQuantity,
    })) || []

  const customerChartData = [
    { name: "New", value: customerSummaryData?.newCustomers || 0, color: "#8884d8" },
    { name: "Repeat", value: customerSummaryData?.repeatCustomers || 0, color: "#82ca9d" },
  ]

  const purchaseChartData =
    recentPurchases?.slice(0, 6).map((purchase, index) => ({
      name: `P${index + 1}`,
      cost: purchase.totalCost,
      quantity: purchase.quantity,
    })) || []

  return (
    <div className="mx-auto pb-5 w-full">
      <div className="flex justify-between items-center mb-6">
        <Header name="Dashboard Overview" />
        <Button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* SUMMARY CARDS WITH CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Summary with Chart */}
        {saleSummaryData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${saleSummaryData.totalRevenue?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-gray-600">Profit: ${saleSummaryData.totalProfit?.toFixed(2) || "0.00"}</p>
                <p className="text-sm text-gray-600">Sales: {saleSummaryData.salesCount || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Inventory Summary with Chart */}
        {inventorySummaryData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventorySummaryData.totalProducts || 0}</p>
                <p className="text-sm text-gray-600">
                  Stock Value: ${inventorySummaryData.stockValue?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-red-600">Low Stock: {inventorySummaryData.lowStockItems || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData}>
                  <Bar dataKey="stock" fill="#3b82f6" />
                  <Tooltip formatter={(value) => [`${value}`, "Stock"]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Customer Summary with Chart */}
        {customerSummaryData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customerSummaryData.totalCustomers || 0}</p>
                <p className="text-sm text-gray-600">New: {customerSummaryData.newCustomers || 0}</p>
                <p className="text-sm text-gray-600">Repeat: {customerSummaryData.repeatCustomers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={customerChartData} cx="50%" cy="50%" innerRadius={20} outerRadius={50} dataKey="value">
                    {customerChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY WITH CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales with Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <ShoppingCart className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {recentSales?.slice(0, 3).map((sale) => (
              <div key={sale.saleId} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{sale.product?.name}</p>
                  <p className="text-sm text-gray-600">{sale.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${sale.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Qty: {sale.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases with Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Truck className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchases</h3>
          </div>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {recentPurchases?.slice(0, 3).map((purchase) => (
              <div key={purchase.purchaseId} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{purchase.product?.name}</p>
                  <p className="text-sm text-gray-600">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${purchase.totalCost.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Qty: {purchase.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS WITH CHART */}
      {topProducts && topProducts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "value" ? `$${value}` : value,
                    name === "value" ? "Value" : "Stock",
                  ]}
                />
                <Bar dataKey="value" fill="#8b5cf6" />
                <Bar dataKey="stock" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topProducts.slice(0, 4).map((product) => (
              <div key={product.productId} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-lg font-bold text-gray-800">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Stock: {product.stockQuantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <InventoryReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  )
}

export default Dashboard
