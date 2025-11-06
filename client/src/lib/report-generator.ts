// Report generation utilities for different formats

export interface ReportData {
  type: "full" | "lowStock" | "highValue" | "summary"
  dateRange: { from: string; to: string }
  format: "pdf" | "excel" | "csv"
  products: Array<{
    productId: string | number
    name: string
    price: number
    costPrice: number
    stockQuantity: number
    createdAt?: string
  }>
  metrics: {
    totalProducts: number
    totalStockValue: number
    lowStockItems: number
  }
  generatedAt: string
}

// Filter products based on report type
const filterProductsByType = (
  products: ReportData["products"],
  type: ReportData["type"],
  dateFrom: string,
  dateTo: string,
) => {
  let filtered = [...products]

  // Filter by date range if provided
  if (dateFrom || dateTo) {
    const fromDate = dateFrom ? new Date(dateFrom) : new Date("1900-01-01")
    const toDate = dateTo ? new Date(dateTo) : new Date()

    filtered = filtered.filter((p) => {
      const productDate = new Date(p.createdAt || "")
      return productDate >= fromDate && productDate <= toDate
    })
  }

  // Filter by report type
  switch (type) {
    case "lowStock":
      return filtered.filter((p) => p.stockQuantity < 10)
    case "highValue":
      return filtered.sort((a, b) => b.price * b.stockQuantity - a.price * a.stockQuantity)
    case "summary":
      return filtered.slice(0, 10) // Return top 10 for summary
    case "full":
    default:
      return filtered
  }
}

// Generate CSV format
export const generateCSV = (reportData: ReportData): string => {
  const filteredProducts = filterProductsByType(
    reportData.products,
    reportData.type,
    reportData.dateRange.from,
    reportData.dateRange.to,
  )

  const headers = [
    "Product ID",
    "Product Name",
    "Price",
    "Cost Price",
    "Stock Quantity",
    "Stock Value",
    "Profit Margin",
  ]
  const rows = filteredProducts.map((p) => [
    p.productId,
    p.name,
    p.price.toFixed(2),
    p.costPrice.toFixed(2),
    p.stockQuantity,
    (p.price * p.stockQuantity).toFixed(2),
    (((p.price - p.costPrice) / p.price) * 100).toFixed(2),
  ])

  // Summary section
  const totalStockValue = filteredProducts.reduce((sum, p) => sum + p.price * p.stockQuantity, 0)
  const totalCostValue = filteredProducts.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0)
  const totalProfit = totalStockValue - totalCostValue

  const csvContent = [
    `Inventory Report - ${reportData.type.charAt(0).toUpperCase() + reportData.type.slice(1)}`,
    `Generated: ${new Date(reportData.generatedAt).toLocaleString()}`,
    `Date Range: ${reportData.dateRange.from || "All"} to ${reportData.dateRange.to || "Present"}`,
    "",
    ...headers,
    ...rows.map((row) => row.join(",")),
    "",
    "SUMMARY",
    `Total Products:,${filteredProducts.length}`,
    `Total Stock Value:,$${totalStockValue.toFixed(2)}`,
    `Total Cost Value:,$${totalCostValue.toFixed(2)}`,
    `Total Profit:,$${totalProfit.toFixed(2)}`,
    `Low Stock Items:,${filteredProducts.filter((p) => p.stockQuantity < 10).length}`,
  ]

  return csvContent.join("\n")
}

// Generate Excel format (as CSV with better formatting)
export const generateExcel = (reportData: ReportData): string => {
  return generateCSV(reportData)
}

// Generate PDF format (as formatted text)
export const generatePDF = (reportData: ReportData): string => {
  const filteredProducts = filterProductsByType(
    reportData.products,
    reportData.type,
    reportData.dateRange.from,
    reportData.dateRange.to,
  )

  const totalStockValue = filteredProducts.reduce((sum, p) => sum + p.price * p.stockQuantity, 0)
  const totalCostValue = filteredProducts.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0)
  const totalProfit = totalStockValue - totalCostValue
  const lowStockCount = filteredProducts.filter((p) => p.stockQuantity < 10).length

  let pdfContent = `
================================================================================
                         INVENTORY REPORT
================================================================================

Report Type: ${reportData.type.charAt(0).toUpperCase() + reportData.type.slice(1)}
Generated: ${new Date(reportData.generatedAt).toLocaleString()}
Date Range: ${reportData.dateRange.from || "All"} to ${reportData.dateRange.to || "Present"}

================================================================================
                         SUMMARY STATISTICS
================================================================================

Total Products: ${filteredProducts.length}
Total Stock Value: $${totalStockValue.toFixed(2)}
Total Cost Value: $${totalCostValue.toFixed(2)}
Total Profit: $${totalProfit.toFixed(2)}
Low Stock Items: ${lowStockCount}

================================================================================
                         DETAILED PRODUCT LIST
================================================================================

`

  filteredProducts.forEach((product, index) => {
    const profit = product.price - product.costPrice
    const margin = ((profit / product.price) * 100).toFixed(2)
    pdfContent += `
${index + 1}. ${product.name}
   Product ID: ${product.productId}
   Price: $${product.price.toFixed(2)}
   Cost Price: $${product.costPrice.toFixed(2)}
   Stock Quantity: ${product.stockQuantity} units
   Stock Value: $${(product.price * product.stockQuantity).toFixed(2)}
   Profit per Unit: $${profit.toFixed(2)} (${margin}%)
   Status: ${product.stockQuantity === 0 ? "OUT OF STOCK" : product.stockQuantity < 10 ? "LOW STOCK" : "IN STOCK"}
`
  })

  pdfContent += `
================================================================================
                         END OF REPORT
================================================================================
`

  return pdfContent
}

// Download file helper
export const downloadFile = (content: string, filename: string, type: string) => {
  const element = document.createElement("a")
  const file = new Blob([content], { type })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}
