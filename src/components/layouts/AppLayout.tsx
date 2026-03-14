import { Navigation } from '@components/ui/Navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      {children}
    </div>
  )
}
