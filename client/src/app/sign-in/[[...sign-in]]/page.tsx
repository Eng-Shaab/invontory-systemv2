import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your EDSTOCK account</p>
        </div>

        {/* SignIn Form */}
        <SignIn
          appearance={{
            elements: {
              card: "shadow-lg rounded-xl p-8 bg-white",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formFieldInput:
                "border border-gray-300 rounded-md p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md w-full transition",
              formFieldLabel: "text-gray-700 font-medium mb-1",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
