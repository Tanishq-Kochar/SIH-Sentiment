import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const pythonFormData = new FormData()
    pythonFormData.append("file", file)

    // Replace with your Colab ngrok URL
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "https://d2d6464b7ab1.ngrok-free.app/analyze"

    const response = await fetch(pythonBackendUrl, {
      method: "POST",
      body: pythonFormData,
    })

    if (!response.ok) {
      throw new Error(`Python backend error: ${response.statusText}`)
    }

    const analysisResults = await response.json()
    return NextResponse.json(analysisResults)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
