import React, { useState, useEffect, useRef } from 'react';
import { NeoButton } from './ui/NeoButton';
import { NeoCard } from './ui/NeoCard';
import { generateItinerary, generateActivitySuggestions, generatePackingSuggestions, generatePlaceSuggestions, SuggestedActivity, SuggestedPackingItem } from '../services/geminiService';
import { Itinerary, TravelPreferences, Activity, DayPlan, User } from '../types';
import { MapPin, Calendar, Wallet, Loader2, Share2, Save, Plane, Dices, Music, Luggage, MessageSquare, Bed, Utensils, Ticket, Car, ThumbsUp, ThumbsDown, PieChart, FileDown, GripVertical, Clock, Trash2, ArrowRightLeft, Pencil, X, Plus, Smile, AlignLeft, Map, Grip, Users, Bus, Check, CloudSun, Coins, Settings, Fuel, AlertTriangle, Sparkles, Disc, Cloud, FolderPlus, Navigation, ChevronDown, RefreshCw, ArrowRight, Search, Sun, Moon, Sunrise, Sunset, Star, Globe, Flag, Compass } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { translations, Language } from '../utils/translations';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ItineraryGeneratorProps {
  language: Language;
  user: User;
  onDeductCredits: (amount: number) => boolean;
  onRequireLogin: () => void;
  onRequireCredits: () => void;
  loadedItinerary?: Itinerary | null;
}

