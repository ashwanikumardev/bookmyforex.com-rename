'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            BookMyForex
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/rates" className="text-gray-700 hover:text-primary-600 transition-colors">
              Live Rates
            </Link>
            <Link href="/buy-currency" className="text-gray-700 hover:text-primary-600 transition-colors">
              Buy Currency
            </Link>
            <Link href="/forex-card" className="text-gray-700 hover:text-primary-600 transition-colors">
              Forex Card
            </Link>
            <Link href="/send-money" className="text-gray-700 hover:text-primary-600 transition-colors">
              Send Money
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.firstName}
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/rates" className="text-gray-700 hover:text-primary-600 transition-colors">
                Live Rates
              </Link>
              <Link href="/buy-currency" className="text-gray-700 hover:text-primary-600 transition-colors">
                Buy Currency
              </Link>
              <Link href="/forex-card" className="text-gray-700 hover:text-primary-600 transition-colors">
                Forex Card
              </Link>
              <Link href="/send-money" className="text-gray-700 hover:text-primary-600 transition-colors">
                Send Money
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Dashboard
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-red-600 hover:text-red-700">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary inline-block text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
