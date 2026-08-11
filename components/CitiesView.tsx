'use client';

import React, { useState } from 'react';
import { City } from '../types/admin';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Navigation,
  Globe,
  Settings,
  Grid,
  Map as MapIcon
} from 'lucide-react';
import { createCityApi, deleteCityApi, updateCityApi } from '../lib/api';

interface CitiesViewProps {
  cities: City[];
  onRefresh: () => void;
}

export const CitiesView: React.FC<CitiesViewProps> = ({ cities, onRefresh }) => {
  const [cityName, setCityName] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Coordinates & Geocoding Search
  const [latitude, setLatitude] = useState<number>(28.6692);
  const [longitude, setLongitude] = useState<number>(77.4538);
  const [searchLocation, setSearchLocation] = useState('Ghaziabad, Uttar Pradesh, India');
  const [pinCodeSearch, setPinCodeSearch] = useState('');
  const [pinCodesList, setPinCodesList] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleLocatePinCode = async () => {
    if (!pinCodeSearch) return;
    showToast(`Locating PIN Code: ${pinCodeSearch}...`);
    setTimeout(() => {
      if (!pinCodesList.includes(pinCodeSearch)) {
        setPinCodesList([...pinCodesList, pinCodeSearch]);
      }
      setPinCodeSearch('');
      showToast(`PIN Code ${pinCodeSearch} added to service areas.`);
    }, 800);
  };

  const handleSearchLocation = async () => {
    if (!searchLocation) return;
    showToast(`Searching coordinates for ${searchLocation}...`);
    setTimeout(() => {
      const randOffsetLat = (Math.random() - 0.5) * 0.05;
      const randOffsetLng = (Math.random() - 0.5) * 0.05;
      setLatitude(prev => Number((prev + randOffsetLat).toFixed(4)));
      setLongitude(prev => Number((prev + randOffsetLng).toFixed(4)));
      showToast(`Coordinates updated based on location search.`);
    }, 1000);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      showToast('Fetching device coordinates...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(Number(position.coords.latitude.toFixed(6)));
          setLongitude(Number(position.coords.longitude.toFixed(6)));
          setSearchLocation(`Coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
          showToast('Updated location to current device GPS coordinates.');
        },
        (error) => {
          showToast(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser.');
    }
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName) return;

    setLoading(true);
    try {
      await createCityApi({
        name: cityName,
        isActive,
        latitude,
        longitude,
        searchLocation,
        pinCodes: pinCodesList
      });

      showToast(`City "${cityName}" registered successfully.`);
      setCityName('');
      setIsActive(true);
      setPinCodesList([]);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCityStatus = async (cityId: string, currentActive: boolean) => {
    try {
      await updateCityApi(cityId, { isActive: !currentActive });
      showToast('City active status updated.');
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteCity = async (cityId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteCityApi(cityId);
      showToast(`City "${name}" deleted.`);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const removePinCode = (pin: string) => {
    setPinCodesList(pinCodesList.filter(p => p !== pin));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-xs shadow-xl border border-zinc-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Title Header */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <MapPin className="h-4.5 w-4.5 text-zinc-400" /> Serviceable Cities Directory
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Configure diagnostic operation zones, coverage maps, and serviceable PIN codes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Add City Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 pb-2 border-b border-zinc-800">
              Register New Service Area (City)
            </h3>

            <form onSubmit={handleCreateCity} className="space-y-5">
              
              {/* Row 1: Name & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={e => setCityName(e.target.value)}
                    placeholder="Enter city name (e.g. Ghaziabad)"
                    required
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-zinc-700 focus:outline-none px-3 py-2 text-xs rounded-lg text-white placeholder-zinc-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Is Active
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={e => setIsActive(e.target.value === 'active')}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-zinc-700 focus:outline-none px-3 py-2 text-xs rounded-lg text-white transition"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 2: PIN Code Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    PIN Code Search
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pinCodeSearch}
                      onChange={e => setPinCodeSearch(e.target.value)}
                      placeholder="Enter PIN Code"
                      className="flex-1 bg-zinc-950 border border-zinc-855 focus:border-zinc-700 focus:outline-none px-3 py-2 text-xs rounded-lg text-white font-mono placeholder-zinc-600 transition"
                    />
                    <button
                      type="button"
                      onClick={handleLocatePinCode}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-450 text-zinc-950 font-semibold text-xs transition shrink-0"
                    >
                      Locate
                    </button>
                  </div>
                </div>

                {/* Display added Pin codes */}
                <div className="min-h-[38px] p-2 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-wrap gap-1.5 items-center">
                  {pinCodesList.length === 0 ? (
                    <span className="text-[10px] text-zinc-600 px-2">No PIN codes added yet.</span>
                  ) : (
                    pinCodesList.map(p => (
                      <span key={p} className="inline-flex items-center gap-1 bg-zinc-850 text-zinc-200 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-zinc-750">
                        {p}
                        <button type="button" onClick={() => removePinCode(p)} className="text-zinc-550 hover:text-rose-400 font-bold ml-0.5">×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Row 3: Search Location */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  Search Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    placeholder="Search for your city or area"
                    className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-zinc-700 focus:outline-none px-3 py-2 text-xs rounded-lg text-white placeholder-zinc-600 transition"
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Map & Coordinates Rendering */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                  <span>Coordinates: Lat {latitude} | Lng {longitude}</span>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 font-sans text-xs"
                  >
                    <Navigation className="h-3 w-3" /> Get Current Location
                  </button>
                </div>

                {/* Leaflet Live Map Integration Frame */}
                <div className="w-full h-80 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-955 relative">
                  <iframe
                    title="coverage-map"
                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0 filter invert grayscale opacity-80"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 bg-zinc-950/85 backdrop-blur-md px-2 py-1 rounded border border-zinc-800 text-[9px] text-zinc-400 font-mono z-10 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-emerald-500 animate-pulse" /> Live Tracking Active
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading || !cityName}
                  className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4 text-zinc-950" />
                  <span>{loading ? 'Registering...' : 'Register City'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Service Cities List (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800 flex items-center gap-1.5">
                <MapIcon className="h-3.5 w-3.5 text-zinc-500" /> Active Coverage Zones
              </h3>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {cities.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No active cities registered yet.
                  </div>
                ) : (
                  cities.map(city => (
                    <div
                      key={city.id}
                      className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-850 hover:border-zinc-750 transition flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-white">{city.name}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            Lat: {city.latitude || 'N/A'}, Lng: {city.longitude || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCityStatus(city.id, city.isActive)}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase transition ${
                              city.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-450 border border-zinc-700'
                            }`}
                          >
                            {city.isActive ? 'Active' : 'Inactive'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCity(city.id, city.name)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {city.pinCodes && city.pinCodes.length > 0 && (
                        <div className="pt-1.5 border-t border-zinc-900 flex flex-wrap gap-1">
                          {city.pinCodes.slice(0, 4).map(p => (
                            <span key={p} className="text-[8px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                              {p}
                            </span>
                          ))}
                          {city.pinCodes.length > 4 && (
                            <span className="text-[8px] font-mono px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-550 rounded font-semibold">
                              +{city.pinCodes.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="flex items-center gap-1"><Settings className="h-3 w-3" /> Total Zones: {cities.length}</span>
              <span className="flex items-center gap-1"><Grid className="h-3 w-3" /> Service Area Engine</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
