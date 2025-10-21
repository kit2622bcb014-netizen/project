import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, PackageSearch } from 'lucide-react';
import { supabase, LostItem, FoundItem } from '../lib/supabase';
import { SearchBar } from '../components/SearchBar';
import { ItemCard } from '../components/ItemCard';
import { FormSelect } from '../components/FormInput';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'ID Cards', label: 'ID Cards' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Others', label: 'Others' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'lost', label: 'Lost Items' },
  { value: 'found', label: 'Found Items' },
];

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const [lostRes, foundRes] = await Promise.all([
        supabase.from('lost_items').select('*').order('created_at', { ascending: false }),
        supabase.from('found_items').select('*').order('created_at', { ascending: false }),
      ]);

      if (lostRes.data) setLostItems(lostRes.data);
      if (foundRes.data) setFoundItems(foundRes.data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = () => {
    let items: any[] = [];

    if (status === 'lost' || status === '') {
      items = [...items, ...lostItems.map(item => ({ ...item, type: 'lost' }))];
    }
    if (status === 'found' || status === '') {
      items = [...items, ...foundItems.map(item => ({ ...item, type: 'found' }))];
    }

    return items
      .filter(item => {
        const matchesQuery = searchQuery === '' ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = category === '' || item.category === category;
        const matchesLocation = location === '' ||
          item.location.toLowerCase().includes(location.toLowerCase());

        return matchesQuery && matchesCategory && matchesLocation;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const results = filteredItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Search Items
          </h1>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Filters
              </h3>

              <FormSelect
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
              />

              <FormSelect
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categories}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Filter by location"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategory('');
                  setStatus('');
                  setLocation('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Found {results.length} item{results.length !== 1 ? 's' : ''}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-md h-80 animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
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
                <p className="text-gray-600 dark:text-gray-400 text-lg">No items found for your search</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
