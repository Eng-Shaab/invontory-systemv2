"use client"

import { useState } from "react"
import { useGetSalesQuery } from "@/state/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/(components)/ui/dialog"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { Download, FileText, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface SalesReportModalProps {
  isOpen: boolean
  onClose: () => void
}

const SalesReportModal = ({ isOpen, onClose }: SalesReportModalProps) => {
  const [reportType, setReportType] = useState("full")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const { data: sales } = useGetSalesQuery(undefined, { skip: !isAdmin })

  if (!isAdmin) {
    return null
  }

  const handleGenerateReport = async () => {
    if (!sales || sales.length === 0) {
      alert("No sales data available to generate report")
      return
    }

    setIsGenerating(true)

    try {
      const { generateSalesPDF } = await import("@/lib/pdf-generator")

      const reportData = {
        type: reportType as "full" | "summary" | "topCustomers" | "profitAnalysis",
        dateRange: { from: dateFrom, to: dateTo },
        sales: sales || [],
      }

      await generateSalesPDF(reportData)
      alert("Sales report generated and downloaded successfully!")
      onClose()
    } catch (error) {
      console.error("Error generating sales PDF:", error)
      alert("Error generating report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypeDescriptions = {
    full: "Complete sales report with all transactions",
    summary: "Sales summary with key metrics",
    topCustomers: "Top customers by sales volume",
    profitAnalysis: "Detailed profit analysis",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Sales Report
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
                <SelectItem value="full">Full Sales Report</SelectItem>
                <SelectItem value="summary">Sales Summary</SelectItem>
                <SelectItem value="topCustomers">Top Customers</SelectItem>
                <SelectItem value="profitAnalysis">Profit Analysis</SelectItem>
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

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-weight: 600 mb-1">Report will include:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Complete sales transactions with details</li>
                  <li>Revenue and profit summary</li>
                  <li>Customer and product information</li>
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

export default SalesReportModal
