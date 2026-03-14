import { useAuth } from '@hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/pockets', label: 'Pockets', icon: '💳' },
  { path: '/ai-agent', label: 'AI Agent', icon: '🤖' },
  { path: '/audit-logs', label: 'Audit Logs', icon: '📋' },
]

export function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuth()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Logout gagal: ' + error)
    } else {
      toast.success('Logout berhasil')
      navigate('/auth/login')
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <span>💰</span>
            <span>Kusmani</span>
          </a>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">
              {profile?.display_name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto pb-2 gap-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon} {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
