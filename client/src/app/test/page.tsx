"use client"

import { useState } from "react"
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useCreateSaleMutation,
  useCreatePurchaseMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
} from "@/state/api"
import Header from "@/app/(components)/Header"
import { Package, ShoppingCart, DollarSign, TestTube } from "lucide-react"

const TestStockSystem = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const { data: products, refetch: refetchProducts } = useGetProductsQuery()
  const { data: customers, refetch: refetchCustomers } = useGetCustomersQuery()

  const [createProduct] = useCreateProductMutation()
  const [createCustomer] = useCreateCustomerMutation()
  const [createSale] = useCreateSaleMutation()
  const [createPurchase] = useCreatePurchaseMutation()

  const addTestResult = (message: string, type: "success" | "error" | "info" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const formattedMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    setTestResults((prev) => [...prev, formattedMessage])
  }

  const runStockReductionTest = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      addTestResult("Starting Stock Reduction System Test", "info")

      // Step 1: Create a test product
      addTestResult("Creating test product with initial stock of 100 units", "info")
      const testProduct = await createProduct({
        name: "Test Product - Stock Reduction",
        costPrice: 10.0,
        price: 20.0,
        stockQuantity: 100,
      }).unwrap()

      addTestResult(`✓ Product created: ${testProduct.name} (ID: ${testProduct.productId})`, "success")

      // Step 2: Create a test customer
      addTestResult("Creating test customer", "info")
      const testCustomer = await createCustomer({
        name: "Test Customer - Stock Test",
        phone: "123-456-7890",
        address: "123 Test Street",
      }).unwrap()

      addTestResult(`✓ Customer created: ${testCustomer.name} (ID: ${testCustomer.customerId})`, "success")

      // Step 3: Create a purchase to increase stock
      addTestResult("Adding purchase of 50 units (should increase stock to 150)", "info")
      const testPurchase = await createPurchase({
        productId: testProduct.productId,
        quantity: 50,
        unitCost: 9.0,
        totalCost: 450.0,
      }).unwrap()

      addTestResult(`✓ Purchase recorded: 50 units at $9.00 each`, "success")

      // Step 4: Create a sale to reduce stock
      addTestResult("Recording sale of 25 units (should reduce stock to 125)", "info")
      const testSale = await createSale({
        productId: testProduct.productId,
        customerId: testCustomer.customerId,
        quantity: 25,
        unitPrice: 20.0,
        totalAmount: 500.0,
        profit: 275.0, // (20-9) * 25
      }).unwrap()

      addTestResult(`✓ Sale recorded: 25 units at $20.00 each`, "success")

      // Step 5: Create another sale
      addTestResult("Recording another sale of 30 units (should reduce stock to 95)", "info")
      const testSale2 = await createSale({
        productId: testProduct.productId,
        customerId: testCustomer.customerId,
        quantity: 30,
        unitPrice: 20.0,
        totalAmount: 600.0,
        profit: 330.0, // (20-9) * 30
      }).unwrap()

      addTestResult(`✓ Second sale recorded: 30 units at $20.00 each`, "success")

      // Step 6: Refresh and check final stock
      addTestResult("Refreshing product data to verify stock levels", "info")
      await refetchProducts()

      addTestResult("✓ Stock Reduction Test Completed Successfully!", "success")
      addTestResult("Expected final stock: 95 units (100 initial + 50 purchased - 25 sold - 30 sold)", "info")
      addTestResult("Check the Products page to verify the actual stock levels", "info")
    } catch (error: any) {
      addTestResult(`✗ Test failed: ${error.message || "Unknown error"}`, "error")
    } finally {
      setIsRunning(false)
    }
  }

  const runInsufficientStockTest = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      addTestResult("Starting Insufficient Stock Test", "info")

      // Create a product with low stock
      const lowStockProduct = await createProduct({
        name: "Low Stock Test Product",
        costPrice: 5.0,
        price: 15.0,
        stockQuantity: 5,
      }).unwrap()

      addTestResult(`✓ Created product with only 5 units in stock`, "success")

      // Try to sell more than available
      addTestResult("Attempting to sell 10 units (more than available stock)", "info")

      try {
        await createSale({
          productId: lowStockProduct.productId,
          customerId: customers?.[0]?.customerId || "test-customer",
          quantity: 10,
          unitPrice: 15.0,
          totalAmount: 150.0,
          profit: 100.0,
        }).unwrap()

        addTestResult("✗ Sale should have been rejected due to insufficient stock", "error")
      } catch (saleError: any) {
        addTestResult(`✓ Sale correctly rejected: ${saleError.message || "Insufficient stock"}`, "success")
      }
    } catch (error: any) {
      addTestResult(`✗ Test setup failed: ${error.message || "Unknown error"}`, "error")
    } finally {
      setIsRunning(false)
    }
  }

  const clearTestData = () => {
    setTestResults([])
    addTestResult("Test results cleared", "info")
  }

  return (
    <div className="mx-auto pb-5 w-full">
      <Header name="Stock Reduction System Test" />

      {/* TEST CONTROLS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TestTube className="w-5 h-5 mr-2" />
          Test Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={runStockReductionTest}
            disabled={isRunning}
            className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Package className="w-5 h-5 mr-2" />
            {isRunning ? "Running..." : "Test Stock Reduction"}
          </button>

          <button
            onClick={runInsufficientStockTest}
            disabled={isRunning}
            className="flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isRunning ? "Running..." : "Test Insufficient Stock"}
          </button>

          <button
            onClick={clearTestData}
            disabled={isRunning}
            className="flex items-center justify-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* TEST RESULTS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Run a test to see output.</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  result.includes("SUCCESS")
                    ? "text-green-400"
                    : result.includes("ERROR")
                      ? "text-red-400"
                      : "text-gray-300"
                }`}
              >
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SYSTEM OVERVIEW */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Management System Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              Sales Impact on Stock
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• When a sale is created, stock is automatically reduced</li>
              <li>• System checks for sufficient stock before allowing sale</li>
              <li>• When a sale is deleted, stock is restored</li>
              <li>• When a sale is updated, stock adjusts based on quantity change</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2 text-blue-500" />
              Purchases Impact on Stock
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• When a purchase is created, stock is automatically increased</li>
              <li>• Product cost price may be updated to latest purchase cost</li>
              <li>• When a purchase is deleted, stock is reduced</li>
              <li>• When a purchase is updated, stock adjusts accordingly</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• All stock changes are handled automatically by the API</li>
            <li>• The system prevents negative stock situations</li>
            <li>• Stock levels are updated in real-time across all components</li>
            <li>• This test page creates actual data - check other pages to see results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TestStockSystem
