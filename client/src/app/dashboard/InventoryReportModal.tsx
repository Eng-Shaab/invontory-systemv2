"use client"

import { useState } from "react"
import { useGetProductsQuery } from "@/state/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/(components)/ui/dialog"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { Download, FileText, AlertCircle } from "lucide-react"
import { generateCSV, generateExcel } from "@/lib/report-generator"
import { generateInventoryPDF } from "@/lib/pdf-generator"

interface InventoryReportModalProps {
  isOpen: boolean
  onClose: () => void
}

const InventoryReportModal = ({ isOpen, onClose }: InventoryReportModalProps) => {
  const [reportType, setReportType] = useState("full")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [format, setFormat] = useState("csv")
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: products } = useGetProductsQuery("")

  const handleGenerateReport = async () => {
    if (!products || products.length === 0) {
      alert("No products available to generate report")
      return
    }

    setIsGenerating(true)

    try {
      const reportData = {
        type: reportType as "full" | "lowStock" | "highValue" | "summary",
        dateRange: { from: dateFrom, to: dateTo },
        format: format as "pdf" | "excel" | "csv",
        products: products || [],
        metrics: {
          totalProducts: products.length,
          totalStockValue: products.reduce((sum, p) => sum + p.stockQuantity * p.price, 0),
          lowStockItems: products.filter((p) => p.stockQuantity < 10).length,
        },
        generatedAt: new Date().toISOString(),
      }

      let content = ""
      let filename = `inventory-report-${reportType}-${new Date().toISOString().split("T")[0]}`
      let mimeType = "text/plain"

      switch (format) {
        case "pdf":
          await generateInventoryPDF(reportData)
          filename += ".pdf"
          mimeType = "application/pdf"
          break
        case "excel":
          content = generateExcel(reportData)
          filename += ".xlsx"
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          break
        case "csv":
        default:
          content = generateCSV(reportData)
          filename += ".csv"
          mimeType = "text/csv"
          break
      }

      console.log("[v0] Generated report data:", reportData)

      if (format !== "pdf") {
        const blob = new Blob([content], { type: mimeType })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }

      alert(`Report generated and downloaded successfully as ${filename}`)
      onClose()
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      alert("Error generating report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypeDescriptions = {
    full: "Complete inventory with all products",
    lowStock: "Products with stock below 10 units",
    highValue: "High value products by total stock value",
    summary: "Top 10 products summary",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Inventory Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Inventory Report</SelectItem>
                <SelectItem value="lowStock">Low Stock Report</SelectItem>
                <SelectItem value="highValue">High Value Items</SelectItem>
                <SelectItem value="summary">Inventory Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {reportTypeDescriptions[reportType as keyof typeof reportTypeDescriptions]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date (Optional)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date (Optional)</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Report will include:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Product details with SKU and pricing</li>
                  <li>Stock quantities and values</li>
                  <li>Profit margins and cost analysis</li>
                  <li>Beautiful professional PDF with logo</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate & Download"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InventoryReportModal
