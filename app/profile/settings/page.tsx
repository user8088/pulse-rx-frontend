'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, Shield, Bell } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#374151] mb-1">Account Settings</h1>
        <p className="text-[#6B7280] text-sm">Update your personal information and preferences</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-50 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${
                    activeTab === tab.id 
                      ? 'bg-white text-[#01AC28] shadow-sm border border-gray-100' 
                      : 'text-[#6B7280] hover:text-[#374151]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 md:p-10">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all cursor-not-allowed opacity-70"
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Default Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="123 Health Ave, Wellness City"
                      className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 pl-12 pr-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button className="bg-[#01AC28] hover:bg-[#044644] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-100">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4 text-amber-700">
                <Shield className="w-6 h-6 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Password Security</p>
                  <p className="text-xs leading-relaxed opacity-80">Use at least 8 characters, with a mix of letters, numbers, and symbols for a strong password.</p>
                </div>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-[#EFEFEF] border-none rounded-xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-[#01AC28] transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button className="bg-[#374151] hover:bg-[#111827] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                {[
                  { title: 'Order Updates', desc: 'Receive emails about your order status and delivery.' },
                  { title: 'Prescription Reminders', desc: 'Get notified when it is time to refill your prescriptions.' },
                  { title: 'Offers & Rewards', desc: 'Special discounts and loyalty rewards sent to you.' },
                  { title: 'Health Tips', desc: 'Occasional wellness advice from our pharmacists.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                    <div className="space-y-1">
                      <p className="font-bold text-[#374151] text-sm">{item.title}</p>
                      <p className="text-xs text-[#6B7280]">{item.desc}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-[#01AC28]">
                      <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
