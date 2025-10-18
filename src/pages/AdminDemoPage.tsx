import { AdminPanel } from '@/components/AdminPanel';
import { ReportsWithAdmin } from '@/components/ReportsWithAdmin';
import { useAuth } from '@/hooks/useAuth';

const AdminDemoPage = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Demo</h1>
          <p className="text-muted-foreground">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of admin vs regular user features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminPanel />
        <ReportsWithAdmin />
      </div>

      {isAdmin && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🎉 Admin Features Unlocked!</h3>
          <p className="text-green-700">
            You now have administrator privileges and can access advanced features like CSV reports, 
            user management, and system settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDemoPage;