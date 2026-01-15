import React, { useState, useEffect } from 'react';
import { NeoButton } from './components/ui/NeoButton';
import { NeoCard } from './components/ui/NeoCard';
import { ItineraryGenerator } from './components/ItineraryGenerator';
import { UserProfileModal } from './components/UserProfileModal';
import { Globe, ArrowRight, Zap, Check, Menu, X, Star, Plane, Sun, Palmtree, Cloud, Car, Map, Ticket, Timer, Camera, Compass, Anchor, Mountain, Tent, Ship, Luggage, Coins, User as UserIcon, LogOut, Lock, Disc, Music, Download, FileText, Printer, Rocket, ScanLine, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, Language } from './utils/translations';
import { User, Itinerary } from './types';

// --- MOCK AUTH COMPONENT ---
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string) => void;
  t: any;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, t }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
        <NeoCard className="p-0 overflow-hidden shadow-neo-lg">
           <div className="bg-travel-lime p-6 border-b-2 border-neo-black">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <Lock className="w-6 h-6" /> {t.auth.modal_title}
              </h2>
           </div>
           <div className="p-8 bg-white space-y-6">
              <div>
                <label className="block font-bold text-sm mb-2 uppercase">Username</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full p-3 border-2 border-neo-black font-mono focus:outline-none focus:shadow-neo-sm bg-white text-neo-black"
                  placeholder="NeoTraveller..."
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-2 uppercase">Password</label>
                <input 
                  type="password" 
                  className="w-full p-3 border-2 border-neo-black font-mono focus:outline-none focus:shadow-neo-sm bg-white text-neo-black"
                  placeholder="••••••••"
                />
              </div>
              <NeoButton onClick={() => onLogin(name || 'Traveller')} fullWidth variant="primary" size="lg">
                 {t.auth.btn_login}
              </NeoButton>
              <button onClick={onClose} className="w-full text-center text-xs font-bold uppercase underline">Cancel</button>
           </div>
        </NeoCard>
      </motion.div>
    </div>
  );
};

// --- MOCK PRICING COMPONENT ---
interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (amount: number) => void;
  t: any;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onBuy, t }) => {
  if (!isOpen) return null;

  const packs = [
    { name: t.credits.pack_1, amount: 10, price: "Rp 45.000", color: "bg-white" },
    { name: t.credits.pack_2, amount: 50, price: "Rp 150.000", color: "bg-travel-teal" },
    { name: t.credits.pack_3, amount: 100, price: "Rp 225.000", color: "bg-travel-orange" },
  ];

  return (
    <div className="fixed inset-0 bg-neo-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl">
        <NeoCard className="p-0 overflow-hidden shadow-neo-lg bg-travel-paper">
            <div className="bg-travel-yellow p-6 border-b-2 border-neo-black flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase flex items-center gap-2">
                <Coins className="w-8 h-8" /> {t.credits.modal_title}
              </h2>
              <button onClick={onClose}><X className="w-8 h-8 hover:rotate-90 transition-transform" /></button>
            </div>
            <div className="p-8">
               <p className="text-center font-mono font-bold text-lg mb-8">{t.credits.modal_sub}</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packs.map((pack, i) => (
                    <NeoCard key={i} className={`p-6 flex flex-col items-center justify-center text-center gap-4 ${pack.color} hover:scale-105 transition-transform`} hoverEffect>
                       <h3 className="font-black text-xl uppercase">{pack.name}</h3>
                       <div className="text-5xl font-black">{pack.amount}</div>
                       <div className="font-mono font-bold text-sm bg-neo-black text-white px-2 py-1">CREDITS</div>
                       <div className="text-2xl font-bold mt-2">{pack.price}</div>
                       <NeoButton onClick={() => onBuy(pack.amount)} fullWidth variant="primary">Buy Now</NeoButton>
                    </NeoCard>
                  ))}
               </div>
            </div>
        </NeoCard>
      </motion.div>
    </div>
  );
};