// --- CONSTANTS FOR UI HELPERS ---
const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute} ${ampm}`;
});

const COMMON_EMOJIS = ["✈️", "🏨", "🍽️", "📸", "🏛️", "🏞️", "🛍️", "🚌", "🚕", "🚶", "🎫", "🎨", "🍷", "☕", "🏖️", "🏔️", "🎡", "🏰", "🚢", "🎒"];

const TOP_DESTINATIONS_LOCAL = [
  { name: "Bali, Indonesia", icon: "🏝️" },
  { name: "Yogyakarta", icon: "🏯" },
  { name: "Labuan Bajo", icon: "🐉" },
  { name: "Bandung", icon: "🍓" },
  { name: "Bromo, Malang", icon: "🌋" },
  { name: "Lombok", icon: "🏄‍♂️" },
  { name: "Raja Ampat", icon: "🤿" },
  { name: "Danau Toba", icon: "🌊" }
];

const TOP_DESTINATIONS_INTL = [
  { name: "Tokyo, Japan", icon: "🗼" },
  { name: "Seoul, Korea", icon: "🇰🇷" },
  { name: "Singapore", icon: "🦁" },
  { name: "Bangkok, Thailand", icon: "🐘" },
  { name: "Paris, France", icon: "🥐" },
  { name: "London, UK", icon: "💂" },
  { name: "Istanbul, Turkey", icon: "🕌" },
  { name: "New York, USA", icon: "🗽" }
];

// Helper to extract numeric value from cost string for visualization
const parseCostToNumber = (val: string) => {
    if (!val) return 0;
    if (val.includes('-')) {
        const parts = val.split('-');
        const nums = parts.map(p => parseInt(p.replace(/[^0-9]/g, '')) || 0);
        return nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
    }
    return parseInt(val.replace(/[^0-9]/g, '')) || 0;
};

// Helper for Rupiah Input
const formatRupiah = (value: string) => {
  const numberString = value.replace(/[^,\d]/g, '').toString();
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
  return rupiah ? 'Rp ' + rupiah : '';
};

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Time Categorization Helper
const getTimeCategory = (time: string) => {
    if (!time) return 'Morning';
    const [t, period] = time.split(' ');
    let [h] = t.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    if (h >= 5 && h < 12) return 'Morning';
    if (h >= 12 && h < 17) return 'Afternoon';
    if (h >= 17 && h < 21) return 'Evening';
    return 'Night';
};

// --- Activity Edit Controls Component ---
const ActivityEditControls = ({ 
    dayIndex, 
    actId, 
    currentDay, 
    days, 
    onMove, 
    onDelete 
}: {
    dayIndex: number,
    actId: string,
    currentDay: number,
    days: DayPlan[],
    onMove: (currentDayIndex: number, actId: string, targetDayNumber: number) => void,
    onDelete: (dayIndex: number, actId: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute top-0 right-0 p-1 flex gap-1 z-20" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-1 border border-neo-black transition-colors shadow-sm flex items-center justify-center ${isOpen ? 'bg-travel-yellow text-neo-black' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}
                    title="Move to another day"
                >
                    <ArrowRightLeft className="w-3 h-3" />
                </button>
                
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[19]" onClick={() => setIsOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border-2 border-neo-black shadow-neo-sm z-[20] flex flex-col">
                            <div className="bg-neo-black text-white text-[9px] font-bold uppercase px-2 py-1">Move to Day</div>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar p-1 grid grid-cols-3 gap-1">
                                {days.map((d) => (
                                    <button
                                        key={d.id}
                                        disabled={d.day === currentDay}
                                        onClick={() => {
                                            onMove(dayIndex, actId, d.day);
                                            setIsOpen(false);
                                        }}
                                        className={`text-xs font-mono font-bold py-1.5 px-1 text-center border transition-all ${
                                            d.day === currentDay 
                                            ? 'opacity-20 bg-zinc-100 border-zinc-200 cursor-not-allowed' 
                                            : 'bg-zinc-50 border-zinc-200 hover:border-neo-black hover:bg-travel-yellow text-neo-black'
                                        }`}
                                    >
                                        {d.day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <button 
                onClick={() => onDelete(dayIndex, actId)}
                className="p-1 bg-white border border-neo-black hover:bg-red-500 hover:text-white transition-colors shadow-sm text-zinc-600"
                title="Delete"
            >
                <Trash2 className="w-3 h-3" />
            </button>
            <div className="p-1 bg-white border border-neo-black text-zinc-400 cursor-grab active:cursor-grabbing shadow-sm">
                <GripVertical className="w-3 h-3" />
            </div>
        </div>
    );
};


// --- Sortable Day Component ---
interface SortableDayProps {
  day: DayPlan;
  dayIndex: number;
  isEditMode: boolean;
  itinerary: Itinerary;
  handleReorderActivities: (dayIndex: number, newOrder: Activity[]) => void;
  handleUpdateActivity: (dayIndex: number, actId: string, field: keyof Activity, value: string) => void;
  handleDeleteActivity: (dayIndex: number, actId: string) => void;
  handleUpdateDayTheme: (dayIndex: number, newTheme: string) => void; 
  handleMoveDay: (currentDayIndex: number, actId: string, targetDayNumber: number) => void;
  openAddModal: (dayIndex: number) => void;
  onEditTime: (dayIndex: number, actId: string) => void;
  getMapUrl: (location: string, destination: string) => string;
  t: any;
}

const SortableDay: React.FC<SortableDayProps> = ({ 
  day, 
  dayIndex, 
  isEditMode, 
  itinerary, 
  handleReorderActivities, 
  handleUpdateActivity, 
  handleDeleteActivity, 
  handleUpdateDayTheme, 
  handleMoveDay, 
  openAddModal,
  onEditTime, 
  getMapUrl,
  t 
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={day}
      id={day.id}
      dragListener={false}
      dragControls={dragControls}
      className="mb-8 relative"
      whileDrag={{ 
        scale: 1.02, 
        zIndex: 50,
        boxShadow: "8px 8px 0px 0px rgba(29,29,29,0.2)" 
      }}
      transition={{ duration: 0.2 }}
    >
        {/* Day Container as a distinct NeoCard - Compact Style */}
        <NeoCard className={`p-0 bg-travel-paper overflow-hidden ${isEditMode ? 'border-dashed border-zinc-400' : ''}`} noShadow>
            
            {/* Day Header - Denser */}
            <div className="bg-neo-black text-white px-4 py-3 flex items-center justify-between border-b-2 border-neo-black relative overflow-hidden group/header">
                <div className="flex items-center gap-3 z-10 w-full">
                    <motion.div 
                        key={day.day} // Animate when number changes
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-10 h-10 bg-travel-yellow text-neo-black border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transform -rotate-2 shrink-0"
                    >
                        <span className="font-mono font-black text-lg">{day.day}</span>
                    </motion.div>
                    <div className="flex-grow min-w-0 pr-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-0.5">{t.day_label} {day.day}</span>
                            {isEditMode ? (
                                <input 
                                    type="text" 
                                    value={day.theme}
                                    onChange={(e) => handleUpdateDayTheme(dayIndex, e.target.value)}
                                    className="font-black uppercase text-lg leading-tight w-full bg-zinc-800/50 border-b-2 border-dashed border-zinc-500 focus:border-travel-yellow focus:bg-neo-black focus:outline-none text-white px-1 py-0.5"
                                    placeholder="ENTER DAY THEME"
                                />
                            ) : (
                                <h3 className="font-black uppercase text-lg leading-none tracking-tight truncate">{day.theme}</h3>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Drag Handle for Day */}
                {isEditMode && (
                  <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    className="cursor-grab active:cursor-grabbing p-1.5 bg-travel-lime text-neo-black border-2 border-white hover:scale-105 transition-transform z-20 shadow-sm shrink-0"
                  >
                    <Grip className="w-4 h-4" />
                  </div>
                )}
                
                {/* Background Pattern for Header */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
            </div>

            {/* Activities Container */}
            <div className="p-3 bg-zinc-50/50">
                <Reorder.Group 
                  axis="y" 
                  values={day.activities} 
                  onReorder={(newOrder) => handleReorderActivities(dayIndex, newOrder)}
                  className="space-y-3"
                >
                    <AnimatePresence initial={false}>
                    {day.activities.map((act) => (
                      <Reorder.Item 
                        key={act.id} 
                        value={act}
                        dragListener={isEditMode}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      >
                        <NeoCard 
                          className={`flex flex-col md:flex-row bg-white relative group overflow-visible ${isEditMode ? 'cursor-move border-dashed' : ''}`}
                          hoverEffect={!isEditMode}
                          noShadow={isEditMode}
                        >
                           {/* Edit Tools Overlay */}
                           {isEditMode && (
                            <ActivityEditControls 
                                dayIndex={dayIndex}
                                actId={act.id}
                                currentDay={day.day}
                                days={itinerary.days}
                                onMove={handleMoveDay}
                                onDelete={handleDeleteActivity}
                            />
                           )}

                           {/* Activity Content - Compact */}
                           <div className="flex flex-col md:flex-row gap-3 md:items-start w-full p-3">
                              {/* Time Column */}
                              <div className="shrink-0 md:w-24 pt-0.5">
                                 {isEditMode ? (
                                    <button 
                                      onClick={() => onEditTime(dayIndex, act.id)}
                                      className="flex items-center gap-1 group/time cursor-pointer hover:bg-travel-yellow px-1 -ml-1 rounded-sm transition-colors w-full border-b border-neo-black pb-1"
                                    >
                                        <Clock className="w-3 h-3 text-travel-teal group-hover/time:text-neo-black" />
                                        <span className="font-mono text-xs font-bold truncate">{act.time}</span>
                                        <Pencil className="w-2 h-2 opacity-0 group-hover/time:opacity-100 ml-auto" />
                                    </button>
                                 ) : (
                                    <div className="font-mono text-[10px] font-bold bg-zinc-100 px-2 py-1 border border-neo-black inline-flex items-center gap-1.5 rounded-sm shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                                      <Clock className="w-3 h-3 text-zinc-500" />
                                      {act.time}
                                    </div>
                                 )}
                              </div>
                              
                              {/* Main Content Column */}
                              <div className="flex-grow min-w-0">
                                  <div className="flex justify-between items-start mb-1 pr-6">
                                    {isEditMode ? (
                                        <input 
                                            type="text" 
                                            value={act.activity}
                                            onChange={(e) => handleUpdateActivity(dayIndex, act.id, 'activity', e.target.value)}
                                            className="font-bold text-base leading-tight w-full border-b border-neo-black focus:outline-none bg-transparent mr-2"
                                        />
                                    ) : (
                                        <h4 className="font-bold text-base leading-tight flex items-center gap-2">
                                            {act.activity}
                                        </h4>
                                    )}
                                    <span className="text-xl leading-none filter drop-shadow-sm">{act.emoji}</span>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                     <span className="font-mono text-[9px] uppercase tracking-wide bg-travel-teal/20 text-teal-900 px-1.5 py-0.5 border border-neo-black flex items-center gap-1 font-bold">
                                         <Wallet className="w-2.5 h-2.5" /> {act.cost}
                                     </span>
                                     <a 
                                        href={getMapUrl(act.location, itinerary.destination)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="font-mono text-[9px] uppercase tracking-wide flex items-center gap-1 bg-white px-1.5 py-0.5 border border-neo-black text-zinc-600 hover:text-neo-black hover:bg-travel-yellow transition-colors group/link truncate max-w-[150px]"
                                        title="Open in Google Maps"
                                     >
                                         <MapPin className="w-2.5 h-2.5" /> 
                                         <span className="truncate">{act.location}</span>
                                     </a>
                                  </div>
                                  
                                  {isEditMode ? (
                                    <textarea
                                        value={act.description}
                                        onChange={(e) => handleUpdateActivity(dayIndex, act.id, 'description', e.target.value)}
                                        className="text-xs text-zinc-600 leading-snug w-full border border-dashed border-zinc-400 focus:border-neo-black p-2 mt-1 bg-zinc-50 resize-y focus:outline-none font-mono"
                                        rows={3}
                                        placeholder="Description..."
                                    />
                                  ) : (
                                    <p className="text-xs text-zinc-600 leading-snug border-t border-dashed border-zinc-200 pt-1.5 whitespace-pre-wrap">
                                        {act.description}
                                    </p>
                                  )}
                              </div>
                           </div>
                        </NeoCard>
                      </Reorder.Item>
                    ))}
                    </AnimatePresence>
                </Reorder.Group>

                 {/* Add Button */}
                 <button 
                    onClick={() => openAddModal(dayIndex)}
                    className="w-full mt-4 py-2 border-2 border-dashed border-zinc-300 text-zinc-400 font-mono text-xs font-bold uppercase hover:border-neo-black hover:text-neo-black hover:bg-white transition-all flex items-center justify-center gap-2 group rounded-sm"
                 >
                     <div className="w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:border-neo-black flex items-center justify-center transition-colors">
                        <Plus className="w-2.5 h-2.5" />
                     </div>
                     Add Activity
                 </button>
            </div>
        </NeoCard>
    </Reorder.Item>
  );
};

export const ItineraryGenerator: React.FC<ItineraryGeneratorProps> = ({ language, user, onDeductCredits, onRequireLogin, onRequireCredits, loadedItinerary }) => {
  const [loading, setLoading] = useState(false);
  
  // -- STATE MANAGEMENT WITH PERSISTENCE --

  // 1. Itinerary Result: Initialize from localStorage if available
  const [itinerary, setItinerary] = useState<Itinerary | null>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('vagabond_current_result');
            // Ensure saved data is valid object, otherwise null to prevent crashes
            if (saved && saved !== "undefined" && saved !== "null") {
                const parsed = JSON.parse(saved);
                return (parsed && typeof parsed === 'object') ? parsed : null;
            }
        } catch (e) { return null; }
    }
    return null;
  });

  // 2. Active Tab: Initialize based on whether there's an itinerary
  const [activeTab, setActiveTab] = useState<'itinerary' | 'essentials' | 'config'>(() => {
     if (typeof window !== 'undefined') {
         const saved = localStorage.getItem('vagabond_current_result');
         if (saved && saved !== "undefined" && saved !== "null") {
             return 'itinerary';
         }
     }
     return 'config';
  });

  // 3. Preferences (Draft): Initialize from localStorage
  const [prefs, setPrefs] = useState<TravelPreferences>(() => {
    const defaultPrefs: TravelPreferences = {
        origin: '',
        destination: '',
        days: 3,
        budget: 'Moderate',
        interests: [],
        travelers: 1,
        transportMode: 'Public Transport',
        travelStyle: 'Relaxed' // Default
    };
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('vagabond_trip_draft');
            if (saved && saved !== "undefined") {
                const parsed = JSON.parse(saved);
                // Defensive merge to prevent "undefined" values if schema changed
                return { 
                    ...defaultPrefs, 
                    ...parsed,
                    interests: Array.isArray(parsed.interests) ? parsed.interests : [], // Ensure array
                    transportMode: parsed.transportMode || 'Public Transport', // Ensure string
                    travelStyle: parsed.travelStyle || 'Relaxed' // Ensure string
                };
            }
        } catch(e) {}
    }
    return defaultPrefs;
  });

  // -- PERSISTENCE EFFECTS --

  // Save prefs to localStorage whenever they change
  useEffect(() => {
      localStorage.setItem('vagabond_trip_draft', JSON.stringify(prefs));
  }, [prefs]);

  // Save itinerary to localStorage whenever it changes
  useEffect(() => {
      if (itinerary) {
          localStorage.setItem('vagabond_current_result', JSON.stringify(itinerary));
      } else {
          // If explicitly set to null (e.g. user clears it), remove from storage
          localStorage.removeItem('vagabond_current_result');
      }
  }, [itinerary]);

  const [feedbackState, setFeedbackState] = useState<'idle' | 'positive' | 'negative_input' | 'submitted'>('idle');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPackingEditMode, setIsPackingEditMode] = useState(false);
  const [packingInputs, setPackingInputs] = useState<{ [key: number]: string }>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  // Checklist State for Packing List
  const [packedItems, setPackedItems] = useState<Set<string>>(new Set());

  // Animation States
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'exported'>('idle');

  // Activity Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false); 
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Global Time Picker State
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<{ type: 'new' } | { type: 'edit', dayIndex: number, actId: string } | null>(null);
  const [timePickerTab, setTimePickerTab] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');

  // Origin/Destination Autocomplete State
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [isFetchingOrigin, setIsFetchingOrigin] = useState(false);

  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [isFetchingDest, setIsFetchingDest] = useState(false);
  const [destType, setDestType] = useState<'local' | 'intl'>('local');

  const isOriginSelection = useRef(false);
  const isDestSelection = useRef(false);

  // Cost Modal State
  const [showCostModal, setShowCostModal] = useState(false);

  // Packing Suggestions State
  const [isPackingSuggestionModalOpen, setIsPackingSuggestionModalOpen] = useState(false);
  const [packingSuggestions, setPackingSuggestions] = useState<SuggestedPackingItem[]>([]);
  const [isSuggestingPacking, setIsSuggestingPacking] = useState(false);

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [newActivityForm, setNewActivityForm] = useState({
    time: '09:00 AM',
    activity: '',
    location: '',
    cost: '',
    description: '',
    emoji: '✨'
  });
  
  // AI Suggestions State
  const [suggestedActivities, setSuggestedActivities] = useState<SuggestedActivity[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Location Autocomplete State
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isFetchingLocations, setIsFetchingLocations] = useState(false);

  const t = translations[language].generator;
  const TRIP_COST = 5;

  // Handle loading itinerary from props (Overrides local storage)
  useEffect(() => {
    if (loadedItinerary) {
      setItinerary(loadedItinerary);
      if (loadedItinerary.originalPrefs) {
        setPrefs(loadedItinerary.originalPrefs);
      }
      setActiveTab('itinerary');
      setLoading(false);
    }
  }, [loadedItinerary]);

  // Debounce for Origin Autocomplete
  useEffect(() => {
    if (isOriginSelection.current) {
        isOriginSelection.current = false;
        return;
    }
    const fetchOrigin = async () => {
        if (!prefs.origin || prefs.origin.length < 3) {
            setOriginSuggestions([]);
            return;
        }
        setIsFetchingOrigin(true);
        try {
            const places = await generatePlaceSuggestions(prefs.origin, '', language, 'city');
            setOriginSuggestions(places);
            setShowOriginSuggestions(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingOrigin(false);
        }
    };
    const debounce = setTimeout(fetchOrigin, 500);
    return () => clearTimeout(debounce);
  }, [prefs.origin, language]);

  // Debounce for Destination Autocomplete
  useEffect(() => {
    if (isDestSelection.current) {
        isDestSelection.current = false;
        return;
    }
    const fetchDest = async () => {
        if (!prefs.destination || prefs.destination.length < 3) {
            setDestSuggestions([]);
            return;
        }
        setIsFetchingDest(true);
        try {
            const places = await generatePlaceSuggestions(prefs.destination, '', language, 'city');
            setDestSuggestions(places);
            setShowDestSuggestions(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingDest(false);
        }
    };
    const debounce = setTimeout(fetchDest, 500);
    return () => clearTimeout(debounce);
  }, [prefs.destination, language]);

  // Debounce for location search (Activity Modal)
  useEffect(() => {
    const fetchPlaces = async () => {
        if (!newActivityForm.location || newActivityForm.location.length < 3) return;
        
        setIsFetchingLocations(true);
        try {
            const dest = itinerary?.destination || prefs.destination || '';
            const places = await generatePlaceSuggestions(newActivityForm.location, dest, language);
            setLocationSuggestions(places);
        } catch (e) {
            console.error("Error fetching places", e);
        } finally {
            setIsFetchingLocations(false);
        }
    };

    if (showLocationSuggestions) {
        const debounce = setTimeout(fetchPlaces, 500);
        return () => clearTimeout(debounce);
    }
  }, [newActivityForm.location, showLocationSuggestions, itinerary, prefs, language]);

  const processItinerary = (rawItinerary: Itinerary): Itinerary => {
    return {
      ...rawItinerary,
      days: rawItinerary.days.map(day => ({
        ...day,
        id: generateId(),
        activities: day.activities.map(act => ({
          ...act,
          id: generateId()
        }))
      }))
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs.destination || !prefs.origin) return;

    if (!user.isLoggedIn) {
      onRequireLogin();
      return;
    }

    if (user.credits < TRIP_COST) {
      onRequireCredits();
      return;
    }
    
    setLoading(true);
    setItinerary(null);
    setFeedbackState('idle');
    setIsEditMode(false);
    setIsPackingEditMode(false);
    setIsPlaying(false);
    setIsBudgetModalOpen(false);
    setPackedItems(new Set()); // Reset checklist
    
    try {
      const result = await generateItinerary(prefs, language);
      setItinerary(processItinerary(result));
      setActiveTab('itinerary');
      onDeductCredits(TRIP_COST);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMusic = () => {
    if (!itinerary) return;
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
        window.open(`https://open.spotify.com/search/${encodeURIComponent(itinerary.playlistVibe)}`, '_blank');
    }
  };

  // --- Itinerary Manipulation Functions ---
  
  const handleDayReorder = (newDayOrder: DayPlan[]) => {
    if (!itinerary) return;
    const updatedDays = newDayOrder.map((d, i) => ({
        ...d,
        day: i + 1
    }));
    setItinerary({ ...itinerary, days: updatedDays });
  };

  const handleReorderActivities = (dayIndex: number, newOrder: Activity[]) => {
    if (!itinerary) return;
    const newDays = [...itinerary.days];
    newDays[dayIndex] = { ...newDays[dayIndex], activities: newOrder };
    setItinerary({ ...itinerary, days: newDays });
  };

  const handleUpdateActivity = (dayIndex: number, actId: string, field: keyof Activity, value: string) => {
    if (!itinerary) return;
    const newDays = [...itinerary.days];
    const actIndex = newDays[dayIndex].activities.findIndex(a => a.id === actId);
    if (actIndex === -1) return;

    newDays[dayIndex].activities[actIndex] = {
      ...newDays[dayIndex].activities[actIndex],
      [field]: value
    };
    setItinerary({ ...itinerary, days: newDays });
  };

  const handleOpenTimePicker = (target: 'new' | { dayIndex: number, actId: string }) => {
      const isNew = target === 'new';
      const initialTime = isNew ? newActivityForm.time : 
          (typeof target !== 'string' ? itinerary?.days[target.dayIndex].activities.find(a => a.id === target.actId)?.time : '09:00 AM');
      
      const category = getTimeCategory(initialTime || '09:00 AM') as any;
      setTimePickerTab(category);
      setTimePickerTarget(isNew ? { type: 'new' } : { type: 'edit', ...target as any });
      setTimePickerOpen(true);
  };

  const handleTimeSelect = (time: string) => {
      if (!timePickerTarget) return;
      if (timePickerTarget.type === 'new') {
          setNewActivityForm(prev => ({ ...prev, time }));
      } else {
          handleUpdateActivity(timePickerTarget.dayIndex, timePickerTarget.actId, 'time', time);
      }
      setTimePickerOpen(false);
  };

  const handleDeleteActivity = (dayIndex: number, actId: string) => {
    if (!itinerary) return;
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(a => a.id !== actId);
    setItinerary({ ...itinerary, days: newDays });
  };

  const handleUpdateDayTheme = (dayIndex: number, newTheme: string) => {
    if (!itinerary) return;
    const newDays = [...itinerary.days];
    newDays[dayIndex] = { ...newDays[dayIndex], theme: newTheme };
    setItinerary({ ...itinerary, days: newDays });
  };

  const handleMoveDay = (currentDayIndex: number, actId: string, targetDayNumber: number) => {
    if (!itinerary) return;
    const targetDayIndex = targetDayNumber - 1;
    if (currentDayIndex === targetDayIndex) return;

    const newDays = [...itinerary.days];
    const activityToMove = newDays[currentDayIndex].activities.find(a => a.id === actId);
    
    if (!activityToMove) return;

    newDays[currentDayIndex].activities = newDays[currentDayIndex].activities.filter(a => a.id !== actId);
    newDays[targetDayIndex].activities = [...newDays[targetDayIndex].activities, activityToMove];

    setItinerary({ ...itinerary, days: newDays });
  };

  const handleAddCategory = () => {
     if (!newCategoryName.trim() || !itinerary) return;
     const newItinerary = { ...itinerary };
     newItinerary.packingList.push({
         category: newCategoryName,
         items: []
     });
     setItinerary(newItinerary);
     setNewCategoryName('');
  };

  const handleDeleteCategory = (categoryIndex: number) => {
      if (!itinerary) return;
      if (!confirm("Delete this entire category and all items?")) return;
      const newItinerary = { ...itinerary };
      newItinerary.packingList.splice(categoryIndex, 1);
      setItinerary(newItinerary);
  };

  const handleAddPackingItem = (categoryIndex: number) => {
    if (!itinerary) return;
    const newItemName = packingInputs[categoryIndex];
    if (!newItemName || !newItemName.trim()) return;

    const newItinerary = { ...itinerary };
    newItinerary.packingList[categoryIndex].items.push({
      name: newItemName,
      reason: 'User added'
    });
    setItinerary(newItinerary);
    setPackingInputs({ ...packingInputs, [categoryIndex]: '' });
  };

  const handleRemovePackingItem = (categoryIndex: number, itemIndex: number) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary };
    newItinerary.packingList[categoryIndex].items.splice(itemIndex, 1);
    setItinerary(newItinerary);
  };

  // --- Checklist Toggle Function ---
  const togglePacked = (id: string) => {
    const newSet = new Set(packedItems);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setPackedItems(newSet);
  };

  const handleAiPackingSuggest = async () => {
    if (!itinerary) return;
    setIsSuggestingPacking(true);
    try {
        const allActivities = itinerary.days.flatMap(d => d.activities.map(a => a.activity));
        const suggestions = await generatePackingSuggestions(itinerary.destination, itinerary.weatherForecast, allActivities, language);
        setPackingSuggestions(suggestions);
        setIsPackingSuggestionModalOpen(true);
    } catch (e) {
        console.error(e);
        alert("Could not fetch suggestions.");
    } finally {
        setIsSuggestingPacking(false);
    }
  };

  const handleAddSuggestedPackingItems = (suggestion: SuggestedPackingItem) => {
      if (!itinerary) return;
      const newItinerary = { ...itinerary };
      let categoryIndex = newItinerary.packingList.findIndex(c => c.category.toLowerCase() === suggestion.category.toLowerCase());
      if (categoryIndex === -1) {
          categoryIndex = newItinerary.packingList.length;
          newItinerary.packingList.push({
              category: suggestion.category,
              items: []
          });
      }
      const exists = newItinerary.packingList[categoryIndex].items.some(item => item.name.toLowerCase() === suggestion.name.toLowerCase());
      if (!exists) {
        newItinerary.packingList[categoryIndex].items.push({
            name: suggestion.name,
            reason: suggestion.reason
        });
      }
      setItinerary(newItinerary);
      setPackingSuggestions(prev => prev.filter(p => p.name !== suggestion.name));
  };

  const openAddModal = (dayIndex: number) => {
    setActiveDayIndex(dayIndex);
    setNewActivityForm({
      time: '09:00 AM',
      activity: '',
      location: '',
      cost: '',
      description: '',
      emoji: '✨'
    });
    setSuggestedActivities([]);
    setIsAddModalOpen(true);
  };

  const handleAiSuggest = async (isRegenerate = false) => {
    if (activeDayIndex === null || !itinerary) return;
    
    setIsSuggesting(true);
    if (!isRegenerate) setSuggestedActivities([]); 
    
    try {
        const dayTheme = itinerary.days[activeDayIndex].theme;
        const suggestions = await generateActivitySuggestions(itinerary.destination, dayTheme, language);
        setSuggestedActivities(suggestions);
        if (!isSuggestionsModalOpen) setIsSuggestionsModalOpen(true);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSuggesting(false);
    }
  };

  const selectSuggestion = (suggestion: SuggestedActivity) => {
      setNewActivityForm({
          ...newActivityForm,
          activity: suggestion.activity,
          description: suggestion.description,
          cost: suggestion.cost,
          emoji: suggestion.emoji
      });
      setIsSuggestionsModalOpen(false);
  };

  const handleSaveNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDayIndex === null || !itinerary) return;
    
    const newActivity: Activity = {
      id: generateId(),
      time: newActivityForm.time || 'TBD',
      activity: newActivityForm.activity || 'New Activity',
      location: newActivityForm.location || 'TBD',
      cost: newActivityForm.cost || 'TBD',
      description: newActivityForm.description || '',
      emoji: newActivityForm.emoji || '✨'
    };

    const newDays = [...itinerary.days];
    newDays[activeDayIndex].activities.push(newActivity);
    setItinerary({ ...itinerary, days: newDays });
    setIsAddModalOpen(false);
  };
  
  const getMapUrl = (location: string, destination: string) => {
    const query = location === 'TBD' ? destination : `${location}, ${destination}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const handleSave = async () => {
    if (!itinerary) return;
    setSaveStatus('saving');
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const existing = localStorage.getItem('vagabond_saved_itineraries');
      const savedItineraries: Itinerary[] = existing ? JSON.parse(existing) : [];
      
      const exists = savedItineraries.some(
        item => item.destination === itinerary.destination && item.title === itinerary.title
      );

      if (!exists) {
        savedItineraries.push(itinerary);
        localStorage.setItem('vagabond_saved_itineraries', JSON.stringify(savedItineraries));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        alert("This itinerary is already saved!");
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save to local storage.");
      setSaveStatus('idle');
    }
  };

  const handleExportPDF = async () => {
    if (!itinerary) return;
    setExportStatus('exporting');
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(29, 29, 29);
    doc.setFont("helvetica", "bold");
    doc.text("VAGABOND ITINERARY", 14, 20);
    doc.setFontSize(16);
    doc.text(itinerary.title, 14, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Destination: ${itinerary.destination}`, 14, 40);
    doc.text(`Duration: ${itinerary.totalDays} Days`, 14, 45);
    doc.text(`Budget: ${itinerary.budgetLevel}`, 14, 50);
    let finalY = 60;
    itinerary.days.forEach((day) => {
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Day ${day}: ${day.theme}`, 14, finalY + 10);
        const tableBody = day.activities.map(act => [act.time, act.activity, act.location, act.cost]);
        autoTable(doc, {
            startY: finalY + 15,
            head: [['Time', 'Activity', 'Location', 'Cost']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [29, 29, 29], textColor: [255, 255, 255] },
            styles: { font: 'helvetica', fontSize: 9 },
            margin: { left: 14, right: 14 }
        });
        finalY = (doc as any).lastAutoTable.finalY + 10;
    });
    doc.save(`Vagabond_${itinerary.destination.replace(/\s+/g, '_')}.pdf`);
    
    setExportStatus('exported');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  const handleSurprise = () => {
    const destinations = ["Kyoto, Japan", "Reykjavik, Iceland", "Marrakech, Morocco", "Buenos Aires, Argentina", "Cape Town, South Africa", "Lisbon, Portugal"];
    const origins = ["Jakarta, Indonesia", "Singapore", "Kuala Lumpur", "Sydney, Australia", "London, UK"];
    
    setPrefs({ 
        ...prefs, 
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        origin: origins[Math.floor(Math.random() * origins.length)]
    });
  };

  const toggleInterest = (interest: string) => {
    setPrefs(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
    }));
  };

  const budgetItems = itinerary ? [
    { id: 'flights', label: t.budget_breakdown.flights, amount: itinerary.estimatedCost.flights, value: parseCostToNumber(itinerary.estimatedCost.flights), color: 'bg-zinc-800', textColor: 'text-white', bgClass: 'bg-neo-black', icon: Plane },
    { id: 'accommodation', label: t.budget_breakdown.accommodation, amount: itinerary.estimatedCost.accommodation, value: parseCostToNumber(itinerary.estimatedCost.accommodation), color: 'bg-travel-orange', textColor: 'text-neo-black', bgClass: 'bg-zinc-100', icon: Bed },
    { id: 'food', label: t.budget_breakdown.food, amount: itinerary.estimatedCost.food, value: parseCostToNumber(itinerary.estimatedCost.food), color: 'bg-travel-teal', textColor: 'text-neo-black', bgClass: 'bg-zinc-100', icon: Utensils },
    { id: 'activities', label: t.budget_breakdown.activities, amount: itinerary.estimatedCost.activities, value: parseCostToNumber(itinerary.estimatedCost.activities), color: 'bg-travel-lime', textColor: 'text-neo-black', bgClass: 'bg-zinc-100', icon: Ticket },
    { id: 'transport', label: t.budget_breakdown.transport, amount: itinerary.estimatedCost.transport, value: parseCostToNumber(itinerary.estimatedCost.transport), color: 'bg-travel-yellow', textColor: 'text-neo-black', bgClass: 'bg-zinc-100', icon: Bus },
  ] : [];

  const maxCost = Math.max(...budgetItems.map(d => d.value), 1);

  const renderConfigForm = () => (
      <form onSubmit={handleGenerate} className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Origin */}
        <div className="col-span-12 md:col-span-6 relative z-30">
          <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_origin}</label>
          <div className="relative group">
              <Navigation className="absolute left-3 top-3 w-4 h-4 text-zinc-400 group-focus-within:text-travel-teal transition-colors z-10" />
              <input 
                type="text" 
                placeholder={t.placeholder_origin}
                className="w-full pl-9 pr-3 py-3 border-2 border-neo-black focus:outline-none focus:ring-0 focus:shadow-neo-sm transition-all font-mono text-sm bg-white text-neo-black placeholder:text-zinc-300 font-bold"
                value={prefs.origin}
                onChange={(e) => {
                    setPrefs({...prefs, origin: e.target.value});
                    if (e.target.value.length < 3) setShowOriginSuggestions(false);
                }}
                onFocus={() => {
                    if(originSuggestions.length > 0) setShowOriginSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                required
                autoComplete="off"
              />
              {isFetchingOrigin && <div className="absolute right-2 top-3"><Loader2 className="w-4 h-4 animate-spin text-zinc-400" /></div>}
              
              {/* Maps-style Autocomplete Dropdown */}
              {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-neo-black shadow-neo-lg z-50 max-h-48 overflow-y-auto mt-1 flex flex-col">
                      {originSuggestions.map((place, idx) => (
                          <button key={idx} type="button" className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-travel-teal hover:text-white border-b border-zinc-100 last:border-0 flex items-center gap-2 font-bold group" onClick={() => { isOriginSelection.current = true; setPrefs({...prefs, origin: place}); setShowOriginSuggestions(false); }}>
                              <MapPin className="w-3 h-3 shrink-0 text-zinc-400 group-hover:text-white" />
                              <span className="truncate">{place}</span>
                          </button>
                      ))}
                  </div>
              )}
          </div>
        </div>

        {/* Destination */}
        <div className="col-span-12 md:col-span-6 relative z-20">
          <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_where}</label>
          <div className="relative flex gap-2">
            <div className="relative flex-grow group">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400 group-focus-within:text-travel-orange transition-colors z-10" />
              <input 
                type="text" 
                placeholder={t.placeholder_dest}
                className="w-full pl-9 pr-3 py-3 border-2 border-neo-black focus:outline-none focus:ring-0 focus:shadow-neo-sm transition-all font-mono text-sm bg-white text-neo-black placeholder:text-zinc-300 font-bold"
                value={prefs.destination}
                onChange={(e) => {
                    setPrefs({...prefs, destination: e.target.value});
                    if (e.target.value.length < 3) setShowDestSuggestions(false);
                }}
                onFocus={() => {
                    if(destSuggestions.length > 0) setShowDestSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                required
                autoComplete="off"
              />
               {isFetchingDest && <div className="absolute right-2 top-3"><Loader2 className="w-4 h-4 animate-spin text-zinc-400" /></div>}
               
               {/* Maps-style Autocomplete Dropdown */}
               {showDestSuggestions && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-neo-black shadow-neo-lg z-50 max-h-48 overflow-y-auto mt-1 flex flex-col">
                      {destSuggestions.map((place, idx) => (
                          <button key={idx} type="button" className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-travel-orange hover:text-neo-black border-b border-zinc-100 last:border-0 flex items-center gap-2 font-bold group" onClick={() => { isDestSelection.current = true; setPrefs({...prefs, destination: place}); setShowDestSuggestions(false); }}>
                              <MapPin className="w-3 h-3 shrink-0 text-zinc-400 group-hover:text-neo-black" />
                              <span className="truncate">{place}</span>
                          </button>
                      ))}
                  </div>
              )}
            </div>
            <NeoButton type="button" size="sm" variant="secondary" className="px-3 shrink-0" onClick={handleSurprise} title={t.btn_surprise}><Dices className="w-5 h-5" /></NeoButton>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="col-span-12">
            <div className="flex justify-between items-center mb-2">
                <label className="block font-bold text-[10px] uppercase tracking-wide opacity-70 flex items-center gap-1">
                    <Star className="w-3 h-3 text-travel-yellow fill-travel-yellow" /> Top Destinations
                </label>
                
                {/* Local / Intl Toggle */}
                <div className="flex bg-zinc-100 border border-neo-black p-0.5 rounded-sm">
                    <button 
                        type="button"
                        onClick={() => setDestType('local')}
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors rounded-sm flex items-center gap-1 ${destType === 'local' ? 'bg-neo-black text-white' : 'text-zinc-500 hover:text-neo-black'}`}
                    >
                        <Flag className="w-2 h-2" /> Lokal
                    </button>
                    <button 
                        type="button"
                        onClick={() => setDestType('intl')}
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors rounded-sm flex items-center gap-1 ${destType === 'intl' ? 'bg-neo-black text-white' : 'text-zinc-500 hover:text-neo-black'}`}
                    >
                        <Globe className="w-2 h-2" /> Intl
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {(destType === 'local' ? TOP_DESTINATIONS_LOCAL : TOP_DESTINATIONS_INTL).map((dest, i) => (
                    <button 
                        key={i} 
                        type="button" 
                        onClick={() => setPrefs({...prefs, destination: dest.name})}
                        className="px-3 py-1.5 border-2 border-zinc-200 bg-white hover:border-neo-black hover:bg-travel-yellow text-[10px] font-bold uppercase transition-all rounded-sm flex items-center gap-1 shadow-sm active:translate-y-[1px]"
                    >
                        <span>{dest.icon}</span>
                        {dest.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Days */}
        <div className="col-span-6 md:col-span-3">
            <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_days}</label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-400 group-focus-within:text-travel-teal z-10" />
              <input type="number" min="1" max="14" className="w-full pl-9 pr-2 py-3 border-2 border-neo-black focus:outline-none focus:shadow-neo-sm transition-all font-mono text-sm font-bold bg-white text-neo-black" value={prefs.days} onChange={(e) => setPrefs({...prefs, days: parseInt(e.target.value) || 1})} />
            </div>
        </div>
        
        {/* Travelers */}
        <div className="col-span-6 md:col-span-3">
            <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_travelers}</label>
            <div className="relative group">
              <Users className="absolute left-3 top-3 w-4 h-4 text-zinc-400 group-focus-within:text-travel-teal z-10" />
              <input type="number" min="1" max="20" className="w-full pl-9 pr-2 py-3 border-2 border-neo-black focus:outline-none focus:shadow-neo-sm transition-all font-mono text-sm font-bold bg-white text-neo-black" value={prefs.travelers} onChange={(e) => setPrefs({...prefs, travelers: parseInt(e.target.value) || 1})} />
            </div>
        </div>

        {/* Budget */}
        <div className="col-span-6 md:col-span-3">
            <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_budget}</label>
            <div className="relative group">
              <select className="w-full pl-3 pr-8 py-3 border-2 border-neo-black focus:outline-none focus:shadow-neo-sm transition-all font-mono text-xs font-bold appearance-none bg-white text-neo-black truncate" value={prefs.budget} onChange={(e) => setPrefs({...prefs, budget: e.target.value as any})}>
                <option value="Budget">{t.budget_options.Budget}</option>
                <option value="Moderate">{t.budget_options.Moderate}</option>
                <option value="Luxury">{t.budget_options.Luxury}</option>
              </select>
              <Wallet className="absolute right-3 top-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
        </div>

        {/* Travel Style */}
        <div className="col-span-6 md:col-span-3">
            <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_style}</label>
            <div className="relative group">
              <Compass className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400 z-10" />
              <select className="w-full pl-8 pr-8 py-3 border-2 border-neo-black focus:outline-none focus:shadow-neo-sm transition-all font-mono text-xs font-bold appearance-none bg-white text-neo-black truncate" value={prefs.travelStyle || 'Relaxed'} onChange={(e) => setPrefs({...prefs, travelStyle: e.target.value})}>
                <option value="Relaxed">{t.style_options.relaxed}</option>
                <option value="Fast-Paced">{t.style_options.fast}</option>
                <option value="Adventurous">{t.style_options.adventure}</option>
                <option value="Cultural">{t.style_options.culture}</option>
                <option value="Romantic">{t.style_options.romantic}</option>
                <option value="Family Friendly">{t.style_options.family}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
        </div>

        {/* Transport */}
        <div className="col-span-12 md:col-span-12">
            <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_transport}</label>
            <div className="relative group">
               {prefs.transportMode?.includes('Car') || prefs.transportMode?.includes('Vehicle') ? <Car className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400 z-10" /> : 
                prefs.transportMode?.includes('Flight') ? <Plane className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400 z-10" /> :
                <Bus className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400 z-10" />}
               
              <select className="w-full pl-8 pr-8 py-3 border-2 border-neo-black focus:outline-none focus:shadow-neo-sm transition-all font-mono text-xs font-bold appearance-none bg-white text-neo-black" value={prefs.transportMode} onChange={(e) => setPrefs({...prefs, transportMode: e.target.value})}>
                <option value="Public Transport">{t.transport_options.public}</option>
                <option value="Rental Car">{t.transport_options.rental}</option>
                <option value="Taxi / Rideshare">{t.transport_options.taxi}</option>
                <option value="Private Driver">{t.transport_options.private}</option>
                <option value="Private Vehicle">{t.transport_options.personal}</option>
                <option value="Flight">Flight / Plane</option>
              </select>
              <Fuel className="absolute right-3 top-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
        </div>

        {/* Vibe */}
        <div className="col-span-12">
          <label className="block font-bold text-[10px] mb-2 uppercase tracking-wide">{t.label_vibe}</label>
          <div className="flex flex-wrap gap-2">
            {t.interests.map(interest => (
              <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-3 py-1.5 border-2 border-neo-black text-[10px] font-bold uppercase transition-all whitespace-nowrap ${prefs.interests?.includes(interest) ? 'bg-neo-black text-white shadow-neo-sm' : 'bg-white hover:bg-zinc-100 text-zinc-500'}`}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-12 mt-4">
            <NeoButton type="submit" fullWidth size="lg" variant="accent" disabled={loading} className="flex gap-2 items-center justify-center bg-neo-black text-white border-neo-black hover:bg-zinc-800 py-4">
                {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> {t.btn_generating}</div> : <><div className="flex items-center gap-2 font-black uppercase tracking-wider text-base">{t.btn_generate}</div><span className="opacity-50 text-xs mx-2">|</span><div className="text-xs font-mono flex items-center gap-1 opacity-80"><Coins className="w-4 h-4" /> 5 Credits</div></>}
            </NeoButton>
        </div>
      </form>
  );

  return (
    <div className={`w-full max-w-7xl mx-auto p-2 md:p-6 relative ${!itinerary ? 'min-h-[600px] flex items-center justify-center' : ''}`}>
      
      {!itinerary && !loading && (
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
           <NeoCard className="p-6 md:p-10 bg-travel-paper shadow-neo-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-travel-yellow rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="mb-8 text-center relative z-10">
                <div className="inline-block bg-neo-black text-white px-4 py-1.5 font-mono text-xs font-bold uppercase mb-3 transform -rotate-1 shadow-sm">{t.header_sub}</div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 tracking-tight">{t.config_title}</h2>
                <p className="text-sm font-mono text-zinc-500 font-bold uppercase tracking-widest">{t.config_sub}</p>
              </div>
              <div className="relative z-10">
                  {renderConfigForm()}
              </div>
           </NeoCard>
         </motion.div>
      )}

      <AnimatePresence>
      {loading && (
         <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-travel-paper overflow-hidden"
         >
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                 <motion.div 
                    className="absolute top-10 right-10 md:right-32 text-travel-orange opacity-80"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                 >
                    <Sun size={80} strokeWidth={2} fill="#FCEE8C" />
                 </motion.div>
                 {[1, 2, 3, 4].map((i) => (
                     <motion.div key={i} className="absolute" initial={{ x: "100vw", top: `${5 + Math.random() * 30}%`, opacity: 0.4 + Math.random() * 0.4 }} animate={{ x: "-20vw" }} transition={{ duration: 8 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: i * 2 }}>
                        <Cloud size={60 + Math.random() * 60} className="text-zinc-300 fill-white" strokeWidth={1.5} />
                     </motion.div>
                 ))}
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
                 {prefs.transportMode?.includes('Flight') ? (
                     <motion.div animate={{ y: [-15, 15, -15], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative">
                        <motion.div className="absolute -left-20 top-10 w-24 h-1 bg-neo-black rounded-full opacity-20" animate={{ x: [0, -100], opacity: [0.2, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
                        <motion.div className="absolute -left-10 top-20 w-16 h-1 bg-neo-black rounded-full opacity-20" animate={{ x: [0, -80], opacity: [0.2, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }} />
                        <Plane size={140} strokeWidth={1.5} className="text-neo-black fill-white drop-shadow-neo-lg" />
                     </motion.div>
                 ) : (
                     <div className="relative w-full h-80 overflow-hidden">
                        {/* Road Container - Centered Vertically */}
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-32 bg-zinc-200/50 flex items-center overflow-hidden border-y-4 border-neo-black">
                            <motion.div 
                                className="flex gap-20 absolute top-1/2 -translate-y-1/2 w-[200%]"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                            >
                                {Array.from({length: 20}).map((_, i) => (
                                    <div key={i} className="w-24 h-3 bg-white border-2 border-neo-black transform -skew-x-12"></div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Passing Scenery - Bottom of Road */}
                        <motion.div className="absolute top-1/2 w-full h-32 pointer-events-none mt-16">
                             {[1,2,3].map(i => (
                                 <motion.div 
                                    key={i}
                                    className="absolute bottom-0 w-4 h-24 bg-neo-black/10 rounded-t-full"
                                    style={{ left: `${i * 30}%` }}
                                    animate={{ x: ["100vw", "-100vw"] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                                 />
                             ))}
                        </motion.div>

                        {/* Car - Centered on top of road */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mt-[-10px]"
                            animate={{ 
                                y: [-1, 1, -1],
                                rotate: [-1, 1, -1]
                            }}
                            transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
                        >
                            <Car size={140} strokeWidth={1.5} className="text-neo-black fill-travel-orange drop-shadow-neo-lg" />
                            
                            {/* Wind Effect - Behind Car (Left side) */}
                            <motion.div 
                                className="absolute top-1/2 -left-12 w-16 h-2 bg-neo-black/20 rounded-full"
                                animate={{ x: [0, -40], opacity: [0.4, 0], scaleX: [1, 0.5] }}
                                transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div 
                                className="absolute top-2/3 -left-8 w-10 h-1.5 bg-neo-black/20 rounded-full"
                                animate={{ x: [0, -30], opacity: [0.4, 0], scaleX: [1, 0.5] }}
                                transition={{ duration: 0.3, repeat: Infinity, ease: "linear", delay: 0.1 }}
                            />
                        </motion.div>
                     </div>
                 )}
                 <div className="mt-8 bg-white border-2 border-neo-black px-8 py-4 shadow-neo relative z-20">
                    <p className="font-mono uppercase font-black text-xl tracking-widest flex items-center gap-3">{t.loading_text}<span className="flex gap-1"><motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span><motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>.</motion.span><motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>.</motion.span></span></p>
                 </div>
            </div>
         </motion.div>
      )}
      </AnimatePresence>

      {itinerary && !loading && (
        <div className="w-full">
            <div className="flex border-b-2 border-neo-black mb-6 bg-white sticky top-16 z-40 shadow-sm">
                <button onClick={() => setActiveTab('itinerary')} className={`flex-1 py-3 font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'itinerary' ? 'bg-travel-yellow text-neo-black border-b-2 border-neo-black' : 'bg-white text-zinc-400 hover:text-neo-black hover:bg-zinc-50'}`}><Calendar className="w-4 h-4" /> {t.tab_itinerary}</button>
                <button onClick={() => setActiveTab('essentials')} className={`flex-1 py-3 font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 transition-all border-l-2 border-neo-black ${activeTab === 'essentials' ? 'bg-travel-teal text-neo-black border-b-2 border-neo-black' : 'bg-white text-zinc-400 hover:text-neo-black hover:bg-zinc-50'}`}><Luggage className="w-4 h-4" /> {t.tab_essentials}</button>
                <button onClick={() => setActiveTab('config')} className={`flex-1 py-3 font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 transition-all border-l-2 border-neo-black ${activeTab === 'config' ? 'bg-travel-orange text-neo-black border-b-2 border-neo-black' : 'bg-white text-zinc-400 hover:text-neo-black hover:bg-zinc-50'}`}><Settings className="w-4 h-4" /> {t.tab_config}</button>
            </div>

            <div className="min-h-[600px]">
                {/* --- TAB: ITINERARY --- */}
                {activeTab === 'itinerary' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <NeoCard className="h-full p-6 md:p-8 bg-white relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10"><Plane size={120} /></div>
                                     <div className="relative z-10">
                                         <div className="flex flex-wrap gap-2 mb-4">
                                             <span className="bg-travel-yellow text-neo-black border-2 border-neo-black px-3 py-1 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(29,29,29,1)]">{itinerary.totalDays} {t.days_unit} Trip</span>
                                             <span className="bg-travel-teal text-white border-2 border-neo-black px-3 py-1 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(29,29,29,1)]">{prefs.budget} Budget</span>
                                             <span className="bg-white text-neo-black border-2 border-neo-black px-3 py-1 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(29,29,29,1)]">{prefs.travelers} Pax</span>
                                         </div>
                                         <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] mb-4 tracking-tight">{itinerary.destination}</h1>
                                         <p className="font-mono text-sm md:text-base text-zinc-600 leading-relaxed max-w-2xl">{itinerary.summary}</p>
                                     </div>
                                </NeoCard>
                            </div>
                            <div className="space-y-4">
                                <NeoCard className="p-4 bg-travel-orange text-neo-black">
                                    <div className="font-mono text-xs font-bold uppercase mb-1 opacity-70">Total Est. Cost</div>
                                    <div className="text-2xl md:text-3xl font-black tracking-tight">{itinerary.estimatedCost.total}</div>
                                </NeoCard>
                                <NeoCard className="p-0 bg-neo-black overflow-hidden flex flex-col" hoverEffect>
                                    <div className="flex items-center gap-2 p-3 border-b-2 border-white bg-neo-black text-white"><Disc className="w-4 h-4 animate-spin-slow" /><h3 className="font-bold uppercase text-sm">{t.label_playlist}</h3></div>
                                    <div className="p-4 flex-grow flex flex-col items-center justify-center bg-zinc-900 relative overflow-hidden">
                                         <div className="w-full max-w-[150px] aspect-[1.6] bg-zinc-800 rounded-md border-2 border-zinc-700 relative mb-2 p-1.5 flex items-center justify-center">
                                             <div className="w-full h-full border-2 border-zinc-700 rounded-sm bg-neo-black relative overflow-hidden flex items-center justify-center">
                                                 <div className="w-10 h-5 bg-zinc-800 rounded-full border border-zinc-600 flex gap-2 items-center justify-center">
                                                     <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                     <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s'}}></div>
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-center z-10">
                                             <h4 className="text-white text-xs font-black uppercase mb-1 truncate max-w-[150px]">{itinerary.playlistVibe}</h4>
                                             <button onClick={handlePlayMusic} className="text-travel-lime text-[10px] font-mono uppercase underline hover:text-white">{isPlaying ? 'Pause' : 'Listen'}</button>
                                         </div>
                                         <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-between px-2 gap-1 opacity-20 pointer-events-none">
                                             {[1,2,3,4,5].map(i => ( <motion.div key={i} className="bg-travel-lime w-full" animate={{ height: ["10%", "80%", "30%"] }} transition={{ duration: 0.5 + Math.random(), repeat: Infinity, repeatType: "mirror" }} /> ))}
                                         </div>
                                    </div>
                                </NeoCard>
                                <div className="grid grid-cols-2 gap-2">
                                     <NeoButton onClick={handleSave} variant="secondary" size="sm" className="flex flex-col gap-1 h-auto py-2">
                                         {saveStatus === 'idle' && <><Save className="w-4 h-4" /> <span className="text-[10px]">Save</span></>}
                                         {saveStatus === 'saving' && <><Loader2 className="w-4 h-4 animate-spin" /> <span className="text-[10px]">Saving...</span></>}
                                         {saveStatus === 'saved' && <><Check className="w-4 h-4 text-green-600" /> <span className="text-[10px] text-green-600">Saved!</span></>}
                                     </NeoButton>
                                     <NeoButton onClick={handleExportPDF} variant="secondary" size="sm" className="flex flex-col gap-1 h-auto py-2">
                                         {exportStatus === 'idle' && <><FileDown className="w-4 h-4" /> <span className="text-[10px]">PDF</span></>}
                                         {exportStatus === 'exporting' && <><Loader2 className="w-4 h-4 animate-spin" /> <span className="text-[10px]">Exporting...</span></>}
                                         {exportStatus === 'exported' && <><Check className="w-4 h-4 text-green-600" /> <span className="text-[10px] text-green-600">Done!</span></>}
                                     </NeoButton>
                                </div>
                                <button onClick={() => setIsEditMode(!isEditMode)} className={`w-full py-2 border-2 border-neo-black font-bold uppercase text-xs transition-all shadow-neo-sm ${isEditMode ? 'bg-travel-lime' : 'bg-white hover:bg-zinc-50'}`}>{isEditMode ? 'Done Editing' : 'Edit Itinerary'}</button>
                            </div>
                        </div>

                        <Reorder.Group axis="y" values={itinerary.days} onReorder={handleDayReorder} className="space-y-4">
                            {itinerary.days.map((day, dayIndex) => (
                                <SortableDay key={day.id} day={day} dayIndex={dayIndex} isEditMode={isEditMode} itinerary={itinerary} handleReorderActivities={handleReorderActivities} handleUpdateActivity={handleUpdateActivity} handleDeleteActivity={handleDeleteActivity} handleUpdateDayTheme={handleUpdateDayTheme} handleMoveDay={handleMoveDay} openAddModal={openAddModal} onEditTime={handleOpenTimePicker} getMapUrl={getMapUrl} t={t} />
                            ))}
                        </Reorder.Group>

                        <div className="py-8 flex justify-center">
                            <div className="flex gap-4">
                                <button onClick={() => feedbackState === 'idle' && setFeedbackState('positive')} className={`group flex items-center gap-2 px-4 py-2 border-2 border-neo-black font-bold uppercase transition-all ${feedbackState === 'positive' ? 'bg-travel-lime shadow-neo-sm' : 'bg-white hover:bg-zinc-100'}`}><ThumbsUp className={`w-4 h-4 ${feedbackState === 'positive' ? 'fill-black' : ''}`} /> {feedbackState === 'positive' ? t.feedback.success_positive : t.feedback.yes}</button>
                                <button className="group flex items-center gap-2 px-4 py-2 border-2 border-neo-black font-bold uppercase bg-white hover:bg-zinc-100 transition-all"><Share2 className="w-4 h-4" /> Share Plan</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                 {activeTab === 'essentials' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div onClick={() => setIsBudgetModalOpen(true)} className="cursor-pointer h-full">
                            <NeoCard className="p-4 bg-white h-full group transition-all hover:-translate-y-1 hover:shadow-neo-lg" hoverEffect>
                                <div className="flex items-center justify-between mb-3 border-b-2 border-neo-black pb-2">
                                    <div className="flex items-center gap-2"><Wallet className="w-5 h-5" /> <h3 className="font-bold uppercase text-lg">{t.budget_breakdown.title}</h3></div>
                                    <div className="flex items-center gap-2"><div className="text-xs font-mono font-bold bg-zinc-100 px-2 py-0.5 border border-neo-black">{prefs.travelers} Pax</div><PieChart className="w-4 h-4 text-travel-teal" /></div>
                                </div>
                                <div className="space-y-2.5">
                                    {budgetItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 group/item">
                                        <div className={`w-6 h-6 ${item.bgClass} flex items-center justify-center border border-neo-black shadow-sm shrink-0`}><item.icon className={`w-3 h-3 ${item.id === 'flights' ? 'text-white' : 'text-neo-black'}`} /></div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-0.5"><span>{item.label}</span><span>{item.amount}</span></div>
                                            <div className="w-full h-1.5 bg-zinc-100 border border-neo-black relative overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / maxCost) * 100}%` }} transition={{ duration: 0.8, ease: "circOut" }} className={`h-full ${item.color} absolute top-0 left-0`} /></div>
                                        </div>
                                    </div>
                                    ))}
                                    <div className="text-center mt-4 text-[10px] font-bold uppercase text-travel-teal opacity-0 group-hover:opacity-100 transition-opacity">{t.budget_breakdown.view_details}</div>
                                </div>
                            </NeoCard>
                        </div>
                         <NeoCard className="p-4 bg-white h-full" hoverEffect>
                             <div className="flex items-center gap-2 mb-3 border-b-2 border-neo-black pb-2"><CloudSun className="w-5 h-5 text-travel-orange" /><h3 className="font-bold uppercase text-lg">{t.label_weather}</h3></div>
                            <div className="p-4 bg-travel-paper border-2 border-neo-black h-[140px] flex flex-col items-center justify-center text-center"><p className="text-sm font-mono font-bold leading-relaxed">{itinerary.weatherForecast}</p></div>
                         </NeoCard>
                      </div>
                       <div className="grid grid-cols-1 gap-4">
                           <NeoCard className="p-0 bg-white overflow-hidden" hoverEffect>
                               <div className="flex items-center gap-2 p-4 border-b-2 border-neo-black bg-white"><AlertTriangle className="w-5 h-5 text-neo-black" /><h3 className="font-bold uppercase text-lg">{t.label_advisories}</h3></div>
                               <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {itinerary.travelAdvisories?.map((advisory, idx) => (
                                     <div key={idx} className={`p-3 border-l-4 border-neo-black ${advisory.severity === 'Critical' ? 'bg-red-100 border-l-red-500' : advisory.severity === 'High' ? 'bg-orange-50 border-l-orange-500' : advisory.severity === 'Medium' ? 'bg-yellow-50 border-l-yellow-500' : 'bg-teal-50 border-l-teal-500'}`}>
                                         <div className="flex items-baseline justify-between mb-1"><h4 className="font-bold text-sm uppercase">{advisory.title}</h4><span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border border-neo-black ${advisory.severity === 'Critical' ? 'bg-red-500 text-white' : advisory.severity === 'High' ? 'bg-orange-500 text-white' : advisory.severity === 'Medium' ? 'bg-travel-yellow text-neo-black' : 'bg-travel-teal text-neo-black'}`}>{advisory.severity}</span></div>
                                         <p className="text-xs text-zinc-700 leading-tight">{advisory.description}</p>
                                     </div>
                                  ))}
                                  {(!itinerary.travelAdvisories || itinerary.travelAdvisories.length === 0) && <div className="col-span-2 text-center py-4 text-zinc-400 font-mono text-xs italic">No specific advisories found for this destination.</div>}
                               </div>
                           </NeoCard>
                       </div>
                      <NeoCard className="p-0 bg-travel-paper overflow-hidden" hoverEffect={!isPackingEditMode}>
                            <div className="flex items-center justify-between p-4 bg-travel-teal border-b-2 border-neo-black">
                                <div className="flex items-center gap-2"><Luggage className="w-5 h-5" /><h3 className="font-bold uppercase text-lg">{t.label_packing}</h3></div>
                                <div className="flex items-center gap-2">
                                   {isPackingEditMode && <button onClick={handleAiPackingSuggest} disabled={isSuggestingPacking} className="p-1 border-2 border-neo-black text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 bg-travel-yellow hover:bg-white disabled:opacity-50 shadow-sm" title="AI Smart Fill">{isSuggestingPacking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Smart Fill</button>}
                                    <button onClick={() => setIsPackingEditMode(!isPackingEditMode)} className={`p-1 border-2 border-neo-black text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${isPackingEditMode ? 'bg-neo-black text-white' : 'bg-white hover:bg-zinc-100'}`}>{isPackingEditMode ? <><Check className="w-3 h-3" /> {t.packing_done}</> : <><Pencil className="w-3 h-3" /> {t.packing_edit}</>}</button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                                    {itinerary.packingList.map((category, i) => {
                                        const headerColors = ['bg-travel-yellow', 'bg-travel-teal', 'bg-travel-lime', 'bg-travel-orange'];
                                        const headerColor = headerColors[i % headerColors.length];
                                        return (
                                            <div key={i} className="break-inside-avoid relative group">
                                                <div className="bg-white border-2 border-neo-black shadow-[4px_4px_0px_0px_rgba(29,29,29,1)] transition-transform hover:-translate-y-1">
                                                    <div className={`${headerColor} border-b-2 border-neo-black px-3 py-2 flex justify-between items-center`}><h4 className="font-black text-sm uppercase flex items-center gap-2">{category.category}<span className="bg-neo-black text-white text-[8px] px-1.5 py-0.5 rounded-sm font-mono">{category.items.length}</span></h4>{isPackingEditMode && <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(i); }} className="w-6 h-6 flex items-center justify-center bg-white border border-neo-black hover:bg-red-500 hover:text-white transition-all shadow-sm rounded-sm z-20" title="Delete Category"><Trash2 className="w-3 h-3" /></button>}</div>
                                                    <div className="p-3">
                                                        <ul className="space-y-2">
                                                            <AnimatePresence>
                                                                {category.items.map((item, j) => {
                                                                    const itemName = typeof item === 'string' ? item : item.name;
                                                                    const itemId = `${i}-${j}`;
                                                                    const isPacked = packedItems.has(itemId);
                                                                    return ( 
                                                                    <motion.li 
                                                                        key={j} 
                                                                        initial={{ opacity: 0, height: 0 }} 
                                                                        animate={{ opacity: 1, height: 'auto' }} 
                                                                        exit={{ opacity: 0, height: 0 }} 
                                                                        className={`flex items-start justify-between gap-2 group/item cursor-pointer select-none transition-opacity ${isPacked ? 'opacity-50' : 'opacity-100'}`}
                                                                        onClick={() => togglePacked(itemId)}
                                                                    >
                                                                        <div className="flex items-start gap-2 w-full">
                                                                            <div className={`w-4 h-4 border-2 border-neo-black shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isPacked ? 'bg-neo-black' : 'bg-white hover:bg-zinc-100'}`}>
                                                                                {isPacked && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                                                            </div>
                                                                            <span className={`text-xs font-bold uppercase leading-snug pt-0.5 decoration-2 decoration-neo-black/20 ${isPacked ? 'line-through' : ''}`}>{itemName}</span>
                                                                        </div>
                                                                        {isPackingEditMode && <button onClick={(e) => { e.stopPropagation(); handleRemovePackingItem(i, j); }} className="text-zinc-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>}
                                                                    </motion.li> 
                                                                    );
                                                                })}
                                                            </AnimatePresence>
                                                        </ul>
                                                        {isPackingEditMode && <div className="mt-3 pt-2 border-t-2 border-dashed border-zinc-200 flex items-center gap-1"><input type="text" className="w-full bg-transparent border-b-2 border-zinc-200 focus:border-neo-black outline-none text-xs font-mono py-1 px-1 placeholder:text-zinc-300" value={packingInputs[i] || ''} onChange={(e) => setPackingInputs({ ...packingInputs, [i]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') handleAddPackingItem(i); }} placeholder="Add item..." /><button onClick={() => handleAddPackingItem(i)} className="bg-neo-black text-white p-1 hover:bg-zinc-800"><Plus className="w-3 h-3" /></button></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isPackingEditMode && <div className="break-inside-avoid"><div className="border-4 border-dashed border-zinc-300 bg-zinc-50 p-4 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-neo-black hover:text-neo-black hover:bg-white transition-all min-h-[150px]"><div className="w-full"><label className="text-[10px] font-black uppercase mb-1 block">New Category Name</label><div className="flex gap-2"><input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full border-2 border-zinc-300 p-2 font-mono text-xs focus:border-neo-black outline-none bg-white text-neo-black" placeholder="e.g. Toiletries" onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }} /><button onClick={handleAddCategory} className="bg-neo-black text-white px-3 py-1 font-bold uppercase text-xs">Add</button></div></div><div className="flex items-center gap-1 mt-2 opacity-50"><FolderPlus className="w-4 h-4" /><span className="text-xs font-bold uppercase">Create New Box</span></div></div></div>}
                                </div>
                            </div>
                      </NeoCard>
                      <NeoCard className="p-4 bg-neo-black text-white" hoverEffect>
                        <div className="flex items-center gap-2 mb-3 border-b-2 border-white pb-2"><MessageSquare className="w-5 h-5" /><h3 className="font-bold uppercase text-lg">{t.label_phrases}</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {itinerary.localPhrases.map((phrase, i) => (
                                <div key={i} className="bg-zinc-900 px-4 py-3 border-l-4 border-travel-yellow hover:bg-zinc-800 transition-colors">
                                    <div className="flex justify-between items-baseline mb-1"><div className="font-bold text-white text-base">{phrase.original}</div><div className="text-xs text-zinc-400 font-mono italic">/{phrase.pronunciation}/</div></div>
                                    <div className="text-xs font-black text-travel-yellow uppercase tracking-widest">{phrase.translation}</div>
                                </div>
                            ))}
                        </div>
                    </NeoCard>
                    </motion.div>
                 )}

                {activeTab === 'config' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                        <NeoCard className="p-6 md:p-8 bg-white relative">
                            <div className="mb-6 border-b-2 border-neo-black pb-2 flex justify-between items-center relative z-10">
                                <h2 className="text-2xl font-black uppercase tracking-tight">{t.config_title}</h2>
                                <div className="text-xs font-mono text-zinc-500 uppercase font-bold">{t.config_sub}</div>
                            </div>
                            <div className="relative z-10">{renderConfigForm()}</div>
                        </NeoCard>
                    </motion.div>
                )}
            </div>
        </div>
      )}

      <AnimatePresence>
        {timePickerOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setTimePickerOpen(false)}>
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-sm bg-white border-2 border-neo-black shadow-neo-lg overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-neo-black text-white p-4 flex justify-between items-center border-b-2 border-neo-black"><div className="flex items-center gap-2"><Clock className="w-5 h-5 text-travel-yellow" /><span className="font-black uppercase text-lg">Pick Time</span></div><button onClick={() => setTimePickerOpen(false)}><X className="w-5 h-5" /></button></div>
                    <div className="grid grid-cols-4 bg-zinc-100 border-b-2 border-neo-black">
                        {(['Morning', 'Afternoon', 'Evening', 'Night'] as const).map((tab) => (
                            <button key={tab} onClick={() => setTimePickerTab(tab)} className={`py-2 text-[10px] font-bold uppercase transition-colors relative ${timePickerTab === tab ? 'bg-white text-neo-black' : 'text-zinc-400 hover:text-neo-black hover:bg-zinc-200'}`}><span className="relative z-10 flex flex-col items-center gap-1">{tab === 'Morning' && <Sunrise className="w-3 h-3" />}{tab === 'Afternoon' && <Sun className="w-3 h-3" />}{tab === 'Evening' && <Sunset className="w-3 h-3" />}{tab === 'Night' && <Moon className="w-3 h-3" />}{tab}</span>{timePickerTab === tab && ( <motion.div layoutId="activeTimeTab" className="absolute inset-0 border-b-2 border-travel-orange bg-white z-0" /> )}</button>
                        ))}
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar bg-travel-paper">
                        {TIME_SLOTS.filter(slot => getTimeCategory(slot) === timePickerTab).map((slot) => ( <button key={slot} onClick={() => handleTimeSelect(slot)} className="py-2 px-1 border-2 border-neo-black bg-white hover:bg-travel-yellow hover:shadow-neo-sm transition-all font-mono text-xs font-bold active:translate-y-[1px] active:shadow-none">{slot}</button> ))}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBudgetModalOpen && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsBudgetModalOpen(false)}>
              <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                 <NeoCard className="p-0 overflow-hidden shadow-neo-lg bg-travel-paper flex flex-col h-full" noShadow>
                    <div className="bg-travel-teal p-6 border-b-2 border-neo-black flex justify-between items-center shrink-0"><h2 className="text-2xl font-black uppercase flex items-center gap-3"><PieChart className="w-6 h-6" /> {t.budget_breakdown.title}</h2><button onClick={() => setIsBudgetModalOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-8 h-8" /></button></div>
                    <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                        <div className="p-4 bg-white border-2 border-neo-black">
                            <h3 className="font-bold uppercase text-sm mb-2 text-zinc-500">{t.budget_breakdown.notes}</h3>
                            <p className="font-mono text-xs font-bold text-neo-black leading-relaxed">{itinerary.estimatedCost.explanation}</p>
                        </div>
                        <div className="grid gap-3">
                            {budgetItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white border-2 border-neo-black shadow-sm">
                                    <div className="flex items-center gap-3"><div className={`w-8 h-8 ${item.bgClass} flex items-center justify-center border border-neo-black shadow-sm`}><item.icon className={`w-4 h-4 ${item.id === 'flights' ? 'text-white' : 'text-neo-black'}`} /></div><span className="font-bold uppercase text-sm">{item.label}</span></div>
                                    <span className="font-mono font-black">{item.amount}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center p-4 bg-travel-yellow border-2 border-neo-black shadow-neo-sm mt-2"><span className="font-black uppercase text-lg">{t.budget_breakdown.total}</span><span className="font-black text-2xl">{itinerary.estimatedCost.total}</span></div>
                        </div>
                    </div>
                 </NeoCard>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

        <AnimatePresence>
        {isSuggestionsModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <NeoCard className="p-0 overflow-hidden shadow-neo-lg bg-travel-paper flex flex-col" noShadow>
                        <div className="bg-travel-yellow p-6 border-b-2 border-neo-black flex justify-between items-center shrink-0"><div><h2 className="text-2xl font-black uppercase flex items-center gap-3"><Sparkles className="w-6 h-6" /> AI Suggestions</h2><p className="font-mono text-xs font-bold text-zinc-600 mt-1 uppercase">For Day {activeDayIndex !== null ? itinerary?.days[activeDayIndex].day : ''}: {activeDayIndex !== null ? itinerary?.days[activeDayIndex].theme : ''}</p></div><div className="flex items-center gap-2"><button onClick={() => handleAiSuggest(true)} disabled={isSuggesting} className="p-2 border-2 border-neo-black bg-white hover:bg-zinc-100 disabled:opacity-50 transition-all flex items-center justify-center" title="Regenerate"><RefreshCw className={`w-5 h-5 ${isSuggesting ? 'animate-spin' : ''}`} /></button><button onClick={() => setIsSuggestionsModalOpen(false)} className="p-2 border-2 border-neo-black bg-white hover:bg-red-500 hover:text-white transition-all"><X className="w-5 h-5" /></button></div></div>
                        <div className="p-6 overflow-y-auto bg-zinc-50/50">
                            {isSuggesting && suggestedActivities.length === 0 ? ( <div className="flex flex-col items-center justify-center py-12 opacity-50"><Loader2 className="w-8 h-8 animate-spin mb-2" /><span className="font-mono font-bold uppercase">Dreaming up ideas...</span></div> ) : ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{suggestedActivities.map((s, idx) => ( <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} onClick={() => selectSuggestion(s)} className="bg-white border-2 border-neo-black p-4 cursor-pointer hover:-translate-y-1 hover:shadow-neo transition-all group h-full flex flex-col relative overflow-hidden"><div className="flex justify-between items-start mb-3"><div className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{s.emoji}</div><div className="font-mono text-[10px] font-bold bg-travel-teal text-white px-2 py-1 border border-neo-black shadow-sm">{s.cost}</div></div><h3 className="font-black uppercase text-lg leading-tight mb-2 group-hover:text-travel-teal transition-colors">{s.activity}</h3><p className="text-xs text-zinc-600 leading-relaxed font-mono flex-grow border-t border-dashed border-zinc-200 pt-2 mt-1">{s.description}</p><div className="mt-4 pt-2 flex justify-between items-center text-[10px] font-bold uppercase text-zinc-400 group-hover:text-neo-black transition-colors"><span>Click to Select</span><ArrowRight className="w-3 h-3" /></div></motion.div> ))}</div> )}
                        </div>
                    </NeoCard>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

       <AnimatePresence>
        {isPackingSuggestionModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-2xl max-h-[85vh] flex flex-col">
                    <NeoCard className="p-0 overflow-hidden shadow-neo-lg bg-travel-paper flex flex-col" noShadow>
                        <div className="bg-travel-lime p-6 border-b-2 border-neo-black flex justify-between items-center shrink-0"><div><h2 className="text-2xl font-black uppercase flex items-center gap-3"><Sparkles className="w-6 h-6" /> Smart Packing</h2><p className="font-mono text-xs font-bold text-neo-black mt-1 uppercase">Based on {itinerary?.weatherForecast ? 'Weather & ' : ''} Activities</p></div><button onClick={() => setIsPackingSuggestionModalOpen(false)} className="p-2 border-2 border-neo-black bg-white hover:bg-red-500 hover:text-white transition-all"><X className="w-5 h-5" /></button></div>
                        <div className="p-6 overflow-y-auto bg-zinc-50/50">
                             <div className="grid gap-3">
                                {packingSuggestions.length === 0 ? ( <div className="text-center py-8 opacity-50 font-mono uppercase">No specific suggestions found.</div> ) : ( packingSuggestions.map((item, idx) => ( <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => handleAddSuggestedPackingItems(item)} className="bg-white border-2 border-neo-black p-3 flex justify-between items-center cursor-pointer hover:bg-travel-yellow hover:-translate-y-1 hover:shadow-sm transition-all group"><div><div className="flex items-center gap-2"><span className="font-black uppercase text-sm">{item.name}</span><span className="text-[10px] font-mono bg-neo-black text-white px-1.5 py-0.5">{item.category}</span></div><p className="text-xs font-mono text-zinc-500 mt-1 group-hover:text-neo-black">Because: {item.reason}</p></div><div className="p-2 bg-zinc-100 border-2 border-zinc-200 group-hover:border-neo-black group-hover:bg-white transition-colors"><Plus className="w-4 h-4" /></div></motion.div> )) )}
                             </div>
                        </div>
                    </NeoCard>
                </motion.div>
            </motion.div>
        )}
       </AnimatePresence>

       <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neo-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-lg">
                <NeoCard className="p-0 overflow-hidden shadow-neo-lg" noShadow>
                   <div className="bg-travel-teal p-4 border-b-2 border-neo-black flex justify-between items-center"><h3 className="font-black text-xl uppercase">Add Activity - Day {activeDayIndex !== null ? itinerary?.days[activeDayIndex].day : ''}</h3><button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white border-2 border-transparent hover:border-neo-black transition-all"><X className="w-6 h-6" /></button></div>
                   <form onSubmit={handleSaveNewActivity} className="p-6 space-y-4 bg-white relative">
                      <AnimatePresence>
                        {showCostModal && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col p-4 justify-center">
                                <div className="bg-white border-2 border-neo-black p-6 shadow-neo-lg w-full">
                                    <div className="flex justify-between items-center mb-6 border-b-2 border-neo-black pb-2"><h4 className="font-black uppercase text-xl">Set Activity Cost</h4><button type="button" onClick={() => setShowCostModal(false)}><X className="w-6 h-6"/></button></div>
                                    <div className="space-y-6">
                                        <div><label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Manual Amount (IDR)</label><div className="relative"><input type="text" placeholder="Rp 0" className="w-full p-4 border-2 border-neo-black font-black text-2xl focus:outline-none focus:bg-travel-yellow/10 transition-colors" value={newActivityForm.cost} onChange={(e) => { const formatted = formatRupiah(e.target.value); setNewActivityForm({...newActivityForm, cost: formatted}); }} autoFocus />{newActivityForm.cost && ( <button type="button" onClick={() => setNewActivityForm({...newActivityForm, cost: ''})} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"><X className="w-5 h-5" /></button> )}</div><p className="text-[10px] font-mono mt-1 text-zinc-400">* Type numbers to format automatically</p></div>
                                        <div className="pt-4 border-t-2 border-dashed border-zinc-200"><label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Quick Select</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { setNewActivityForm({...newActivityForm, cost: 'Free'}); setShowCostModal(false); }} className="p-2 border-2 border-neo-black font-bold hover:bg-travel-lime transition-colors">Free</button><button type="button" onClick={() => { setNewActivityForm({...newActivityForm, cost: 'Rp 50.000'}); setShowCostModal(false); }} className="p-2 border-2 border-neo-black font-bold hover:bg-travel-yellow transition-colors">Rp 50k</button><button type="button" onClick={() => { setNewActivityForm({...newActivityForm, cost: 'Rp 100.000'}); setShowCostModal(false); }} className="p-2 border-2 border-neo-black font-bold hover:bg-travel-yellow transition-colors">Rp 100k</button><button type="button" onClick={() => { setNewActivityForm({...newActivityForm, cost: 'Rp 200.000'}); setShowCostModal(false); }} className="p-2 border-2 border-neo-black font-bold hover:bg-travel-yellow transition-colors">Rp 200k</button></div></div>
                                        <NeoButton type="button" onClick={() => setShowCostModal(false)} fullWidth variant="primary">Confirm Amount</NeoButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="grid grid-cols-2 gap-4">
                         <div><label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</label><div className="relative"><button type="button" onClick={() => handleOpenTimePicker('new')} className="w-full p-3 border-2 border-neo-black font-mono text-sm bg-white text-neo-black text-left flex justify-between items-center hover:bg-zinc-50 active:translate-y-[1px] transition-all shadow-neo-sm font-bold"><span>{newActivityForm.time}</span><ChevronDown className="w-4 h-4 text-zinc-400" /></button></div></div>
                         <div className="col-span-1"><label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Cost</label><button type="button" onClick={() => setShowCostModal(true)} className="w-full p-3 border-2 border-neo-black font-mono text-sm bg-white text-neo-black text-left flex justify-between items-center hover:bg-zinc-50 active:translate-y-[1px] transition-all shadow-neo-sm font-bold"><span className="truncate">{newActivityForm.cost || 'Free / TBD'}</span><ChevronDown className="w-4 h-4 text-zinc-400" /></button></div>
                      </div>
                      <div><div className="flex justify-between items-center mb-1"><label className="block text-xs font-bold uppercase flex items-center gap-1"><Ticket className="w-3 h-3" /> Activity Name</label><button type="button" onClick={() => handleAiSuggest(false)} disabled={isSuggesting} className="text-[10px] flex items-center gap-1 font-bold uppercase bg-travel-yellow px-2 py-0.5 border border-neo-black hover:bg-yellow-400 transition-colors disabled:opacity-50">{isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}{isSuggesting ? t.btn_suggesting : t.btn_suggest}</button></div><input type="text" placeholder="e.g. Visit the hidden temple" className="w-full p-2 border-2 border-neo-black font-bold text-lg focus:outline-none focus:shadow-neo-sm bg-white text-neo-black" value={newActivityForm.activity} onChange={(e) => setNewActivityForm({...newActivityForm, activity: e.target.value})} required /></div>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-2 relative">
                            <label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                            <div className="relative"><input type="text" ref={locationInputRef} placeholder="Start typing to search..." className="w-full p-2 pr-8 border-2 border-neo-black font-mono text-sm focus:outline-none focus:shadow-neo-sm bg-white text-neo-black" value={newActivityForm.location} onChange={(e) => { setNewActivityForm({...newActivityForm, location: e.target.value}); if(e.target.value.length >= 3) setShowLocationSuggestions(true); else setShowLocationSuggestions(false); }} onFocus={() => { if(locationSuggestions.length > 0) setShowLocationSuggestions(true); }} /><div className="absolute right-2 top-2.5 pointer-events-none text-zinc-400">{isFetchingLocations ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}</div></div>
                            {showLocationSuggestions && locationSuggestions.length > 0 && ( <div className="absolute top-full left-0 w-full bg-white border-2 border-neo-black shadow-neo-sm z-20 max-h-40 overflow-y-auto mt-1">{locationSuggestions.map((loc, idx) => ( <button key={idx} type="button" className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-travel-yellow border-b border-zinc-100 last:border-0 flex items-center gap-2" onClick={() => { setNewActivityForm({...newActivityForm, location: loc}); setShowLocationSuggestions(false); }}><MapPin className="w-3 h-3 text-travel-orange shrink-0" /><span className="truncate">{loc}</span></button> ))} <div className="px-2 py-1 bg-zinc-50 text-[9px] font-bold text-center uppercase text-zinc-400 border-t border-zinc-100">Powered by AI Maps</div></div> )}
                         </div>
                         <div className="relative group">
                            <label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1"><Smile className="w-3 h-3" /> Emoji</label>
                            <div className="relative"><input type="text" readOnly className="w-full p-2 border-2 border-neo-black text-center text-xl focus:outline-none focus:shadow-neo-sm bg-white text-neo-black cursor-pointer" value={newActivityForm.emoji} /><div className="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-neo-black shadow-neo-sm p-2 grid grid-cols-5 gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30">{COMMON_EMOJIS.map(emoji => ( <button key={emoji} type="button" onClick={() => setNewActivityForm({...newActivityForm, emoji})} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 rounded-sm text-lg">{emoji}</button> ))}</div></div>
                         </div>
                      </div>
                      <div><label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Description</label><textarea rows={5} placeholder="Brief details about this activity..." className="w-full p-2 border-2 border-neo-black font-mono text-sm focus:outline-none focus:shadow-neo-sm bg-white text-neo-black resize-y" value={newActivityForm.description} onChange={(e) => setNewActivityForm({...newActivityForm, description: e.target.value})} /></div>
                      <div className="flex gap-3 pt-2"><NeoButton type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} fullWidth>Cancel</NeoButton><NeoButton type="submit" variant="primary" fullWidth>Add Activity</NeoButton></div>
                   </form>
                </NeoCard>
             </motion.div>
          </motion.div>
        )}
       </AnimatePresence>

    </div>
  );
};