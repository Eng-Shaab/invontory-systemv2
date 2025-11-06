import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export interface InventoryReportConfig {
  type: "full" | "lowStock" | "highValue" | "summary"
  dateRange: { from: string; to: string }
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
}

export interface SalesReportConfig {
  type: "full" | "summary" | "topCustomers" | "profitAnalysis"
  dateRange: { from: string; to: string }
  sales: Array<{
    saleId: string | number
    product?: { name: string }
    customer?: { name: string }
    quantity: number
    unitPrice: number
    totalAmount: number
    profit: number
    createdAt: string
  }>
}

const filterProductsByType = (
  products: InventoryReportConfig["products"],
  type: InventoryReportConfig["type"],
  dateFrom: string,
  dateTo: string,
) => {
  let filtered = [...products]

  if (dateFrom || dateTo) {
    const fromDate = dateFrom ? new Date(dateFrom) : new Date("1900-01-01")
    const toDate = dateTo ? new Date(dateTo) : new Date()

    filtered = filtered.filter((p) => {
      const productDate = new Date(p.createdAt || "")
      return productDate >= fromDate && productDate <= toDate
    })
  }

  switch (type) {
    case "lowStock":
      return filtered.filter((p) => p.stockQuantity < 10)
    case "highValue":
      return filtered.sort((a, b) => b.price * b.stockQuantity - a.price * a.stockQuantity)
    case "summary":
      return filtered.slice(0, 10)
    case "full":
    default:
      return filtered
  }
}

