"use client";

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  views: number;
  created_at: string;
  user_id: number;
  images: string[];
  distance?: number;
}

interface AdCardProps {
  ad: Ad;
  userLocation: { latitude: number; longitude: number } | null;
  onAdClick: (ad: Ad) => void;
}

export default function AdCard({ ad, userLocation, onAdClick }: AdCardProps) {
  const formatPrice = (price: number) => {
    if (!price) return 'توافقی';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'امروز';
    if (diffDays === 2) return 'دیروز';
    if (diffDays <= 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <div
      onClick={() => onAdClick(ad)}
      className="bg-white dark:bg-slate-900 rounded-2xl hover:shadow-lg transition-all duration-200 overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group"
    >
      <div className="flex gap-4 p-4">
        {/* Content - Right Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {ad.title}
            </h3>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ml-2 ${
              ad.status === 'active' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {ad.status === 'active' ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {ad.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(ad.price)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {ad.condition}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{ad.views}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{ad.address}</span>
            </div>
            
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(ad.created_at)}
            </span>
          </div>
          
          {ad.distance && (
            <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{ad.distance.toFixed(1)} کیلومتر</span>
            </div>
          )}
        </div>
        
        {/* Image - Left Side */}
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}