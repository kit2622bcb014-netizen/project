import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Edit2, Trash2 } from 'lucide-react';
import { supabase, LostItem, FoundItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { ItemCard } from '../components/ItemCard';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  useEffect(() => {
    if (user) {
      loadUserItems();
    }
  }, [user]);

  const loadUserItems = async () => {
    if (!user) return;

    try {
      const [lostRes, foundRes] = await Promise.all([
        supabase
          .from('lost_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('found_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (lostRes.data) setLostItems(lostRes.data);
      if (foundRes.data) setFoundItems(foundRes.data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile(editData);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Profile updated successfully!', 'success');
      setEditModalOpen(false);
    }
  };

  const handleDeleteItem = async (type: 'lost' | 'found', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const table = type === 'lost' ? 'lost_items' : 'found_items';
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) throw error;

      if (type === 'lost') {
        setLostItems(lostItems.filter(item => item.id !== id));
      } else {
        setFoundItems(foundItems.filter(item => item.id !== id));
      }

      showToast('Item deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete item', 'error');
    }
  };

  const currentItems = activeTab === 'lost' ? lostItems : foundItems;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.full_name || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-gray-600 dark:text-gray-400">{profile.phone}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('lost')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'lost'
                    ? 'bg-red-50 text-red-600 border-b-2 border-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                My Lost Items ({lostItems.length})
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'found'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                My Found Items ({foundItems.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-80 animate-pulse"></div>
                ))}
              </div>
            ) : currentItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <ItemCard
                      item={item}
                      type={activeTab}
                      onClick={() => navigate(`/item/${activeTab}/${item.id}`)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(activeTab, item.id);
                      }}
                      className="absolute top-2 left-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 dark:text-gray-400">
                  No {activeTab} items reported yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <FormInput
            label="Full Name"
            value={editData.full_name}
            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
          />
          <FormInput
            label="Phone Number"
            value={editData.phone || ''}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
          />
          <button
            onClick={handleUpdateProfile}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
