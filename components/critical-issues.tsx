"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Zap, XCircle, Clock, ArrowUp } from "lucide-react"

interface CriticalIssue {
  id: string
  originalComment: string
  summary: string
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
  urgency: string
}

interface CriticalIssuesProps {
  issues: CriticalIssue[]
}

export function CriticalIssues({ issues }: CriticalIssuesProps) {
  // Filter for critical issues and get top 5 by sentiment score (most negative = most critical)
  const criticalIssues = issues
    .filter(issue => issue.urgency.toLowerCase() === "critical")
    .sort((a, b) => a.sentimentScore - b.sentimentScore) // Sort by most negative sentiment first
    .slice(0, 5)

  const getSeverityLevel = (score: number) => {
    if (score <= 0.3) return { 
      level: "High", 
      color: "bg-red-500", 
      textColor: "text-red-700", 
      bgColor: "bg-red-50 dark:bg-red-950/20" 
    }
    if (score <= 0.5) return { 
      level: "Medium", 
      color: "bg-orange-500", 
      textColor: "text-orange-700", 
      bgColor: "bg-orange-50 dark:bg-orange-950/20" 
    }
    return { 
      level: "Low", 
      color: "bg-yellow-500", 
      textColor: "text-yellow-700", 
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20" 
    }
  }

  const getSeverityIcon = (score: number) => {
    if (score <= 0.3) return <XCircle className="h-4 w-4 text-red-500" />
    if (score <= 0.5) return <AlertTriangle className="h-4 w-4 text-orange-500" />
    return <Clock className="h-4 w-4 text-yellow-500" />
  }

  if (criticalIssues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Critical Issues</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Critical Issues Found</h3>
            <p className="text-muted-foreground">
              Great news! No critical issues were identified in the analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Critical Issues</span>
          </div>
          <Badge variant="destructive" className="text-xs">
            {criticalIssues.length} Issue{criticalIssues.length !== 1 ? 's' : ''} Found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {criticalIssues.map((issue, index) => {
            const severity = getSeverityLevel(issue.sentimentScore)
            return (
              <div 
                key={issue.id} 
                className={`relative p-4 pl-8 border border-border rounded-lg transition-all hover:shadow-md ${severity.bgColor} border-l-4 border-l-red-500`}
              >
                {/* Rank Badge - Fixed positioning */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                  {index + 1}
                </div>

                <div className="space-y-4">
                  {/* Issue Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Critical</span>
                        </div>
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${severity.textColor}`}>
                        <div className="flex items-center space-x-1">
                          {getSeverityIcon(issue.sentimentScore)}
                          <span className="hidden sm:inline">{severity.level} Severity</span>
                          <span className="sm:hidden">{severity.level}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <ArrowUp className="h-3 w-3 rotate-180 text-red-500" />
                      <span className="text-xs sm:text-sm">Score: {issue.sentimentScore}</span>
                    </div>
                  </div>

                  {/* Issue Summary */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Issue Summary:</h4>
                      <p className="text-sm text-foreground leading-relaxed">{issue.summary}</p>
                    </div>
                    
                    {/* Original Comment Preview */}
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Original Comment:</h4>
                      <div className="text-xs text-muted-foreground italic bg-white/50 p-3 rounded border break-words">
                        <span className="block sm:hidden">
                          {issue.originalComment.length > 80
                            ? `${issue.originalComment.substring(0, 80)}...`
                            : issue.originalComment}
                        </span>
                        <span className="hidden sm:block">
                          {issue.originalComment.length > 120
                            ? `${issue.originalComment.substring(0, 120)}...`
                            : issue.originalComment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar showing severity */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-muted-foreground font-medium min-w-fit">Severity:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${severity.color} transition-all duration-300`}
                        style={{ width: `${Math.max(20, (1 - issue.sentimentScore) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer with additional info */}
        {criticalIssues.length > 0 && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-700">
                <p className="font-medium mb-1">Action Required:</p>
                <p>
                  These critical issues require immediate attention. Consider prioritizing responses and 
                  addressing the concerns raised in these comments to improve stakeholder satisfaction.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}