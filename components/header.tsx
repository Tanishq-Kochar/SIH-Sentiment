import { FileText, BarChart3 } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">eConsultation AI</h1>
              <p className="text-sm text-muted-foreground">Ministry of Corporate Affairs</p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Analysis Dashboard</span>
          </div>
        </div>
      </div>
    </header>
  )
}
