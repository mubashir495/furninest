"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, X, User, Sun, Moon, ChevronDown, Palette } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; 
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeMode } from '@/Type/theme';
import { MonitorCog } from 'lucide-react';
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((state) => state.cart?.totalItems ?? 0);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { isAuthenticated } = useAuth();

  const { mode, setMode, customTheme, setCustomTheme, isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  
  const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
    { label: 'Light', value: 'light', icon: <Sun size={16} /> },
    { label: 'Dark', value: 'dark', icon: <Moon size={16} /> },
    { label: 'System', value: 'system', icon: <MonitorCog size={16} /> },
    { label: 'Custom', value: 'custom', icon: <Palette size={16} /> },
  ];

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl border ${
          isScrolled || isMobileMenuOpen || isSearchOpen
            ? 'glass dark:glass-dark border-white/20 shadow-lg'
            : 'glass dark:glass-dark border-transparent soft-shadow'
        }`}
      >
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              className="md:hidden p-2 -ml-2 text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="flex-shrink-0">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest uppercase text-primary">
                LUXE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => link.name === 'Shop' && setIsShopHovered(true)}
                  onMouseLeave={() => link.name === 'Shop' && setIsShopHovered(false)}
                >
                  <Link
                    href={link.href}
                    className="text-sm font-medium uppercase tracking-wider text-primary px-4 py-1.5 rounded-full hover:bg-muted transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                  {link.name === 'Shop' && isShopHovered && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                      <div className="glass dark:glass-dark card-shadow rounded-3xl p-4 grid grid-cols-2 gap-4 w-96">
                        {[
                          { name: 'Living Room', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80' },
                          { name: 'Bedroom', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&q=80' },
                          { name: 'Dining Room', img: 'https://images.unsplash.com/photo-154948834-c4bbc6c34a5cc?w=300&q=80' },
                          { name: 'Home Office', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300&q=80' },
                        ].map((cat) => (
                          <Link
                            key={cat.name}
                            href={`/shop?category=${cat.name.toLowerCase().replace(' ', '-')}`}
                            className="group/cat block relative aspect-square rounded-2xl overflow-hidden"
                          >
                            <img
                              src={cat.img}
                              alt={cat.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/cat:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="text-white font-serif font-medium">{cat.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4 text-primary">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Theme Switcher Dropdown - Desktop */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="p-2 hover:bg-muted rounded-full transition-colors flex items-center gap-1"
                >
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  <ChevronDown size={14} className="opacity-50" />
                </button>
                {isThemeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass dark:glass-dark rounded-2xl shadow-xl p-2 z-50 border border-white/10">
                    <div className="space-y-1">
                      {themeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setMode(opt.value);
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                            mode === opt.value
                              ? 'bg-accent/20 text-accent'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                          {mode === opt.value && (
                            <span className="ml-auto text-accent">✓</span>
                          )}
                        </button>
                      ))}
                      {mode === 'custom' && (
                        <div className="px-3 py-2 border-t border-white/10 mt-1">
                          <label className="text-xs text-muted-foreground block mb-1">
                            Primary Color
                          </label>
                          <input
                            type="color"
                            value={customTheme.primary}
                            onChange={(e) =>
                              setCustomTheme({ ...customTheme, primary: e.target.value })
                            }
                            className="w-full h-8 p-0 border-0 rounded cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={isAuthenticated ? '/account' : '/auth/login'}
                className="hidden md:block p-2 hover:bg-muted rounded-full transition-colors"
              >
                <User size={20} />
              </Link>
              <Link href="/wishlist" className="relative p-2 hover:bg-muted rounded-full transition-colors">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 overflow-hidden bg-background/50 rounded-b-2xl"
            >
              <div className="p-4">
                <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
                  <Input
                    type="search"
                    placeholder="Search for furniture..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/50 border-white/20 h-12 rounded-2xl pr-12"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-accent transition-colors"
                  >
                    <Search size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur pt-24 px-6 flex flex-col md:hidden"
          >
            <nav className="flex flex-col gap-6 text-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-serif text-primary hover:text-accent transition-colors text-2xl font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-border my-4" />

              {/* Mobile Theme Options */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Theme</p>
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMode(opt.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 text-xl font-medium transition-colors ${
                      mode === opt.value ? 'text-accent' : 'text-primary'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
                {mode === 'custom' && (
                  <div className="flex items-center gap-3 mt-2">
                    <Palette size={20} />
                    <input
                      type="color"
                      value={customTheme.primary}
                      onChange={(e) =>
                        setCustomTheme({ ...customTheme, primary: e.target.value })
                      }
                      className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">Custom Color</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-border my-4" />
              <Link
                href={isAuthenticated ? '/account' : '/auth/login'}
                className="font-serif text-primary hover:text-accent transition-colors flex items-center gap-3 text-2xl font-medium"
              >
                <User size={24} />
                {isAuthenticated ? 'My Account' : 'Sign In / Register'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

