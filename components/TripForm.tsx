import React, { useState } from 'react';
import { TravelFormData } from '../types';

interface Props {
  onSubmit: (data: TravelFormData) => void;
  isLoading: boolean;
}

const TripForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TravelFormData>({
    startLocation: '',
    destination: '',
    days: 5,
    budget: 'Mid-range',
    style: 'Sightseeing',
    preferences: '',
    season: 'Summer',
    specialRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 max-w-4xl mx-auto relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/30 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/30 transition-all duration-700"></div>

      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Design Your Journey</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Origin City</label>
            <input
              required
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur-sm"
              placeholder="Where are you starting?"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Dream Destination</label>
            <input
              required
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur-sm"
              placeholder="Where do you want to go?"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Duration (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              name="days"
              value={formData.days}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Budget Tier</label>
            <div className="relative">
                <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                <option value="Budget" className="bg-slate-800">Budget ($)</option>
                <option value="Mid-range" className="bg-slate-800">Mid-range ($$)</option>
                <option value="Luxury" className="bg-slate-800">Luxury ($$$)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Season</label>
            <div className="relative">
                <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                <option value="Spring" className="bg-slate-800">Spring</option>
                <option value="Summer" className="bg-slate-800">Summer</option>
                <option value="Autumn" className="bg-slate-800">Autumn</option>
                <option value="Winter" className="bg-slate-800">Winter</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Travel Style</label>
          <input
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Adventure, Foodie, Relaxing, Family, Photography"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Preferences & Interests</label>
          <textarea
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            rows={2}
            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Tell us what you love (e.g. art museums, hiking, street food)..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-4 relative overflow-hidden group ${
            isLoading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/40'
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
             {isLoading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Consulting Gemini AI...</span>
                </>
             ) : (
                <>
                    <span>Generate Itinerary</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </>
             )}
          </span>
          {!isLoading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
        </button>
      </form>
    </div>
  );
};

export default TripForm;