const generateInventoryHTML = (config: InventoryReportConfig): string => {
  const filteredProducts = filterProductsByType(
    config.products,
    config.type,
    config.dateRange.from,
    config.dateRange.to,
  )

  const totalStockValue = filteredProducts.reduce((sum, p) => sum + p.price * p.stockQuantity, 0)
  const totalCostValue = filteredProducts.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0)
  const totalProfit = totalStockValue - totalCostValue
  const lowStockCount = filteredProducts.filter((p) => p.stockQuantity < 10).length

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const productRows = filteredProducts
    .map(
      (p) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${p.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${p.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${p.costPrice.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.stockQuantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(p.price * p.stockQuantity).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
          ${
            p.stockQuantity === 0
              ? "background-color: #fee2e2; color: #991b1b;"
              : p.stockQuantity < 10
                ? "background-color: #fef08a; color: #854d0e;"
                : "background-color: #dcfce7; color: #166534;"
          }">
          ${p.stockQuantity === 0 ? "OUT" : p.stockQuantity < 10 ? "LOW" : "OK"}
        </span>
      </td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 20px; }
        .header h1 { color: #0066cc; font-size: 28px; }
        .header .info { text-align: right; font-size: 12px; color: #666; }
        .system-name { font-size: 12px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
        .date-range { margin-bottom: 30px; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #0066cc; border-radius: 4px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .summary-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; }
        .summary-card .label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #0066cc; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table thead { background-color: #0066cc; }
        table thead th { color: white; padding: 12px; text-align: left; font-weight: 600; }
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="system-name">SANABIL ABAYA SYSTEM</div>
            <h1>Inventory Report</h1>
          </div>
          <div class="info">
            <div><strong>${reportDate}</strong></div>
            <div style="margin-top: 5px; color: #0066cc;">
              ${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Report
            </div>
          </div>
        </div>

        <div class="date-range">
          <strong>Report Period:</strong> ${config.dateRange.from ? new Date(config.dateRange.from).toLocaleDateString() : "Start"} 
          to ${config.dateRange.to ? new Date(config.dateRange.to).toLocaleDateString() : "Present"}
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Products</div>
            <div class="value">${filteredProducts.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Stock Value</div>
            <div class="value">$${totalStockValue.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Profit</div>
            <div class="value" style="color: ${totalProfit > 0 ? "#10b981" : "#ef4444"};">$${totalProfit.toFixed(2)}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Low Stock Items</div>
            <div class="value" style="color: #f59e0b;">${lowStockCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Cost Value</div>
            <div class="value">$${totalCostValue.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Profit Margin</div>
            <div class="value">${totalStockValue > 0 ? ((totalProfit / totalStockValue) * 100).toFixed(1) : "0"}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Cost</th>
              <th style="text-align: right;">Stock</th>
              <th style="text-align: right;">Value</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `
}

const generateSalesHTML = (config: SalesReportConfig): string => {
  const filteredSales = config.sales.filter((s) => {
    if (!config.dateRange.from && !config.dateRange.to) return true
    const fromDate = config.dateRange.from ? new Date(config.dateRange.from) : new Date("1900-01-01")
    const toDate = config.dateRange.to ? new Date(config.dateRange.to) : new Date()
    const saleDate = new Date(s.createdAt)
    return saleDate >= fromDate && saleDate <= toDate
  })

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0)
  const totalQuantity = filteredSales.reduce((sum, s) => sum + s.quantity, 0)

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const salesRows = filteredSales
    .map(
      (s) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${s.product?.name || "Unknown"}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${s.customer?.name || "Unknown"}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${s.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${s.unitPrice.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${s.totalAmount.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="color: ${s.profit > 0 ? "#10b981" : "#ef4444"}; font-weight: 500;">$${s.profit.toFixed(2)}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">
        ${new Date(s.createdAt).toLocaleDateString()}
      </td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
        .header h1 { color: #10b981; font-size: 28px; }
        .header .info { text-align: right; font-size: 12px; color: #666; }
        .system-name { font-size: 12px; font-weight: bold; color: #10b981; margin-bottom: 5px; }
        .date-range { margin-bottom: 30px; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #10b981; border-radius: 4px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .summary-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; }
        .summary-card .label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #10b981; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table thead { background-color: #10b981; }
        table thead th { color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
        table tbody td { font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="system-name">SANABIL ABAYA SYSTEM</div>
            <h1>Sales Report</h1>
          </div>
          <div class="info">
            <div><strong>${reportDate}</strong></div>
            <div style="margin-top: 5px; color: #10b981;">
              ${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Report
            </div>
          </div>
        </div>

        <div class="date-range">
          <strong>Report Period:</strong> ${config.dateRange.from ? new Date(config.dateRange.from).toLocaleDateString() : "Start"} 
          to ${config.dateRange.to ? new Date(config.dateRange.to).toLocaleDateString() : "Present"}
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Sales</div>
            <div class="value">${filteredSales.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Revenue</div>
            <div class="value">$${totalRevenue.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Profit</div>
            <div class="value" style="color: #10b981;">$${totalProfit.toFixed(2)}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Quantity Sold</div>
            <div class="value">${totalQuantity}</div>
          </div>
          <div class="summary-card">
            <div class="label">Average Sale Value</div>
            <div class="value">$${filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : "0"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Profit Margin</div>
            <div class="value">${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0"}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th style="text-align: right;">Quantity</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
              <th style="text-align: right;">Profit</th>
              <th style="text-align: center;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `
}

export const generatePDFFromHTML = async (htmlContent: string, filename: string): Promise<void> => {
  const element = document.createElement("div")
  element.innerHTML = htmlContent
  element.style.position = "absolute"
  element.style.top = "-10000px"
  document.body.appendChild(element)

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
    console.log("[v0] PDF generated and downloaded:", filename)
  } finally {
    document.body.removeChild(element)
  }
}

export const generateInventoryPDF = async (config: InventoryReportConfig): Promise<void> => {
  const htmlContent = generateInventoryHTML(config)
  const filename = `Inventory-Report-${config.type}-${new Date().toISOString().split("T")[0]}.pdf`
  await generatePDFFromHTML(htmlContent, filename)
}

export const generateSalesPDF = async (config: SalesReportConfig): Promise<void> => {
  const htmlContent = generateSalesHTML(config)
  const filename = `Sales-Report-${config.type}-${new Date().toISOString().split("T")[0]}.pdf`
  await generatePDFFromHTML(htmlContent, filename)
}
