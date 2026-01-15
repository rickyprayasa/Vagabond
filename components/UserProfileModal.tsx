import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoCard } from './ui/NeoCard';
import { NeoButton } from './ui/NeoButton';
import { User, Itinerary } from '../types';
import { supabase } from '../utils/supabaseClient';
import { X, User as UserIcon, Coins, Map, Trash2, Calendar, Wallet, LogOut, Settings, CreditCard, ChevronRight, Timer, ArrowUpRight } from 'lucide-react';
import { Database } from '../supabase-types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  userId: string;
  onLogout: () => void;
  onOpenPricing: () => void;
  onLoadTrip: (trip: Itinerary) => void;
  language: 'en' | 'id';
  t: any;
}

type DatabaseItinerary = Database['public']['Tables']['itineraries']['Row'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userId,
  onLogout,
  onOpenPricing,
  onLoadTrip,
  language,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [savedTrips, setSavedTrips] = useState<DatabaseItinerary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTrips = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadTrips();
    }
  }, [isOpen, userId]);

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm(language === 'id' ? 'Hapus rencana ini?' : 'Delete this itinerary?')) {
      try {
        const { error } = await supabase
          .from('itineraries')
          .delete()
          .eq('id', tripId);

        if (error) throw error;

        setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert(language === 'id' ? 'Gagal menghapus rencana' : 'Failed to delete itinerary');
      }
    }
  };

  const totalDays = savedTrips.reduce((acc, trip) => acc + (trip.total_days || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-4xl h-[85vh] flex flex-col"
      >
        <NeoCard className="p-0 h-full flex flex-col overflow-hidden bg-travel-paper shadow-neo-lg" noShadow>
          <div className="bg-neo-black text-white p-6 border-b-2 border-neo-black flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-travel-orange border-2 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_#ffffff]">
                <UserIcon className="w-6 h-6 text-neo-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{user.name}</h2>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span>{user.email}</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
                  <span className="text-travel-lime uppercase">Pro Member</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 border-white hover:bg-white hover:text-neo-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            <div className="w-full md:w-64 bg-white border-b-2 md:border-b-0 md:border-r-2 border-neo-black p-4 flex flex-col gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all ${activeTab === 'overview' ? 'bg-travel-yellow border-neo-black shadow-neo-sm' : 'bg-transparent border-transparent hover:bg-zinc-100 text-zinc-500'}`}
              >
                <CreditCard className="w-4 h-4" /> {t.profile.tab_overview}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all ${activeTab === 'history' ? 'bg-travel-teal border-neo-black shadow-neo-sm' : 'bg-transparent border-transparent hover:bg-zinc-100 text-zinc-500'}`}
              >
                <Map className="w-4 h-4" /> {t.profile.tab_history}
              </button>

              <div className="mt-auto border-t-2 border-dashed border-zinc-200 pt-4">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-500 transition-all"
                >
                  <LogOut className="w-4 h-4" /> {t.auth.logout}
                </button>
              </div>
            </div>

            <div className="flex-grow p-6 md:p-8 overflow-y-auto bg-zinc-50/50">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-neo-black text-white p-6 border-2 border-neo-black shadow-neo flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                    <div>
                      <h3 className="font-mono text-sm text-zinc-400 font-bold uppercase mb-1">{t.credits.balance}</h3>
                      <div className="text-6xl font-black text-travel-yellow flex items-baseline gap-2">
                        {user.credits} <span className="text-xl text-zinc-500">CR</span>
                      </div>
                    </div>
                    <NeoButton onClick={onOpenPricing} variant="accent" className="z-10">
                      <Coins className="w-4 h-4" /> {t.credits.buy}
                    </NeoButton>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-neo-black p-4 shadow-sm">
                      <div className="text-zinc-400 mb-2"><Map className="w-5 h-5" /></div>
                      <div className="text-2xl font-black">{savedTrips.length}</div>
                      <div className="text-xs font-bold uppercase text-zinc-500">{t.profile.saved_trips}</div>
                    </div>
                    <div className="bg-white border-2 border-neo-black p-4 shadow-sm">
                      <div className="text-zinc-400 mb-2"><Timer className="w-5 h-5" /></div>
                      <div className="text-2xl font-black">{totalDays}</div>
                      <div className="text-xs font-bold uppercase text-zinc-500">{t.profile.total_days}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex justify-between items-end border-b-2 border-neo-black pb-2 mb-4">
                    <h3 className="text-2xl font-black uppercase">{t.profile.saved_trips}</h3>
                    <span className="font-mono text-xs font-bold bg-zinc-200 px-2 py-1">{savedTrips.length} Total</span>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="font-mono font-bold uppercase">Loading...</p>
                    </div>
                  ) : savedTrips.length === 0 ? (
                    <div className="text-center py-12 opacity-50 flex flex-col items-center">
                      <Map className="w-12 h-12 mb-2 text-zinc-400" />
                      <p className="font-mono font-bold uppercase">{t.profile.no_trips}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {savedTrips.map((trip) => {
                        const itineraryData = trip.itinerary_data as any;
                        const estimatedCost = trip.estimated_cost as any;

                        return (
                          <div key={trip.id} className="bg-white border-2 border-neo-black p-4 hover:shadow-neo transition-all group relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex gap-2 mb-1">
                                  <span className="bg-travel-yellow text-neo-black text-[10px] font-bold uppercase px-1.5 py-0.5 border border-neo-black">
                                    {trip.total_days} Days
                                  </span>
                                  <span className="bg-travel-teal text-white text-[10px] font-bold uppercase px-1.5 py-0.5 border border-neo-black">
                                    {trip.budget_level}
                                  </span>
                                </div>
                                <h4 className="text-xl font-black uppercase leading-tight mb-1">{trip.destination}</h4>
                                <p className="text-xs font-mono text-zinc-500 truncate max-w-[200px] md:max-w-xs">{trip.title}</p>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                 <button
                                  onClick={() => handleDeleteTrip(trip.id)}
                                  className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                  title="Delete Plan"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t-2 border-dashed border-zinc-200 flex justify-between items-center">
                               <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                                  <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> {estimatedCost?.total || 'N/A'}</span>
                               </div>

                               <button
                                  onClick={() => {
                                    const itinerary: Itinerary = {
                                      title: trip.title,
                                      destination: trip.destination,
                                      totalDays: trip.total_days,
                                      budgetLevel: trip.budget_level,
                                      summary: trip.summary || '',
                                      weatherForecast: trip.weather_forecast || '',
                                      playlistVibe: trip.playlist_vibe || '',
                                      days: itineraryData?.days || [],
                                      estimatedCost: estimatedCost || { total: '0', accommodation: '0', food: '0', activities: '0', transport: '0', flights: '0', explanation: '' },
                                      packingList: trip.packing_list as any || [],
                                      localPhrases: trip.local_phrases as any || [],
                                      travelAdvisories: trip.travel_advisories as any || [],
                                      originalPrefs: undefined,
                                    };
                                    onLoadTrip(itinerary);
                                  }}
                                  className="flex items-center gap-1 bg-neo-black text-white px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-travel-orange hover:text-neo-black transition-colors shadow-sm"
                               >
                                  Open Plan <ArrowUpRight className="w-3 h-3" />
                               </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

            </div>
          </div>
        </NeoCard>
      </motion.div>
    </div>
  );
};
