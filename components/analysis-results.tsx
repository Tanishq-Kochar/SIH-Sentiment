"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, MessageSquare, FileText, Cloud } from "lucide-react"
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
  }>
  wordCloud: Array<{
    word: string
    frequency: number
  }>
}

interface AnalysisResultsProps {
  data: AnalysisData
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const { sentimentAnalysis, summaries, wordCloud } = data

  const sentimentData = [
    { name: "Positive", value: sentimentAnalysis.positive, color: "#10B981" },
    { name: "Negative", value: sentimentAnalysis.negative, color: "#EF4444" },
    { name: "Neutral", value: sentimentAnalysis.neutral, color: "#6B7280" },
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

  return (
    <div className="space-y-8">
      {/* Sentiment Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Word Cloud */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-primary" />
              <span>Top Keywords</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wordCloud.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
                  <Badge variant={getSentimentBadgeVariant(summary.sentiment)}>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(summary.sentiment)}
                      <span className="capitalize">{summary.sentiment}</span>
                    </div>
                  </Badge>
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
