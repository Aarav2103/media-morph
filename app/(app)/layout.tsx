"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon,
  ChevronDownIcon,
} from "lucide-react";

const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
];

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogoClick = () => router.push("/");
  const handleSignOut = async () => await signOut();

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-gray-950 text-white">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="sidebar-drawer" className="drawer-overlay" />
        <aside className="w-64 bg-gray-950 border-r border-gray-800 h-full flex flex-col shadow-xl">
          <div className="flex items-center justify-center py-6 border-b border-gray-800">
            <ImageIcon className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>
          <ul className="menu p-4 w-full text-sm space-y-1 text-white">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {user && (
            <div className="p-4 mt-auto">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <LogOutIcon className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Main Content */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-40 w-full bg-gray-950 border-b border-gray-800 shadow-md">
          <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <label
                  htmlFor="sidebar-drawer"
                  className="btn btn-square btn-ghost drawer-button"
                >
                  <MenuIcon className="text-white" />
                </label>
              </div>
              <Link href="/" onClick={handleLogoClick}>
                <span className="text-2xl font-bold tracking-tight text-white hover:text-indigo-400 transition">
                  Media Morph
                </span>
              </Link>
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-800 transition"
                >
                  <img
                    src={user.imageUrl}
                    alt="user avatar"
                    className="w-8 h-8 rounded-full border border-indigo-500"
                  />
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                    <div className="px-4 py-3 text-sm text-gray-300">
                      {user.username || user.emailAddresses[0].emailAddress}
                    </div>
                    <hr className="border-gray-700" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
