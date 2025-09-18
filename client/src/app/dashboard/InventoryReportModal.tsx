"use client"

import { useState } from "react"
import { useGetDashboardMetricsQuery, useGetProductsQuery } from "@/state/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/(components)/ui/dialog"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { Download, FileText } from "lucide-react"

interface InventoryReportModalProps {
  isOpen: boolean
  onClose: () => void
}

const InventoryReportModal = ({ isOpen, onClose }: InventoryReportModalProps) => {
  const [reportType, setReportType] = useState("full")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [format, setFormat] = useState("pdf")

  const { data: dashboardMetrics } = useGetDashboardMetricsQuery()
  const { data: products } = useGetProductsQuery("")

  const handleGenerateReport = () => {
    // Generate report logic here
    const reportData = {
      type: reportType,
      dateRange: { from: dateFrom, to: dateTo },
      format: format,
      data: {
        products: products || [],
        metrics: dashboardMetrics || {},
        generatedAt: new Date().toISOString(),
      },
    }

    console.log("[v0] Generating inventory report:", reportData)

    // Simulate report generation
    alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} inventory report generated successfully!`)
    onClose()
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
            <Select value={reportType} onValueChange={setReportType}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Report Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Total Products: {products?.length || 0}</p>
              <p>• Report Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
              <p>
                • Date Range: {dateFrom || "All time"} - {dateTo || "Present"}
              </p>
              <p>• Format: {format.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InventoryReportModal
