import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Tag, Mail, Phone } from 'lucide-react';
import { supabase, LostItem, FoundItem } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ItemDetails() {
  const { type, id } = useParams<{ type: 'lost' | 'found'; id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LostItem | FoundItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type && id) {
      loadItem();
    }
  }, [type, id]);

  const loadItem = async () => {
    try {
      const table = type === 'lost' ? 'lost_items' : 'found_items';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Item not found
          </h1>
          <Link to="/search" className="text-blue-600 hover:text-blue-700">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const isLost = type === 'lost';
  const date = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;
  const dateLabel = isLost ? 'Lost Date' : 'Found Date';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative h-96 lg:h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag className="w-24 h-24 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  isLost ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isLost ? 'Lost' : 'Found'}
                </span>
              </div>
            </div>

            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {item.title}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Tag className="w-5 h-5" />
                  <span className="font-medium">{item.category}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {dateLabel}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Location
                    </div>
                    <div className="text-gray-900 dark:text-white">{item.location}</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Description
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  {item.contact_info.includes('@') ? (
                    <>
                      <Mail className="w-5 h-5" />
                      <a
                        href={`mailto:${item.contact_info}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {item.contact_info}
                      </a>
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      <a
                        href={`tel:${item.contact_info}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {item.contact_info}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <a
                  href={`mailto:${item.contact_info}?subject=${encodeURIComponent(`Regarding ${isLost ? 'Lost' : 'Found'} Item: ${item.title}`)}`}
                  className="w-full inline-block text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  Contact Owner
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
