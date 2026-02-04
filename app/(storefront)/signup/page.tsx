'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (register) {
        await register(formData);
      }
      router.push('/profile');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj.response?.data?.message || errorObj.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navbar />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
        <div className="hidden lg:flex lg:w-1/2 bg-[#044644] relative overflow-hidden items-center justify-center p-12 order-2">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5C9D40] via-[#044644] to-[#044644] opacity-90" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#01AC28]/20 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-lg text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Join the Pulse RX <br />Community.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Get access to exclusive health benefits, track your prescriptions, and manage your family&apos;s wellness all in one place.
            </p>
            
            <div className="space-y-4">
              {[
                "Priority Prescription Handling",
                "Exclusive Monthly Health Offers",
                "Personalized Health Reminders",
                "Dedicated Pharmacist Support"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#01AC28] flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-gray-50/50 order-1">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#01AC28] transition-colors uppercase tracking-widest mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-[#374151] mb-2">Create Account</h1>
              <p className="text-[#6B7280]">Join us for a better healthcare experience</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#374151] uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#374151] uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all shadow-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#374151] uppercase tracking-widest ml-1">Phone</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all shadow-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#374151] uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-12 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#374151] uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 px-1 pt-2">
                <input type="checkbox" required id="terms" className="mt-1 rounded border-gray-300 text-[#01AC28] focus:ring-[#01AC28]" />
                <label htmlFor="terms" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                  I agree to the <Link href="/terms" className="text-[#01AC28]">Terms of Service</Link> and <Link href="/privacy" className="text-[#01AC28]">Privacy Policy</Link>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#01AC28] hover:bg-[#044644] text-white py-4 rounded-xl font-bold text-xs tracking-[0.2em] transition-all uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-[#6B7280]">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-[#01AC28] hover:text-[#044644] transition-colors underline underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
