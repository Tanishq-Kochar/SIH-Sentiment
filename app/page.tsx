"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { AnalysisResults } from "@/components/analysis-results"
import { Header } from "@/components/header"

export default function HomePage() {
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setAnalysisData(data)
    } catch (error) {
      console.error("Error analyzing file:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">eConsultation Analysis Platform</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your CSV file containing stakeholder comments to get AI-powered sentiment analysis, summaries, and
              word cloud visualizations.
            </p>
          </div>

          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

          {analysisData && <AnalysisResults data={analysisData} />}
        </div>
      </main>
    </div>
  )
}
