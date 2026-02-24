import type { FC } from 'react';
import { User, Bell, Lock, Palette, Globe } from 'lucide-react';

const Settings: FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="space-y-1">
          {[
            { icon: User, label: 'Profile' },
            { icon: Bell, label: 'Notifications' },
            { icon: Lock, label: 'Security' },
            { icon: Palette, label: 'Appearance' },
            { icon: Globe, label: 'Workspace' },
          ].map((item, i) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                i === 0 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="md:col-span-3 space-y-8">
          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Public Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold">
                  OZ
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Change avatar</button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Omar Zh"
                    className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="omar@example.com"
                    className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
