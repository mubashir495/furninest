'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ProfilePage() {
  usePageTitle('Profile');
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">Profile</h1>
      <p className="text-muted-foreground mb-10">Your personal account details.</p>

      <div className="bg-card rounded-3xl soft-shadow p-8 max-w-xl space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
          <p className="text-lg text-primary mt-1">{user?.fullName}</p>
        </div>
        <div className="h-px bg-border" />
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
          <p className="text-lg text-primary mt-1">{user?.email}</p>
          {user?.isEmailVerified === false && (
            <p className="text-xs text-amber-600 mt-1">Not verified yet</p>
          )}
        </div>
        <div className="h-px bg-border" />
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Type</label>
          <p className="text-lg text-primary mt-1 capitalize">{user?.role?.toLowerCase()}</p>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Need to update your name or email? Contact support — or manage your password from{' '}
          <a href="/account/settings" className="text-accent hover:underline">
            Settings
          </a>
          .
        </p>
      </div>
    </div>
  );
}
