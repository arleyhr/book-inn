import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from '../common/avatar';

export interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
  isAgent?: boolean;
}

export function Header({ isAuthenticated, userName, onLogout, isAgent }: HeaderProps) {
  return (
    <header className="fixed w-full top-0 left-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Bookinn Logo"
              width={100}
              height={26}
              className="object-contain hover:scale-105 transition-transform"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Find Places</Link>
            {isAuthenticated && (
              <>
                <Link href="/my-trips" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">My Trips</Link>
                <Link href="/messages" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Messages</Link>
                {isAgent && (
                  <Link
                    href="/manage-hotels"
                    className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Manage Hotels
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="group relative">
                  <button className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-600">{userName}</span>
                    <Avatar alt={userName || 'User'} size={32} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                      {isAgent && (
                        <Link
                          href="/manage-hotels"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                        >
                          Manage Hotels
                        </Link>
                      )}
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/sign-up" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Create account</Link>
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm px-5 py-2 rounded-full">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
