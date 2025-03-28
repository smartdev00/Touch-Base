import GoogleSheetsSetup from '@/components/GoogleSheetsSetup';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Export Settings</h2>
          <GoogleSheetsSetup />
        </section>
        
        {/* Add other settings sections here */}
      </div>
    </div>
  );
} 