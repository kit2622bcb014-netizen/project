import { useEffect, useState } from 'react';
import { Search, Upload, Bell, CheckCircle, Plus, PackageSearch } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, LostItem, FoundItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ItemCard } from '../components/ItemCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalReturned: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lostRes, foundRes] = await Promise.all([
        supabase
          .from('lost_items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('found_items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      if (lostRes.data) setLostItems(lostRes.data);
      if (foundRes.data) setFoundItems(foundRes.data);

      const [lostCount, foundCount] = await Promise.all([
        supabase.from('lost_items').select('*', { count: 'exact', head: true }),
        supabase.from('found_items').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalLost: lostCount.count || 0,
        totalFound: foundCount.count || 0,
        totalReturned: 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allItems = [
    ...lostItems.map(item => ({ ...item, type: 'lost' as const })),
    ...foundItems.map(item => ({ ...item, type: 'found' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <section className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Find What You Lost,<br />Return What You Found
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              A centralized campus platform to connect lost and found items instantly
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  to="/report-lost"
                  className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Report Lost Item
                </Link>
                <Link
                  to="/report-found"
                  className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5" />
                  Report Found Item
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalLost}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Lost Items</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalFound}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Found Items</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalReturned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful Returns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Items</h2>
          <Link
            to="/search"
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <PackageSearch className="w-4 h-4" />
            View All Items
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-md h-80 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : allItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allItems.map((item) => (
              <ItemCard
                key={`${item.type}-${item.id}`}
                item={item}
                type={item.type}
                onClick={() => navigate(`/item/${item.type}/${item.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <PackageSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No items reported yet</p>
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-gray-900 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Report a Lost Item
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Post details about your lost item with a photo and description
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Someone Finds It
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Community members report found items to the platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Get Connected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with finders through the platform to retrieve your item
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
