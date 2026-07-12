'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, apiPatch } from '@/lib/api';

interface PlatformSettings {
  defaultScoringModel: string;
  defaultPolicyVersion: string;
  notificationEmail: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<PlatformSettings>('/admin/settings').then(setSettings);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage('');
    const form = new FormData(e.currentTarget);
    const payload: PlatformSettings = {
      defaultScoringModel: form.get('defaultScoringModel') as string,
      defaultPolicyVersion: form.get('defaultPolicyVersion') as string,
      notificationEmail: form.get('notificationEmail') as string,
    };
    const result = await apiPatch<PlatformSettings>('/admin/settings', payload as unknown as Record<string, unknown>);
    if (result) {
      setSettings(result);
      setMessage('Settings saved.');
    } else {
      setMessage('Failed to save settings.');
    }
    setSaving(false);
  }

  if (!settings) return <div><h1>Platform Settings</h1><p>Loading...</p></div>;

  return (
    <div>
      <h1>Platform Settings</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Default Scoring Model Version
            <input name="defaultScoringModel" defaultValue={settings.defaultScoringModel} />
          </label>
        </div>
        <div>
          <label>
            Default Policy Version
            <input name="defaultPolicyVersion" defaultValue={settings.defaultPolicyVersion} />
          </label>
        </div>
        <div>
          <label>
            Notification Email
            <input name="notificationEmail" type="email" defaultValue={settings.notificationEmail} />
          </label>
        </div>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
