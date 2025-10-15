"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, MessageSquare, FileText, Cloud, AlertTriangle, Clock, CheckCircle, XCircle, BarChart3, Filter, X } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CriticalIssues } from "@/components/critical-issues"

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

  // Filter state
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null)
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null)

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

  const getUrgencyBadgeVariant = (urgency: string, sentiment: string) => {
    // Only show urgency/severity for negative comments
    if (sentiment !== "negative") {
      return null; // Don't show urgency badge for positive/neutral comments
    }
    
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

  // Filter summaries based on current filters
  const filteredSummaries = summaries.filter(summary => {
    if (sentimentFilter && summary.sentiment !== sentimentFilter) {
      return false;
    }
    // Only apply urgency filter for negative comments
    if (urgencyFilter && (summary.sentiment !== "negative" || summary.urgency.toLowerCase() !== urgencyFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setSentimentFilter(null);
    setUrgencyFilter(null);
  };

  // Handle sentiment filter change - clear urgency filter if switching to positive/neutral
  const handleSentimentFilter = (sentiment: string | null) => {
    setSentimentFilter(sentiment === sentimentFilter ? null : sentiment);
    if (sentiment === "positive" || sentiment === "neutral") {
      setUrgencyFilter(null);
    }
  };

  const hasActiveFilters = sentimentFilter || urgencyFilter;

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

      {/* Critical Issues Section */}
      <CriticalIssues issues={summaries} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Sentiment Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => {
                    if (percent > 0.05) { // Only show label if > 5%
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }
                    return "";
                  }}
                  labelLine={false}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={() => ""}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend for Sentiment Distribution */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {sentimentData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
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
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => {
                    if (percent > 0.05) { // Only show label if > 5%
                      const shortName = name === "Not Applicable" ? "N/A" : name;
                      return `${shortName} ${(percent * 100).toFixed(0)}%`;
                    }
                    return "";
                  }}
                  labelLine={false}
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={() => ""}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend for Urgency Analysis */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {urgencyData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Comment Summaries</span>
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              )}
              <Badge variant="secondary" className="text-xs">
                {filteredSummaries.length} of {summaries.length}
              </Badge>
            </div>
          </CardTitle>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Sentiment:</span>
              </div>
              <Button
                variant={sentimentFilter === "positive" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSentimentFilter("positive")}
                className="h-8 text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Positive
              </Button>
              <Button
                variant={sentimentFilter === "negative" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSentimentFilter("negative")}
                className="h-8 text-xs"
              >
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                Negative
              </Button>
              <Button
                variant={sentimentFilter === "neutral" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSentimentFilter("neutral")}
                className="h-8 text-xs"
              >
                <Minus className="h-3 w-3 mr-1 text-gray-500" />
                Neutral
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Severity (Negative Only):</span>
              <Button
                variant={urgencyFilter === "critical" ? "default" : "outline"}
                size="sm"
                onClick={() => setUrgencyFilter(urgencyFilter === "critical" ? null : "critical")}
                className="h-8 text-xs"
                disabled={sentimentFilter === "positive" || sentimentFilter === "neutral"}
              >
                <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                Critical
              </Button>
              <Button
                variant={urgencyFilter === "moderate" ? "default" : "outline"}
                size="sm"
                onClick={() => setUrgencyFilter(urgencyFilter === "moderate" ? null : "moderate")}
                className="h-8 text-xs"
                disabled={sentimentFilter === "positive" || sentimentFilter === "neutral"}
              >
                <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                Moderate
              </Button>
              <Button
                variant={urgencyFilter === "minor" ? "default" : "outline"}
                size="sm"
                onClick={() => setUrgencyFilter(urgencyFilter === "minor" ? null : "minor")}
                className="h-8 text-xs"
                disabled={sentimentFilter === "positive" || sentimentFilter === "neutral"}
              >
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Minor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSummaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No comments match your filters</p>
              <p className="text-sm">Try adjusting your filter criteria or clear all filters to see more comments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSummaries.slice(0, 10).map((summary) => {
                const urgencyBadgeVariant = getUrgencyBadgeVariant(summary.urgency, summary.sentiment);
                
                return (
                  <div key={summary.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSentimentBadgeVariant(summary.sentiment)}>
                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(summary.sentiment)}
                            <span className="capitalize">{summary.sentiment}</span>
                          </div>
                        </Badge>
                        {/* Only show urgency badge for negative comments */}
                        {urgencyBadgeVariant && (
                          <Badge variant={urgencyBadgeVariant}>
                            <div className="flex items-center space-x-1">
                              {getUrgencyIcon(summary.urgency)}
                              <span className="capitalize">{summary.urgency}</span>
                            </div>
                          </Badge>
                        )}
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
                );
              })}
              
              {filteredSummaries.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing 10 of {filteredSummaries.length} filtered comments
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
