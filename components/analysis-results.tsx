"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, MessageSquare, FileText, Cloud, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface AnalysisData {
  sentimentAnalysis: {
    positive: number
    negative: number
    neutral: number
    totalComments: number
  }
  summaries: Array<{
    id: string
    originalComment: string
    summary: string
    sentiment: "positive" | "negative" | "neutral"
    sentimentScore: number
    urgency: string
  }>
  wordCloud: {
    image: string
    format: string
  }
  urgencyAnalysis: {
    critical: number
    moderate: number
    minor: number
    notApplicable: number
  }
  averageSentimentScore: number
}

interface AnalysisResultsProps {
  data: AnalysisData
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const { sentimentAnalysis, summaries, wordCloud, urgencyAnalysis, averageSentimentScore } = data

  const sentimentData = [
    { name: "Positive", value: sentimentAnalysis.positive, color: "#10B981" },
    { name: "Negative", value: sentimentAnalysis.negative, color: "#EF4444" },
    { name: "Neutral", value: sentimentAnalysis.neutral, color: "#6B7280" },
  ]

  const urgencyData = [
    { name: "Critical", value: urgencyAnalysis.critical, color: "#DC2626" },
    { name: "Moderate", value: urgencyAnalysis.moderate, color: "#F59E0B" },
    { name: "Minor", value: urgencyAnalysis.minor, color: "#10B981" },
    { name: "Not Applicable", value: urgencyAnalysis.notApplicable, color: "#6B7280" },
  ]

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "default"
      case "negative":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "moderate":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "minor":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "not applicable":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical":
        return "destructive"
      case "moderate":
        return "default"
      case "minor":
        return "secondary"
      case "not applicable":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      {/* Sentiment Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Comments</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{sentimentAnalysis.totalComments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Positive</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{sentimentAnalysis.positive}</p>
            <Progress value={(sentimentAnalysis.positive / sentimentAnalysis.totalComments) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Negative</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{sentimentAnalysis.negative}</p>
            <Progress value={(sentimentAnalysis.negative / sentimentAnalysis.totalComments) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Minus className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-muted-foreground">Neutral</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{sentimentAnalysis.neutral}</p>
            <Progress value={(sentimentAnalysis.neutral / sentimentAnalysis.totalComments) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{averageSentimentScore.toFixed(2)}</p>
            <Progress value={Math.abs(averageSentimentScore) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-primary" />
              <span>Sentiment Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Urgency Analysis Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Urgency Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Word Cloud Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span>Word Cloud Visualization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wordCloud.image ? (
            <div className="flex justify-center">
              <img 
                src={`data:image/png;base64,${wordCloud.image}`} 
                alt="Word Cloud" 
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Word cloud not available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Comment Summaries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaries.slice(0, 5).map((summary) => (
              <div key={summary.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSentimentBadgeVariant(summary.sentiment)}>
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(summary.sentiment)}
                        <span className="capitalize">{summary.sentiment}</span>
                      </div>
                    </Badge>
                    <Badge variant={getUrgencyBadgeVariant(summary.urgency)}>
                      <div className="flex items-center space-x-1">
                        {getUrgencyIcon(summary.urgency)}
                        <span className="capitalize">{summary.urgency}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score: {summary.sentimentScore}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Summary:</h4>
                    <p className="text-foreground">{summary.summary}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Original Comment:</h4>
                    <p className="text-sm text-muted-foreground italic">
                      {summary.originalComment.length > 200
                        ? `${summary.originalComment.substring(0, 200)}...`
                        : summary.originalComment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
