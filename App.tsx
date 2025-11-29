import React, { useState, useEffect } from 'react';
import TripForm from './components/TripForm';
import ItineraryView from './components/ItineraryView';
import Globe3D from './components/Globe3D';
import { generateTravelPlan, generateDestinationImage, getGroundingData } from './services/geminiService';
import { TravelFormData, TravelPlan, GroundingData } from './types';

// Mock Data for Landing Page
const POPULAR_DESTINATIONS = [
  { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681, img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80" },
  { name: "Santorini, Greece", lat: 36.3932, lng: 25.4615, img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80" },
  { name: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426, img: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=600&q=80" },
  { name: "Machu Picchu, Peru", lat: -13.1631, lng: -72.5450, img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80" },
  { name: "Cape Town, SA", lat: -33.9249, lng: 18.4241, img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e27?auto=format&fit=crop&w=600&q=80" },
  { name: "New York, USA", lat: 40.7128, lng: -74.0060, img: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?auto=format&fit=crop&w=600&q=80" }
];

function App() {
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [groundingData, setGroundingData] = useState<GroundingData>({ places: [], searchTips: [] });
  const [destinationImage, setDestinationImage] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedTripAvailable, setSavedTripAvailable] = useState(false);

  useEffect(() => {
    const checkSaved = () => {
         setSavedTripAvailable(!!localStorage.getItem('gemini_travel_offline_plan'));
    };
    checkSaved();
    window.addEventListener('storage', checkSaved);
    return () => window.removeEventListener('storage', checkSaved);
  }, [plan]);

  const handleFormSubmit = async (data: TravelFormData) => {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    setDestinationImage(null);
    setDestinationName(data.destination);

    try {
      // Step 1: Generate the core plan
      const generatedPlan = await generateTravelPlan(data);
      setPlan(generatedPlan);

      // Step 2: Parallel requests
      const [img, ground] = await Promise.all([
        generateDestinationImage(data.destination),
        getGroundingData(data.destination)
      ]);
      
      setDestinationImage(img);
      setGroundingData(ground);
      
      // Scroll to top
      window.scrollTo(0, 0);

    } catch (err) {
      console.error(err);
      setError("Something went wrong while planning your trip. Please try again. " + (err instanceof Error ? err.message : ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!destinationName) return;
    setIsImageLoading(true);
    try {
        const img = await generateDestinationImage(destinationName);
        if (img) setDestinationImage(img);
    } catch (e) {
        console.error("Failed to regenerate image", e);
    } finally {
        setIsImageLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setDestinationImage(null);
    setDestinationName("");
    setGroundingData({ places: [], searchTips: [] });
    window.scrollTo(0, 0);
  };

  const loadSavedTrip = () => {
      try {
        const saved = localStorage.getItem('gemini_travel_offline_plan');
        if (saved) {
            const parsed = JSON.parse(saved);
            setPlan(parsed.plan);
            setGroundingData(parsed.groundingData);
            setDestinationImage(parsed.destinationImage);
            setDestinationName(parsed.destinationName);
            window.scrollTo(0,0);
        }
      } catch (e) {
          console.error("Load failed", e);
          setError("Could not load saved trip.");
      }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/50 transition-all">G</div>
            <span className="font-bold text-2xl tracking-tight text-white font-[Space_Grotesk]">GlobeTrotter</span>
          </div>
          <div className="flex items-center gap-6">
             <button onClick={handleReset} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</button>
             {savedTripAvailable && (
               <button onClick={loadSavedTrip} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">Saved Trip</button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        
        {/* Landing Page State */}
        {!plan && !isLoading && (
            <>
                {/* Hero Section */}
                <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                    <Globe3D markers={POPULAR_DESTINATIONS} />
                    
                    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-[-50px] pointer-events-none">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium animate-fade-in-up">
                            ✨ AI-Powered Travel Architecture
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight tracking-tight animate-fade-in-up delay-100 drop-shadow-2xl">
                            Explore the <br />
                            <span className="text-gradient">Uncharted</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200 drop-shadow-md">
                            GlobeTrotter uses advanced Gemini AI to craft hyper-personalized itineraries, from hidden gems to logistics.
                        </p>
                        <div className="animate-fade-in-up delay-300 pointer-events-auto">
                            <button 
                                onClick={() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
                            >
                                Start Your Journey
                            </button>
                        </div>
                    </div>
                    
                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 pointer-events-none">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" /></svg>
                    </div>
                </section>

                {/* Popular Destinations Marquee */}
                <section className="py-20 border-t border-white/5 bg-[#0f172a]">
                    <div className="max-w-7xl mx-auto px-4 mb-10">
                        <h2 className="text-3xl font-bold text-white">Trending Now</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 px-4 max-w-7xl mx-auto no-scrollbar snap-x">
                        {POPULAR_DESTINATIONS.map((dest, i) => (
                            <div key={i} className="flex-shrink-0 w-80 h-96 relative rounded-2xl overflow-hidden group snap-center cursor-pointer">
                                <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                                    <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features / Why Choose Us */}
                <section className="py-24 bg-slate-900/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12 relative z-10">
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-3xl mb-6">🧠</div>
                            <h3 className="text-xl font-bold text-white mb-3">Deep Intelligence</h3>
                            <p className="text-slate-400 leading-relaxed">Powered by Gemini 3 Pro, we analyze millions of data points to find routes and spots human agents might miss.</p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center text-3xl mb-6">⚡</div>
                            <h3 className="text-xl font-bold text-white mb-3">Live Grounding</h3>
                            <p className="text-slate-400 leading-relaxed">Real-time data connection ensures attractions are open, prices are accurate, and weather is forecasted.</p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center text-3xl mb-6">🌍</div>
                            <h3 className="text-xl font-bold text-white mb-3">Visual Discovery</h3>
                            <p className="text-slate-400 leading-relaxed">Interactive maps, generated preview imagery, and localized pricing make planning feel real.</p>
                        </div>
                    </div>
                </section>
                
                {/* Form Section */}
                <section id="planner" className="py-24 px-4 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Where to next?</h2>
                        <p className="text-slate-400 text-lg">Tell us your dreams, we handle the logistics.</p>
                    </div>
                    <TripForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                </section>
            </>
        )}

        {/* Loading / Error States */}
        {isLoading && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                 <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">Crafting your itinerary...</h2>
                 <p className="text-slate-400 max-w-md">Gemini is analyzing routes, checking weather patterns, and finding the best local spots for {destinationName}.</p>
            </div>
        )}

        {error && (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-4">
                <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h3 className="font-bold text-lg">Planning Error</h3>
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="mt-2 text-sm underline hover:text-white">Try Again</button>
                </div>
            </div>
        )}

        {/* Plan View */}
        {plan && !isLoading && (
            <div className="px-4 pb-20 pt-10">
                <ItineraryView 
                    plan={plan} 
                    groundingData={groundingData} 
                    destinationImage={destinationImage} 
                    destinationName={destinationName}
                    onReset={handleReset}
                    onRegenerateImage={handleRegenerateImage}
                    isImageLoading={isImageLoading}
                />
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0b1120] py-12 text-center text-slate-500 text-sm">
        <p>© 2024 GlobeTrotter AI. All rights reserved.</p>
        <p className="mt-2">Built with Gemini 2.5 & React Three Fiber.</p>
      </footer>
    </div>
  );
}

export default App;