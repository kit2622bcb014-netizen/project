import { Calendar, MapPin, Tag } from 'lucide-react';
import { LostItem, FoundItem } from '../lib/supabase';

type ItemCardProps = {
  item: LostItem | FoundItem;
  type: 'lost' | 'found';
  onClick: () => void;
};

export function ItemCard({ item, type, onClick }: ItemCardProps) {
  const isLost = type === 'lost';
  const date = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;
  const statusColor = isLost ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  const statusText = isLost ? 'Lost' : 'Found';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Tag className="w-4 h-4" />
          <span className="font-medium">{item.category}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        </div>

        <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}
