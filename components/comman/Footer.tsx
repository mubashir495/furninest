"use client";

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Sun, Moon, MonitorCog, Palette } from 'lucide-react';
import { BsInstagram, BsTwitter } from 'react-icons/bs';
import { FaFacebook } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { ThemeMode } from '@/Type/theme';

export function Footer() {
  const { mode, setMode, customTheme, setCustomTheme, isDark } = useTheme();

  const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
    { label: 'Light', value: 'light', icon: <Sun size={16} /> },
    { label: 'Dark', value: 'dark', icon: <Moon size={16} /> },
    { label: 'System', value: 'system', icon: <MonitorCog size={16} /> },
    { label: 'Custom', value: 'custom', icon: <Palette size={16} /> },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 pt-16 pb-8 mt-auto rounded-t-3xl border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8 bg-gray-100 dark:bg-gray-800/50 rounded-3xl p-8 lg:p-12 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="text-center lg:text-left max-w-lg">
            <h3 className="font-serif text-3xl font-bold tracking-widest uppercase mb-4 text-primary">Luxe</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Curated luxury furniture for the design-conscious home. Heirloom-quality pieces crafted to last a lifetime.
            </p>
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
            <form className="flex gap-2 w-full sm:w-96" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-foreground rounded-2xl placeholder:text-muted-foreground h-12"
                required
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 px-6 font-medium"
              >
                Subscribe
              </Button>
            </form>
            {/* Theme Switcher (mini) */}
            <div className="flex items-center gap-2 bg-background/50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`p-2 rounded-full transition-all ${
                    mode === opt.value
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-muted-foreground'
                  }`}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              ))}
              {mode === 'custom' && (
                <div className="relative">
                  <input
                    type="color"
                    value={customTheme.primary}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, primary: e.target.value })
                    }
                    className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
                    title="Custom Color"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h4 className="font-serif text-xl mb-6 text-primary font-medium">About Luxe</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Craftsmanship</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Sustainability</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-primary font-medium">Shop</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Living Room</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Bedroom</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Dining</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-primary font-medium">Customer Service</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Delivery & Returns</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-primary font-medium">Contact</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>124 King's Road, Chelsea<br />London, SW3 4TR</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+44 (0) 20 7123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>contact@luxe-furniture.co.uk</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-8">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><BsInstagram size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><FaFacebook size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><BsTwitter size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Luxe Furniture Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>American Express</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}