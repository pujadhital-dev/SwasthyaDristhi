import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Icon from '../components/common/Icon'
import { Avatar } from '../components/admin/ui'
import { ToastProvider } from '../context/ToastContext'
import { getCurrentUser, logout } from '../services/authService'
import logo from '../assets/logo.jpeg'

const NAV = [
  { to: '/admin/dashboard', label: 'Overview', icon: 'grid' },
  { to: '/admin/patients', label: 'Patients', icon: 'users' },
  { to: '/admin/doctors', label: 'Doctors', icon: 'stethoscope' },
]

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[4.5rem] items-center px-6">
        <Link to="/admin/dashboard" onClick={onNavigate} aria-label="SwasthyaDrishti admin home">
          <img src={logo} alt="SwasthyaDrishti" className="h-10 w-auto" />
        </Link>
      </div>

      <p className="px-6 pt-4 pb-2 text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Manage</p>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-semibold transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} className={`size-[1.35rem] ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-brand-950 p-4 text-white">
        <div className="flex items-center gap-2 text-base font-semibold">
          <Icon name="shield" className="size-4 text-health-400" />
          Super Admin
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">
          You manage doctor accounts and patient assignments. Medical records stay with doctors and patients.
        </p>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const name = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Admin'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-lift">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <Icon name="close" className="size-5" />
              </button>
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <div className="lg:pl-72">
          <header className="sticky top-0 z-20 flex h-[4.5rem] items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-1 cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Icon name="menu" className="size-5" />
            </button>
            <img src={logo} alt="SwasthyaDrishti" className="h-7 w-auto lg:hidden" />

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-base leading-tight font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <Avatar name={name} />
              <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Icon name="logout" className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