// --- HERO ANIMATION ---
const HeroAnimation = () => {
  // Symmetrical Sine Wave Path for the plane
  // M-200,500 (Start Left Middle) -> Curve down (C 400,800) -> Curve up (800,200) -> Center (1200,500) -> Smooth Curve (S)
  const flightPath = "M-200,500 C 400,800 800,200 1200,500 S 2000,200 2300,500";
  const roadPath = "M-200,750 C200,700 600,800 900,750 C1200,700 1500,770 2200,730";

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <svg 
        className="w-full h-full" 
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="xMidYMax slice" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === PLANE LAYER === */}
        <path 
          d={flightPath}
          stroke="#1D1D1D" 
          strokeWidth="3" 
          strokeDasharray="20 20" 
          className="opacity-20"
        />

        <g style={{ 
            offsetPath: `path('${flightPath}')`, 
            animation: 'flight 20s linear infinite',
            offsetRotate: 'auto 0deg' 
           } as React.CSSProperties}>
           <foreignObject width="100" height="100" x="-50" y="-50">
              <div className="w-full h-full flex items-center justify-center transform rotate-45">
                 <div className="relative">
                   <Plane className="w-20 h-20 text-neo-black fill-white drop-shadow-neo-sm relative z-10" strokeWidth={2} />
                 </div>
              </div>
           </foreignObject>
        </g>

        {/* === CLOUDS === */}
        <g className="opacity-90">
           {/* Increased container size and centered positioning to avoid clipping */}
           <foreignObject width="400" height="300" x="5%" y="5%">
              <motion.div animate={{ x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="p-4">
                 <Cloud size={120} fill="white" stroke="#1D1D1D" strokeWidth={3} />
              </motion.div>
           </foreignObject>
        </g>
        
        {/* Blue Cloud - significantly increased bounds to prevent clipping during animation */}
        <g className="opacity-70">
           <foreignObject width="800" height="400" x="50%" y="10%">
              <motion.div 
                animate={{ x: [0, -50, 0] }} 
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} 
                className="w-full h-full flex items-center justify-center p-8"
              >
                 <Cloud size={100} fill="#4ECDC4" stroke="#1D1D1D" strokeWidth={3} />
              </motion.div>
           </foreignObject>
        </g>

        {/* === CAR LAYER === */}
        <path 
          d={roadPath}
          stroke="#1D1D1D" 
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        <g style={{ 
            offsetPath: `path('${roadPath}')`, 
            animation: 'flight 18s linear infinite',
            offsetRotate: 'auto 0deg' 
           } as React.CSSProperties}>
           <foreignObject width="150" height="150" x="-75" y="-75">
              <div className="w-full h-full flex items-center justify-center relative">
                 <div className="relative">
                   <Car className="w-24 h-24 text-neo-black fill-travel-orange drop-shadow-neo-sm relative z-10" strokeWidth={2} />
                   
                   {/* Car Exhaust Smoke */}
                   <motion.div 
                      className="absolute top-[60%] -left-4 w-4 h-4 bg-zinc-400 rounded-full border border-neo-black z-0"
                      animate={{ x: [-5, -40], y: [0, -10], opacity: [0.8, 0], scale: [0.5, 2] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                   />
                   <motion.div 
                      className="absolute top-[65%] -left-2 w-3 h-3 bg-zinc-300 rounded-full border border-neo-black z-0"
                      animate={{ x: [-5, -30], y: [0, -5], opacity: [0.8, 0], scale: [0.5, 1.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                   />
                 </div>
              </div>
           </foreignObject>
        </g>
      </svg>
    </div>
  );
};

// --- GLOBAL JOURNEY ANIMATION (Features Section) ---
const FeaturesJourneyAnimation = () => {
  // Symmetrical Sine Wave for Plane
  const loopPath = "M 2200,150 C 1600,50 600,250 -200,150";
  // Wavy Road for Car (Right to Left) - Replaced Straight Line
  const roadPath = "M 2200,500 C 1600,550 800,450 -200,500";

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
      <svg className="w-full h-full" viewBox="0 0 1920 600" preserveAspectRatio="xMidYMax slice">
        {/* Plane Path - Single Path */}
        <path d={loopPath} stroke="#1D1D1D" strokeWidth="3" strokeDasharray="20 20" className="opacity-20" fill="none" />
        
        {/* Plane Object */}
        <g style={{ 
            offsetPath: `path('${loopPath}')`, 
            animation: 'flight 25s linear infinite',
            animationDelay: '0s', 
            offsetRotate: 'auto 0deg' 
           } as React.CSSProperties}>
           <foreignObject width="120" height="120" x="-60" y="-60">
               <div className="w-full h-full flex items-center justify-center transform rotate-45">
                 <div className="relative">
                   <Plane className="w-20 h-20 text-neo-black fill-white drop-shadow-neo-sm relative z-10" strokeWidth={2} />
                 </div>
               </div>
           </foreignObject>
        </g>

        {/* Car Path (Road) - Single Path */}
        <path d={roadPath} stroke="#1D1D1D" strokeWidth="16" strokeLinecap="round" fill="none" />

        {/* Car Object (Driving Left) */}
        <g style={{ 
            offsetPath: `path('${roadPath}')`, 
            animation: 'flight 20s linear infinite',
            animationDelay: '2s',
            offsetRotate: 'auto 180deg' 
           } as React.CSSProperties}>
           <foreignObject width="150" height="150" x="-75" y="-85">
               {/* Car icon faces right by default, path is R->L so tangent is 180. Auto rotates 180. Car faces Left. */}
               <div className="transform scale-x-[-1] w-full h-full flex items-center justify-center relative">
                   <div className="relative">
                       <Car className="w-24 h-24 text-neo-black fill-travel-orange drop-shadow-neo-sm relative z-10" strokeWidth={2} />
                       {/* Car Exhaust Smoke - Rotated logic because of scale-x-[-1] */}
                       <motion.div 
                          className="absolute top-[60%] -left-4 w-4 h-4 bg-zinc-400 rounded-full border border-neo-black z-0"
                          animate={{ x: [-5, -40], y: [0, -10], opacity: [0.8, 0], scale: [0.5, 2] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                       />
                        <motion.div 
                          className="absolute top-[65%] -left-2 w-3 h-3 bg-zinc-300 rounded-full border border-neo-black z-0"
                          animate={{ x: [-5, -30], y: [0, -5], opacity: [0.8, 0], scale: [0.5, 1.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                       />
                   </div>
               </div>
           </foreignObject>
        </g>
      </svg>
    </div>
  );
};

// --- GLOBAL JOURNEY ANIMATION (CTA Section) ---
const CTAJourneyAnimation = () => {
  // Smoother Landing Curve (Less steep drop)
  const landingPath = "M-200,200 C400,200 800,450 1920,450";
  // Wavy Road for Car (Left to Right)
  const carPath = "M-200,500 C 400,580 1400,420 2200,500";
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
      <svg className="w-full h-full" viewBox="0 0 1920 600" preserveAspectRatio="xMidYMax slice">
         {/* Plane Path */}
         <path d={landingPath} stroke="#1D1D1D" strokeWidth="3" strokeDasharray="20 20" className="opacity-20" fill="none" />
         
         {/* Plane Object */}
         <g style={{ 
            offsetPath: `path('${landingPath}')`, 
            animation: 'flight 20s linear infinite',
            animationDelay: '5s',
            offsetRotate: 'auto 0deg'
           } as React.CSSProperties}>
           <foreignObject width="200" height="200" x="-100" y="-100">
               <div className="w-full h-full flex items-center justify-center relative">
                  {/* Rotated 45deg to align Icon (NE) to Path (East) */}
                  <div className="transform rotate-45 relative flex items-center justify-center">
                      <Plane className="w-20 h-20 text-neo-black fill-white drop-shadow-neo-sm relative z-10" strokeWidth={2} />
                  </div>
               </div>
           </foreignObject>
        </g>

        {/* Car Path */}
        <path d={carPath} stroke="#1D1D1D" strokeWidth="16" strokeLinecap="round" fill="none" />

        {/* Car Object */}
        <g style={{ 
            offsetPath: `path('${carPath}')`, 
            animation: 'flight 15s linear infinite',
            animationDelay: '0s',
            offsetRotate: 'auto 0deg'
           } as React.CSSProperties}>
           <foreignObject width="150" height="150" x="-75" y="-85">
               <div className="w-full h-full flex items-center justify-center relative">
                   <div className="relative">
                        <Car className="w-24 h-24 text-neo-black fill-travel-orange drop-shadow-neo-sm relative z-10" strokeWidth={2} />
                        {/* Car Exhaust Smoke */}
                        <motion.div 
                          className="absolute top-[60%] -left-4 w-4 h-4 bg-zinc-400 rounded-full border border-neo-black z-0"
                          animate={{ x: [-5, -40], y: [0, -10], opacity: [0.8, 0], scale: [0.5, 2] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                       />
                        <motion.div 
                          className="absolute top-[65%] -left-2 w-3 h-3 bg-zinc-300 rounded-full border border-neo-black z-0"
                          animate={{ x: [-5, -30], y: [0, -5], opacity: [0.8, 0], scale: [0.5, 1.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                       />
                   </div>
               </div>
           </foreignObject>
        </g>
      </svg>
    </div>
  );
}

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('id'); 
  
  // --- AUTH & CREDITS STATE ---
  const [user, setUser] = useState<User>({
    isLoggedIn: false,
    name: '',
    email: '',
    credits: 0
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loadedItinerary, setLoadedItinerary] = useState<Itinerary | null>(null);

  // Load user from local storage (mock persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('vagabond_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user.isLoggedIn) {
        localStorage.setItem('vagabond_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('vagabond_user');
    }
  }, [user]);

  const handleLogin = (name: string) => {
    setUser({
        isLoggedIn: true,
        name: name,
        email: `${name.toLowerCase()}@example.com`,
        credits: 10 // Free starter credits
    });
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false, name: '', email: '', credits: 0 });
    setIsProfileModalOpen(false);
    setView('landing');
  };

  const handleBuyCredits = (amount: number) => {
    setUser(prev => ({ ...prev, credits: prev.credits + amount }));
    setIsPricingModalOpen(false);
  };

  const handleDeductCredits = (amount: number) => {
    if (user.credits >= amount) {
        setUser(prev => ({ ...prev, credits: prev.credits - amount }));
        return true;
    }
    return false;
  };

  const handleLoadTrip = (trip: Itinerary) => {
    setLoadedItinerary(trip);
    setIsProfileModalOpen(false);
    setView('app');
    window.scrollTo(0, 0);
  };

  const toggleView = () => {
    setView(prev => prev === 'landing' ? 'app' : 'landing');
    window.scrollTo(0, 0);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  // --- NAVIGATION HELPER ---
  const scrollToSection = (id: string) => {
    if (view !== 'landing') {
        setView('landing');
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setIsMenuOpen(false);
  };

  const t = translations[language];

  return (
    <div className="min-h-screen text-neo-black font-sans selection:bg-travel-teal selection:text-white overflow-x-hidden bg-travel-paper">
      
      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} t={t} />
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} onBuy={handleBuyCredits} t={t} />
      
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user} 
        onLogout={handleLogout}
        onOpenPricing={() => { setIsProfileModalOpen(false); setIsPricingModalOpen(true); }}
        onLoadTrip={handleLoadTrip}
        language={language}
        t={t}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-neo-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-travel-orange text-neo-black flex items-center justify-center font-black text-xl border-2 border-neo-black hover:bg-travel-teal hover:text-white transition-colors shadow-neo-sm">V</div>
            <span className="font-bold text-xl tracking-tighter uppercase">Vagabond</span>
          </div>

          <div className="hidden md:flex items-center gap-4 font-mono text-sm font-bold">
            <button onClick={() => scrollToSection('features')} className="hover:text-travel-orange transition-colors hidden lg:block">{t.nav.features}</button>
            
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 border-2 border-neo-black bg-travel-paper hover:bg-white transition-colors shadow-neo-sm active:shadow-none active:translate-y-0.5 mr-2"
            >
              <span className={language === 'en' ? 'opacity-100 font-bold' : 'opacity-40'}>EN</span>
              <span className="opacity-40">|</span>
              <span className={language === 'id' ? 'opacity-100 font-bold' : 'opacity-40'}>ID</span>
            </button>

            {/* Auth Section in Nav */}
            {user.isLoggedIn ? (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neo-black text-white border-2 border-neo-black shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all group"
                    >
                        <div className="flex items-center gap-1 text-travel-yellow">
                           <Coins className="w-4 h-4" /> 
                           <span>{user.credits}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-zinc-600"></div>
                        <div className="flex items-center gap-1">
                           <UserIcon className="w-4 h-4" />
                           <span className="text-xs uppercase hidden lg:inline max-w-[80px] truncate">{user.name}</span>
                        </div>
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-1.5 font-bold uppercase border-2 border-neo-black hover:bg-zinc-100 transition-colors"
                >
                    <UserIcon className="w-4 h-4" /> {t.auth.login}
                </button>
            )}

            <NeoButton size="sm" onClick={toggleView} variant="accent" className="ml-2">
              {view === 'landing' ? t.nav.launch : t.nav.home}
            </NeoButton>
          </div>

          <div className="flex items-center gap-4 md:hidden">
             {user.isLoggedIn && (
                 <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-neo-black text-travel-yellow text-xs font-bold border-2 border-neo-black"
                >
                    <Coins className="w-3 h-3" /> {user.credits}
                </button>
             )}
            <button className="p-2 border-2 border-neo-black active:bg-zinc-100" onClick={() => setIsMenuOpen(true)}>
              <Menu />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neo-black/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Side Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white border-l-2 border-neo-black z-[70] shadow-neo-lg md:hidden flex flex-col"
            >
              <div className="p-4 border-b-2 border-neo-black bg-travel-yellow flex justify-between items-center">
                  <span className="font-black text-xl uppercase">Menu</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-1 border-2 border-neo-black bg-white hover:bg-zinc-100">
                      <X className="w-6 h-6" />
                  </button>
              </div>

              <div className="flex flex-col p-6 gap-6 font-bold font-mono uppercase text-lg overflow-y-auto">
                  {!user.isLoggedIn ? (
                        <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="text-left border-b-2 border-neo-black pb-2 flex items-center gap-2">
                          <UserIcon className="w-6 h-6" /> {t.auth.login}
                        </button>
                  ) : (
                      <div className="border-b-2 border-neo-black pb-4">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-8 h-8 bg-neo-black text-white flex items-center justify-center rounded-full"><UserIcon className="w-4 h-4"/></div>
                             <div className="text-sm text-zinc-500">{user.name}</div>
                          </div>
                          
                          <button onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left bg-zinc-100 p-2 text-sm border-2 border-transparent hover:border-neo-black mb-2">
                              My Profile
                          </button>

                          <button onClick={() => { setIsPricingModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 text-travel-orange">
                              <Coins className="w-6 h-6" /> {t.credits.buy}
                          </button>
                      </div>
                  )}
                  
                  <button onClick={() => scrollToSection('features')} className="text-left border-b-2 border-neo-black pb-2 hover:text-travel-orange transition-colors">{t.nav.features}</button>
                  
                  {user.isLoggedIn && (
                        <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-500 pb-2 flex items-center gap-2 hover:bg-red-50">
                          <LogOut className="w-6 h-6" /> {t.auth.logout}
                        </button>
                  )}

                  <div className="mt-4">
                    <NeoButton onClick={() => { toggleView(); setIsMenuOpen(false); }} fullWidth>
                      {view === 'landing' ? t.nav.launch : t.nav.home}
                    </NeoButton>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {view === 'landing' ? (
          <>
            {/* Hero Section */}
            <section className="relative border-b-2 border-neo-black bg-travel-paper overflow-hidden min-h-[90vh] flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ 
                     backgroundImage: 'radial-gradient(#FFB347 1.5px, transparent 1.5px)',
                     backgroundSize: '30px 30px'
                   }} 
              />
              
              <HeroAnimation />

              {/* Holiday Floating Animations */}
              <motion.div 
                className="absolute top-8 right-8 text-travel-yellow opacity-100 pointer-events-none z-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                {/* Moved Sun higher up to avoid blocking plane path */}
                <Sun size={80} fill="#FCEE8C" strokeWidth={2} className="text-travel-orange md:w-32 md:h-32" />
              </motion.div>
              
              <motion.div 
                className="absolute bottom-[20%] left-[8%] text-travel-lime opacity-100 pointer-events-none z-0"
                animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                 <Palmtree size={100} fill="#C7F464" strokeWidth={2} className="text-neo-black md:w-32 md:h-32" />
              </motion.div>

              <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-20 w-full">
                <div className="max-w-5xl mx-auto text-center md:text-left">
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                     {/* Badge */}
                     <div className="inline-block bg-neo-black px-4 py-1 border-2 border-neo-black font-mono font-bold uppercase mb-4 shadow-neo-sm transform -rotate-2 text-white hover:scale-105 transition-transform">
                        AI Travel Architect
                     </div>
                     <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-8 uppercase drop-shadow-sm">
                      {t.hero.title_start} <br/>
                      <span 
                        className="text-transparent bg-clip-text bg-gradient-to-r from-travel-orange via-travel-teal to-travel-lime animate-gradient-x"
                        style={{ WebkitTextStroke: '3px #1D1D1D', paintOrder: 'stroke fill' }}
                      >
                        {t.hero.title_end}
                      </span>
                    </h1>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative inline-block text-left"
                  >
                     <p className="text-xl md:text-2xl font-mono text-neo-black font-bold mb-10 max-w-2xl border-2 border-neo-black bg-white/80 backdrop-blur-sm p-6 shadow-neo-sm z-10 relative">
                      {t.hero.subtitle}
                    </p>
                  </motion.div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <NeoButton size="lg" variant="accent" onClick={toggleView} className="text-xl px-10 py-6 text-neo-black">
                      {t.hero.cta_start} <ArrowRight className="w-6 h-6" />
                    </NeoButton>
                    <NeoButton size="lg" variant="secondary" className="text-xl px-10 py-6">
                      {t.hero.cta_demo}
                    </NeoButton>
                  </div>
                </div>
              </div>

              {/* Infinite Marquee */}
              <div className="absolute bottom-0 left-0 right-0 border-t-2 border-neo-black bg-travel-yellow overflow-hidden py-4 z-20">
                <div className="flex animate-marquee whitespace-nowrap font-mono font-bold text-xl">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="mx-8 uppercase flex items-center gap-2">
                      <Star className="w-6 h-6 fill-black" /> {t.marquee}
                      <span className="opacity-30">•</span> 
                      Bali
                      <span className="opacity-30">•</span> 
                      Paris
                      <span className="opacity-30">•</span> 
                      Raja Ampat
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Redesigned Features Section with Global Animation Loop */}
            <section id="features" className="py-24 bg-travel-paper border-b-2 border-neo-black relative overflow-hidden">
               {/* Scattered Travel Icons - Moved to SAFE corners (Top-Left and Middle-Right) */}
               <motion.div 
                  className="absolute top-12 left-12 text-neo-black pointer-events-none z-0"
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
               >
                 <Camera size={120} strokeWidth={1.5} className="fill-travel-teal" />
               </motion.div>
               
               {/* Replaced Compass with Map and moved to Middle-Right to avoid path overlap */}
               <motion.div 
                  className="absolute top-1/2 right-10 text-neo-black pointer-events-none z-0 transform -translate-y-1/2"
                  animate={{ rotate: [0, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity }}
               >
                 <Map size={120} strokeWidth={1.5} className="fill-travel-orange" />
               </motion.div>

               {/* Flying Plane & Car Looping Back */}
               <FeaturesJourneyAnimation />

               {/* Vibrant Background Pattern */}
               <div className="absolute inset-0 opacity-5 pointer-events-none" 
                   style={{ 
                     backgroundImage: 'radial-gradient(#1D1D1D 1px, transparent 1px)',
                     backgroundSize: '20px 20px'
                   }} 
              />

              <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 pl-4 md:pl-8">
                <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6 border-b-4 border-neo-black pb-6">
                   <div>
                     <div className="inline-block px-4 py-1 bg-neo-black text-white font-mono font-bold uppercase mb-2 border-2 border-white transform rotate-1">
                        No More Boring Trips
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-neo-black leading-none drop-shadow-sm">
                       {t.features.title}
                     </h2>
                   </div>
                </div>
                
                {/* Denser Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Instant AI (Redesigned with Rocket) */}
                  <NeoCard className="bg-white p-6 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden group" hoverEffect>
                    {/* Background Speed Lines */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                             <motion.div
                                key={i}
                                className="h-[4px] bg-neo-black absolute"
                                style={{ top: `${i * 15}%`, width: '100%', left: '100%' }}
                                animate={{ x: ["-200%"] }}
                                transition={{ duration: 0.8 + (Math.random() * 0.5), repeat: Infinity, ease: "linear", delay: i * 0.1 }}
                             />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            {/* Changed bg-travel-orange to bg-neo-black to match other cards */}
                            <div className="w-16 h-16 bg-neo-black border-2 border-neo-black flex items-center justify-center shadow-neo-sm relative overflow-hidden">
                                {/* Rocket Animation */}
                                <motion.div
                                    className="relative z-20"
                                    animate={{ y: [0, -3, 0], x: [0, 1, -1, 0] }}
                                    transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
                                >
                                    {/* Changed icon colors to pop against black background */}
                                    <Rocket className="w-8 h-8 text-travel-yellow fill-neo-black" />
                                </motion.div>
                                
                                {/* Thrust Effect */}
                                <motion.div
                                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-6 bg-travel-orange rounded-full blur-[2px] z-10"
                                    animate={{ height: [10, 20, 10], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 0.1, repeat: Infinity }}
                                />

                                {/* Moving Background inside Icon */}
                                <motion.div
                                    className="absolute inset-0 bg-white/10 z-0"
                                    animate={{ y: ["100%", "-100%"] }}
                                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                                    style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.3) 50%)', backgroundSize: '100% 10px' }}
                                />
                            </div>
                            <div className="flex flex-col items-end">
                                <motion.span 
                                    className="font-mono text-sm font-black border-2 border-neo-black px-2 py-1 bg-travel-lime transform rotate-2"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.2, repeat: Infinity }}
                                >
                                    0.5s
                                </motion.span>
                                <span className="text-[10px] font-bold uppercase mt-1 bg-neo-black text-white px-1">Turbo Mode</span>
                            </div>
                        </div>

                        <h3 className="text-4xl font-black uppercase leading-[0.9] mb-3">{t.features.card1_title}</h3>
                        <p className="font-mono text-sm font-bold text-zinc-600 leading-tight mb-4">
                            {t.features.card1_desc}
                        </p>

                        {/* Speedometer Graphic */}
                        <div className="mt-auto relative w-full h-32 flex items-end justify-center overflow-hidden">
                             {/* Arch */}
                             <div className="w-56 h-28 border-[8px] border-neo-black rounded-t-full relative box-border bg-white z-10 flex items-end justify-center overflow-hidden shadow-sm">
                                <div className="absolute inset-0 border-b-2 border-zinc-200"></div>
                                {/* Ticks */}
                                {[0, 45, 90, 135, 180].map(deg => (
                                    <div key={deg} className="absolute bottom-0 w-full h-1 bg-transparent" style={{ transform: `rotate(${deg}deg)`, transformOrigin: 'bottom center' }}>
                                       <div className="w-1 h-3 bg-neo-black absolute top-0 left-1/2 -translate-x-1/2"></div>
                                    </div>
                                ))}
                                 {/* Inner colored arc */}
                                 <div className="absolute bottom-0 w-full h-full rounded-t-full opacity-20 bg-gradient-to-r from-travel-teal via-travel-yellow to-red-500"></div>
                             </div>
                             
                             {/* Needle */}
                             <motion.div 
                                className="absolute bottom-0 left-1/2 w-2 h-24 bg-neo-black origin-bottom z-20"
                                style={{ x: '-50%' }}
                                animate={{ rotate: [-80, 80, 60, 80, -80] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "circInOut" }}
                             >
                                <div className="w-full h-full bg-red-500 border-2 border-neo-black"></div>
                             </motion.div>
                             
                             {/* Center Cap */}
                             <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-neo-black rounded-full z-30 border-4 border-white"></div>
                        </div>
                    </div>
                  </NeoCard>

                  {/* Card 2: Global Radar */}
                  <NeoCard className="bg-travel-teal p-0 relative overflow-hidden h-full min-h-[300px] group" hoverEffect>
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                    {/* Radar Sweep Effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-[300px] h-[300px] border-2 border-neo-black/20 rounded-full absolute"></div>
                         <div className="w-[200px] h-[200px] border-2 border-neo-black/20 rounded-full absolute"></div>
                         <div className="w-[100px] h-[100px] border-2 border-neo-black/20 rounded-full absolute"></div>
                         <motion.div 
                            className="w-[150px] h-[150px] bg-gradient-to-t from-white/30 to-transparent absolute top-1/2 left-1/2 origin-top-left"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         />
                    </div>
                    
                    <div className="p-6 h-full flex flex-col relative z-10 justify-between">
                       <div className="flex justify-between items-start mb-4">
                          <div className="bg-neo-black text-white p-2 border-2 border-white shadow-neo-sm">
                             <Globe className="w-8 h-8 animate-pulse" />
                          </div>
                          <div className="bg-white border-2 border-neo-black px-2 py-1 font-black text-xs uppercase transform rotate-3">
                             190+ Countries
                          </div>
                       </div>
                       <div>
                          <h3 className="text-4xl font-black uppercase leading-none mb-2 text-white drop-shadow-md" style={{ WebkitTextStroke: '1px #1D1D1D' }}>{t.features.card2_title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                              {t.features.card2_items.slice(0,3).map((item, i) => (
                                <span key={i} className="bg-white border-2 border-neo-black px-2 py-1 text-[10px] font-bold uppercase">{item}</span>
                              ))}
                          </div>
                       </div>
                    </div>
                  </NeoCard>

                  {/* Card 3: Vibe Match */}
                  <NeoCard className="bg-travel-orange p-6 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden" hoverEffect>
                     <div className="absolute -right-10 -bottom-10 opacity-20">
                        <Music size={150} />
                     </div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <motion.div 
                                className="w-12 h-12 bg-neo-black rounded-full flex items-center justify-center border-2 border-white shadow-neo-sm"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            >
                                <Disc className="w-6 h-6 text-travel-lime" />
                            </motion.div>
                            <span className="font-mono text-xs font-bold border-2 border-neo-black px-2 py-1 bg-white transform -rotate-2">Curated</span>
                        </div>
                        <h3 className="text-4xl font-black uppercase leading-none mb-2">{t.features.card3_title}</h3>
                        <p className="font-mono text-sm font-bold text-neo-black leading-tight bg-white/50 p-2 border-2 border-neo-black/10">
                           {t.features.card3_desc}
                        </p>
                     </div>
                     
                     {/* Equalizer Bar Animation */}
                     <div className="flex items-end justify-between h-12 gap-1 mt-4">
                        {[1,2,3,4,5,6].map(i => (
                            <motion.div 
                                key={i}
                                className="w-full bg-neo-black border-2 border-white"
                                animate={{ height: ["20%", "80%", "40%", "100%", "30%"] }}
                                transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror", delay: i * 0.1 }}
                            />
                        ))}
                     </div>
                  </NeoCard>

                  {/* Card 4: Instant Export (Redesigned with Scanner) */}
                  <NeoCard className="bg-neo-black text-white p-0 flex flex-col h-full min-h-[300px] relative overflow-hidden group" hoverEffect>
                     <div className="p-6 h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-8">
                             {/* Scanner Icon Animation */}
                            <div className="relative w-14 h-14 bg-zinc-800 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden">
                                <FileCheck className="w-6 h-6 text-white relative z-10" />
                                {/* Scanning Line */}
                                <motion.div
                                    className="absolute left-0 w-full h-1 bg-travel-yellow z-20 shadow-[0_0_10px_#FCEE8C]"
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                {/* Grid Background */}
                                <div className="absolute inset-0 opacity-20" 
                                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '4px 4px' }} 
                                />
                            </div>

                             {/* Pulsing PDF Badge */}
                            <motion.div 
                                className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <span className="font-black text-[8px]">PDF</span>
                            </motion.div>
                        </div>
                        
                        <div className="mt-auto relative">
                             {/* Paper Sliding Animation */}
                             <motion.div 
                                className="bg-white text-neo-black p-3 border-2 border-zinc-400 absolute bottom-full left-0 right-0 mb-[-10px] mx-4 z-0"
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                             >
                                 <div className="h-1 w-full bg-zinc-200 mb-1"></div>
                                 <div className="h-1 w-2/3 bg-zinc-200 mb-1"></div>
                                 <div className="h-1 w-1/2 bg-zinc-200"></div>
                             </motion.div>

                             {/* Front Plate */}
                             <div className="bg-zinc-800 border-t-4 border-travel-yellow p-4 relative z-10">
                                <h3 className="text-2xl font-black uppercase leading-none mb-1">{t.features.card4_title}</h3>
                                <div className="flex items-center gap-2 text-travel-yellow font-mono text-xs">
                                    <ScanLine className="w-3 h-3 animate-pulse" />
                                    {t.features.card4_btn}
                                </div>
                             </div>
                        </div>
                     </div>
                  </NeoCard>

                </div>
              </div>
            </section>
            
            {/* CTA Section - Background matches Hero (Travel Paper) */}
            <section className="py-32 bg-travel-paper border-b-2 border-neo-black text-center px-4 relative overflow-hidden">
               {/* Scenic Icons - Moved before animation and opaque */}
               <motion.div 
                 className="absolute top-12 left-12 text-neo-black hidden md:block z-0"
                 animate={{ y: [0, 10, 0] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               >
                   <Luggage size={140} fill="#C7F464" strokeWidth={1.5} />
               </motion.div>

               {/* Plane & Car arriving */}
               <CTAJourneyAnimation />
               
               <div className="max-w-4xl mx-auto bg-travel-orange border-2 border-neo-black p-12 shadow-neo-lg relative z-10 transform rotate-1">
                  <h2 className="text-5xl md:text-7xl font-black uppercase mb-8 leading-[0.9] whitespace-pre-line text-neo-black">
                    {t.cta.title}
                  </h2>
                  <NeoButton size="lg" variant="primary" onClick={toggleView} className="mx-auto text-2xl py-6 px-12 shadow-neo relative z-10">
                    {t.cta.btn}
                  </NeoButton>
               </div>
            </section>
          </>
        ) : (
          <div className="min-h-screen bg-travel-paper pb-20 relative overflow-hidden">
             
             {/* Background Icons & Pattern for App View */}
             <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-5" 
                   style={{ 
                     backgroundImage: 'radial-gradient(#1D1D1D 1px, transparent 1px)',
                     backgroundSize: '30px 30px'
                   }} 
                />
                <motion.div 
                    className="absolute top-32 left-10 text-neo-black opacity-5"
                    animate={{ rotate: [0, 10, 0], y: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Compass size={240} strokeWidth={1.5} />
                </motion.div>
                <motion.div 
                    className="absolute top-1/2 right-0 text-neo-black opacity-5"
                    animate={{ rotate: [0, -10, 0], x: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Map size={300} strokeWidth={1} />
                </motion.div>
                <motion.div 
                    className="absolute bottom-20 left-20 text-neo-black opacity-5"
                    animate={{ rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Luggage size={180} strokeWidth={1.5} />
                </motion.div>
             </div>

             {/* Redesigned Header - INCREASED BOTTOM PADDING TO PREVENT OVERLAP */}
             <div className="bg-travel-orange text-neo-black pt-24 pb-32 px-4 md:px-8 border-b-2 border-neo-black relative overflow-hidden">
                
                {/* Stripe Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ 
                        backgroundImage: 'linear-gradient(45deg, #1D1D1D 25%, transparent 25%, transparent 50%, #1D1D1D 50%, #1D1D1D 75%, transparent 75%, transparent)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Decorative header elements */}
                <div className="absolute top-[-50px] right-[-50px] opacity-10 transform rotate-12 pointer-events-none">
                    <Plane size={400} strokeWidth={1} />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-3 bg-travel-yellow border-t-2 border-neo-black" />

                <div className="max-w-7xl mx-auto relative z-10">
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
                   >
                     <div>
                       <div className="inline-block bg-neo-black text-white px-3 py-1 font-mono text-sm font-bold uppercase mb-4 transform -rotate-1 border-2 border-white shadow-neo-sm">
                          {t.generator.header_sub}
                       </div>
                       <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter drop-shadow-sm">
                          {t.generator.header_title.split(' ')[0]}
                          <span 
                            className="block md:inline md:ml-4 text-transparent bg-clip-text bg-white"
                            style={{ WebkitTextStroke: '2px #1D1D1D' }}
                          >
                            {t.generator.header_title.split(' ').slice(1).join(' ')}
                          </span>
                       </h1>
                     </div>
                     
                     <div className="hidden md:block mb-2">
                        <div className="flex gap-2">
                           <div className="w-4 h-4 bg-neo-black rounded-full animate-bounce" style={{ animationDelay: '0s'}}></div>
                           <div className="w-4 h-4 bg-white border-2 border-neo-black rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                           <div className="w-4 h-4 bg-travel-teal border-2 border-neo-black rounded-full animate-bounce" style={{ animationDelay: '0.4s'}}></div>
                        </div>
                     </div>
                   </motion.div>
                </div>
             </div>

             <div className="-mt-12 relative z-20">
               <ItineraryGenerator 
                  language={language} 
                  user={user}
                  onDeductCredits={handleDeductCredits}
                  onRequireLogin={() => setIsLoginModalOpen(true)}
                  onRequireCredits={() => setIsPricingModalOpen(true)}
                  loadedItinerary={loadedItinerary}
               />
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 md:px-8 border-b-2 border-neo-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="font-black text-2xl uppercase mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-travel-orange text-neo-black flex items-center justify-center border-2 border-neo-black">V</div>
                Vagabond
            </div>
            <p className="font-mono text-sm text-zinc-600 font-bold max-w-xs leading-relaxed">
              {t.footer.desc} 
              <br/>© 2024 Vagabond Inc.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 font-mono text-sm">
            <div className="flex flex-col gap-3">
              <span className="font-black uppercase text-lg border-b-2 border-neo-black pb-1 mb-2 inline-block w-full">{t.footer.product}</span>
              <button onClick={() => scrollToSection('features')} className="text-left hover:text-travel-teal font-bold hover:translate-x-1 transition-transform">{t.footer.links.features}</button>
              <button onClick={() => window.scrollTo(0,0)} className="text-left hover:text-travel-teal font-bold hover:translate-x-1 transition-transform">{t.footer.links.api}</button>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-black uppercase text-lg border-b-2 border-neo-black pb-1 mb-2 inline-block w-full">{t.footer.legal}</span>
              <button onClick={() => window.scrollTo(0,0)} className="text-left hover:text-travel-teal font-bold hover:translate-x-1 transition-transform">{t.footer.links.privacy}</button>
              <button onClick={() => window.scrollTo(0,0)} className="text-left hover:text-travel-teal font-bold hover:translate-x-1 transition-transform">{t.footer.links.terms}</button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
        }
        @keyframes flight {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .animate-flight {
          offset-rotate: auto;
        }
      `}</style>
    </div>
  );
};

export default App;