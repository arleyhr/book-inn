'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from '../common/avatar';
import { useAuthModalStore } from '../../store/auth-modal';
import { useAuthStore } from '../../store/auth';
import { useThemeStore } from '../../store/theme';
import { useEffect, useState } from 'react';

export function Header() {
  const { openModal } = useAuthModalStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  const isAgent = user?.role === 'agent';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed w-full top-0 left-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
      <div className="mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Bookinn Logo"
              width={100}
              height={26}
              className="object-contain hover:scale-105 transition-transform dark:brightness-0 dark:invert"
              priority
              style={{ width: 'auto', height: 26 }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hotels" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Hotels</Link>
            {isAuthenticated && (
              <>
                <Link href="/manage-reservations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">My Reservations</Link>
                {isAgent && (
                  <Link
                    href="/manage-hotels"
                    className="text-sm bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Manage Hotels
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {theme === 'dark' ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  )}
                </svg>
              )}
            </button>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="group relative">
                  <button className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user.firstName} {user.lastName}
                    </span>
                    <Avatar alt={`${user.firstName} ${user.lastName}`} size={32} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1">
                      {isAgent && (<Link href="/manage-reservations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">Manage Reservations</Link>)}
                      <Link href="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">Messages</Link>
                      {isAgent && (
                        <Link
                          href="/manage-hotels"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 dark:text-blue-400 dark:hover:bg-gray-800"
                        >
                          Manage Hotels
                        </Link>
                      )}
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">Profile</Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-800"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openModal('register')}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Create account
                </button>
                <button
                  onClick={() => openModal('login')}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm px-5 py-2 rounded-full"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
