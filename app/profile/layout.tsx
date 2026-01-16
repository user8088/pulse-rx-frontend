'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  ShoppingBag, 
  Tag, 
  Settings, 
  LogOut, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { 
      label: 'Overview', 
      href: '/profile', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Order History', 
      href: '/profile/orders', 
      icon: ShoppingBag 
    },
    { 
      label: 'My Offers', 
      href: '/profile/offers', 
      icon: Tag 
    },
    { 
      label: 'Settings', 
      href: '/profile/settings', 
      icon: Settings 
    },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50/50">
        <Header />
        <Navbar />

        <div className="container mx-auto px-4 md:px-6 lg:px-12 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-[100px]">
                {/* User Info Header */}
                <div className="p-6 md:p-8 bg-[#044644] text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 text-2xl font-black">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-lg truncate">{user?.name}</h2>
                      <p className="text-xs text-white/60 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#01AC28]" />
                      <span className="text-xs font-bold uppercase tracking-wider">Active Customer</span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                              isActive 
                                ? 'bg-[#01AC28]/10 text-[#01AC28]' 
                                : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#374151]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${isActive ? 'text-[#01AC28]' : 'text-gray-400 group-hover:text-[#374151]'}`} />
                              <span className="text-sm font-bold tracking-tight">{item.label}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <section className="flex-1 min-w-0">
              {children}
            </section>
          </div>
        </div>

        <Footer />
      </main>
    </ProtectedRoute>
  );
}
