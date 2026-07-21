'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SettingsPage() {
  usePageTitle('Settings');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword, form.confirmPassword);
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">Settings</h1>
      <p className="text-muted-foreground mb-10">Manage your account security.</p>

      <div className="bg-card rounded-3xl soft-shadow p-8 max-w-xl">
        <h2 className="text-xl font-serif text-primary mb-6">Change Password</h2>

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 mb-6">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-primary mb-1.5 block">{field.label}</label>
              <input
                type="password"
                required
                minLength={8}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
