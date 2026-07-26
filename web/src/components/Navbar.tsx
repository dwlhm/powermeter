import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, MoonIcon, SunIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'
import { useTheme } from '@/common'
import { useAuth } from '@/auth'

const pengaturanPermissions = [
  'kampus.view', 'unit.view', 'gedung.view',
  'powermeter.view', 'tarif.view', 'role.view', 'system.settings',
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({ logout }: { logout: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const { permissions } = useAuth()

  const navigation = [
    { name: 'Perangkat', href: '/perangkat', current: true, show: permissions.includes('device.view') },
    { name: 'Manajemen User', href: '/users', current: false, show: permissions.includes('user.view') },
    { name: 'Pengaturan', href: '/pengaturan', current: false, show: pengaturanPermissions.some(p => permissions.includes(p)) },
  ].filter(item => item.show)

  return (
    <Disclosure as="nav" className="bg-background/80 backdrop-blur-xl border-b border-border fixed top-0 right-0 left-0 z-20 h-16 transition-all">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <span className="text-primary font-bold text-xl tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    MPM
                  </span>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                      >
                        {({ isActive }) => <span className={classNames(
                          isActive ? 'bg-primary/20 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                          'rounded-md px-3 py-2 text-sm font-medium transition-all'
                        )}>{item.name}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative rounded-full p-2 text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <span className="sr-only">Ganti tema</span>
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  className="relative rounded-full p-2 text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all hover:border-primary/50">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-muted-foreground">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-card border border-border py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-foreground/5 text-foreground' : 'text-muted-foreground', 'block px-4 py-2 text-sm transition-colors')}
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={classNames(active ? 'bg-destructive/20 text-destructive' : 'text-destructive/80', 'block px-4 py-2 text-sm w-full text-left transition-colors')}
                            onClick={logout}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden bg-card/95 backdrop-blur-xl border-b border-border">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-primary/20 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                    'block rounded-md px-3 py-2 text-base font-medium transition-colors'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
