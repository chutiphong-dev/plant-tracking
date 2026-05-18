'use client';

import React, { useState, useEffect } from 'react';
import { 
  getPlants, 
  createPlant, 
  deletePlant, 
  logCareAction, 
  getCareLogs, 
  Plant, 
  CareLog 
} from './actions/plants';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const [plantsList, setPlantsList] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedPlantLogs, setSelectedPlantLogs] = useState<CareLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState('ไม้ดอก');
  const [fertilizerType, setFertilizerType] = useState('กลาง (16-16-16)');
  const [wateringInterval, setWateringInterval] = useState(7);
  const [fertilizingInterval, setFertilizingInterval] = useState(14);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Active Navigation & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'thirsty' | 'hungry' | 'healthy'>('all');
  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [logType, setLogType] = useState('water');

  // Load plants initially
  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getPlants();
      setPlantsList(res.data);
      setIsMockMode(res.isMock);
      
      // Auto select first plant if available
      if (res.data.length > 0 && !selectedPlant) {
        setSelectedPlant(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch care logs when selected plant changes
  useEffect(() => {
    if (selectedPlant) {
      getCareLogs(selectedPlant.id).then((res) => {
        setSelectedPlantLogs(res.data);
      });
    } else {
      setSelectedPlantLogs([]);
    }
  }, [selectedPlant, plantsList]);

  // Handle plant deletion
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this plant from your collection?')) return;
    
    try {
      await deletePlant(id);
      setPlantsList(prev => prev.filter(p => p.id !== id));
      if (selectedPlant?.id === id) {
        setSelectedPlant(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle care action log submission (Watering/Fertilizing/Pruning)
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant) return;

    try {
      await logCareAction(selectedPlant.id, logType, logNotes);
      setLogNotes('');
      
      // Reload plant list
      const res = await getPlants();
      setPlantsList(res.data);
      
      // Reload logs for selected plant
      const logsRes = await getCareLogs(selectedPlant.id);
      setSelectedPlantLogs(logsRes.data);
      
      // Update selected plant itself
      const updated = res.data.find(p => p.id === selectedPlant.id);
      if (updated) setSelectedPlant(updated);
      
      setIsLogsPanelOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle adding new plant
  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Plant name is required.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    try {
      const res = await createPlant(
        name, 
        nickname, 
        category, 
        fertilizerType, 
        wateringInterval, 
        fertilizingInterval
      );
      setPlantsList(prev => [res.data, ...prev]);
      setSelectedPlant(res.data);
      
      // Reset form
      setName('');
      setNickname('');
      setCategory('ไม้ดอก');
      setFertilizerType('กลาง (16-16-16)');
      setWateringInterval(7);
      setFertilizingInterval(14);
    } catch (err) {
      console.error(err);
      setFormError('Failed to create plant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick watering trigger
  const handleQuickWater = async (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await logCareAction(plant.id, 'water', 'Quick watering from dashboard');
      
      const res = await getPlants();
      setPlantsList(res.data);
      
      const updated = res.data.find(p => p.id === plant.id);
      if (updated && selectedPlant?.id === plant.id) {
        setSelectedPlant(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick fertilizing trigger
  const handleQuickFeed = async (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await logCareAction(plant.id, 'feed', `Quick fertilization: ${plant.fertilizerType}`);
      
      const res = await getPlants();
      setPlantsList(res.data);
      
      const updated = res.data.find(p => p.id === plant.id);
      if (updated && selectedPlant?.id === plant.id) {
        setSelectedPlant(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Interval calculators
  const getDaysSinceWatered = (plant: Plant) => {
    if (!plant.lastWateredAt) return 999;
    const diffTime = Date.now() - new Date(plant.lastWateredAt).getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getDaysSinceFertilized = (plant: Plant) => {
    if (!plant.lastFertilizedAt) return 999;
    const diffTime = Date.now() - new Date(plant.lastFertilizedAt).getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const isThirsty = (plant: Plant) => {
    const days = getDaysSinceWatered(plant);
    return days >= plant.wateringIntervalDays;
  };

  const isHungry = (plant: Plant) => {
    if (plant.fertilizerType === 'ยังไม่ใส่') return false;
    const days = getDaysSinceFertilized(plant);
    return days >= plant.fertilizingIntervalDays;
  };

  // Get matching guide info based on fertilizer formulas
  const getFormulaTip = (formula: string | null) => {
    if (!formula) return '';
    if (formula.includes('0-0-0')) return 'สูตรจำง่าย (พอซื้อครบ)';
    if (formula.includes('8-24-24')) return 'เร่งดอกไม้ตูมตูมสะพรั่ง';
    if (formula.includes('16-16-16')) return 'สูตรสารพัดประโยชน์ ทั่วไป';
    if (formula.includes('20-10-10')) return 'เน้นบำรุงใบไม้ ให้สีสดแข็งแรง';
    return '';
  };

  // Stats calculation
  const totalPlantsCount = plantsList.length;
  const thirstyCount = plantsList.filter(isThirsty).length;
  const hungryCount = plantsList.filter(isHungry).length;
  const healthyCount = plantsList.filter(p => !isThirsty(p) && !isHungry(p)).length;

  // Filtering list
  const filteredPlants = plantsList.filter(p => {
    if (activeTab === 'thirsty') return isThirsty(p);
    if (activeTab === 'hungry') return isHungry(p);
    if (activeTab === 'healthy') return !isThirsty(p) && !isHungry(p);
    return true;
  });

  // Category Badge Colors
  const getCategoryStyles = (cat: string | null) => {
    if (!cat) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    if (cat.includes('ดอก')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (cat.includes('สมุนไพร')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (cat.includes('ใบ')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (cat.includes('ประดับ')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Offline Status Alert */}
      {isMockMode && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel">
          <div className="flex items-start gap-3">
            <span className="text-xl">🌿</span>
            <div>
              <h2 className="font-semibold text-sm">Supabase Offline Mode (Spreadsheet Loaded)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connecting to real database via Supabase ref `qfqpuuqwvkkiphaqvabm`. Using local memory pre-seeded with your exact plants!
                To connect permanently, supply your postgres password in `.env.local`.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-[10px] bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">
              DATABASE_URL: real-ref
            </code>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Inventory Metrics">
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Collection</p>
          <p className="text-3xl font-extrabold mt-2 text-foreground font-mono">{totalPlantsCount}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thirsty Plants</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-extrabold text-blue-400 font-mono">{thirstyCount}</p>
            {thirstyCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
                Need Water 💧
              </span>
            )}
          </div>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fertilization Due</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-extrabold text-amber-500 font-mono">{hungryCount}</p>
            {hungryCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                Need Feeding 🧪
              </span>
            )}
          </div>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sated & Stable</p>
          <p className="text-3xl font-extrabold mt-2 text-emerald-500 font-mono">{healthyCount}</p>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Plants list & details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls & Filter Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex bg-secondary p-1 rounded-xl border border-border/40">
              <button
                id="tab-all"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                id="tab-thirsty"
                onClick={() => setActiveTab('thirsty')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'thirsty'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Thirsty
                {thirstyCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </button>
              <button
                id="tab-hungry"
                onClick={() => setActiveTab('hungry')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'hungry'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Fertilize Due
                {hungryCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
              <button
                id="tab-healthy"
                onClick={() => setActiveTab('healthy')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'healthy'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Healthy
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {filteredPlants.length} of {totalPlantsCount} plants
            </div>
          </div>

          {/* Grid of plants */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl glass-panel animate-pulse border border-border/40" />
              ))}
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/20">
              <span className="text-3xl" role="img" aria-label="magnifying glass">🔍</span>
              <h3 className="mt-4 font-semibold text-sm">No companions in this state</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your garden seems perfectly sated here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlants.map((plant) => {
                const daysSinceWatered = getDaysSinceWatered(plant);
                const daysSinceFertilized = getDaysSinceFertilized(plant);
                
                const thirsty = isThirsty(plant);
                const hungry = isHungry(plant);
                const selected = selectedPlant?.id === plant.id;
                
                // Hydration and Fertilizer Nutrition meters
                const waterPercent = Math.max(0, Math.min(100, Math.floor(((plant.wateringIntervalDays - Math.min(daysSinceWatered, plant.wateringIntervalDays)) / plant.wateringIntervalDays) * 100)));
                const feedPercent = plant.fertilizerType === 'ยังไม่ใส่' 
                  ? 0 
                  : Math.max(0, Math.min(100, Math.floor(((plant.fertilizingIntervalDays - Math.min(daysSinceFertilized, plant.fertilizingIntervalDays)) / plant.fertilizingIntervalDays) * 100)));

                return (
                  <div
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant)}
                    className={`p-5 rounded-2xl border cursor-pointer hover-card flex flex-col justify-between h-56 transition-all ${
                      selected 
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                        : 'border-border/40 glass-panel'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base tracking-tight leading-tight">{plant.name}</h3>
                            {plant.nickname && (
                              <span className="text-[10px] text-muted-foreground italic">({plant.nickname})</span>
                            )}
                          </div>
                          
                          {/* Category Badge */}
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1.5 ${getCategoryStyles(plant.category)}`}>
                            {plant.category || 'ไม่ระบุประเภท'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1 items-end">
                          {thirsty && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Thirsty
                            </span>
                          )}
                          {hungry && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Feed Due
                            </span>
                          )}
                          {!thirsty && !hungry && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Healthy
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Gauges */}
                      <div className="mt-4 space-y-3">
                        {/* Hydration */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Soil Hydration (Water)</span>
                            <span>{waterPercent}%</span>
                          </div>
                          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden border border-border/40">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                waterPercent < 25 ? 'bg-blue-400' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${waterPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Nutrition */}
                        {plant.fertilizerType !== 'ยังไม่ใส่' && (
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Nutrition ({plant.fertilizerType})</span>
                              <span>{feedPercent}%</span>
                            </div>
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden border border-border/40">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  feedPercent < 25 ? 'bg-amber-400' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${feedPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3.5 mt-2">
                      <span className="text-[9px] text-muted-foreground">
                        W: {plant.wateringIntervalDays}d | F: {plant.fertilizerType === 'ยังไม่ใส่' ? 'N/A' : `${plant.fertilizingIntervalDays}d`}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          id={`delete-btn-${plant.id}`}
                          onClick={(e) => handleDelete(plant.id, e)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          aria-label="Remove plant"
                          title="Remove plant"
                        >
                          🗑️
                        </button>
                        
                        <button
                          id={`water-btn-${plant.id}`}
                          onClick={(e) => handleQuickWater(plant, e)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-blue-950 font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                          title="Log Water"
                        >
                          💧 Water
                        </button>

                        {plant.fertilizerType !== 'ยังไม่ใส่' && (
                          <button
                            id={`feed-btn-${plant.id}`}
                            onClick={(e) => handleQuickFeed(plant, e)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                            title="Log Feed"
                          >
                            🧪 Feed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Plant Care Details panel (if any selected) */}
          {selectedPlant && (
            <section className="p-6 rounded-2xl glass-panel border border-border/40 space-y-6" aria-labelledby="plant-details-title">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 id="plant-details-title" className="text-xl font-bold tracking-tight">
                    {selectedPlant.name} Registry Card
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Category: <span className="text-emerald-400 font-semibold">{selectedPlant.category || 'ไม่ระบุประเภท'}</span> | Registered on {formatDate(selectedPlant.createdAt)}
                  </p>
                </div>
                
                <button
                  id="log-event-trigger"
                  onClick={() => setIsLogsPanelOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                >
                  📝 Log Care Event
                </button>
              </div>

              {/* Grid of detail elements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/40 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Watering Frequency</p>
                  <p className="text-sm font-semibold">Every {selectedPlant.wateringIntervalDays} days</p>
                  <p className="text-[10px] text-muted-foreground">
                    Last: {selectedPlant.lastWateredAt ? formatTimeAgo(selectedPlant.lastWateredAt) : 'Never'}
                  </p>
                </div>

                <div className="bg-secondary/40 p-4 rounded-xl border border-border/40 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fertilization Frequency</p>
                  <p className="text-sm font-semibold">
                    {selectedPlant.fertilizerType === 'ยังไม่ใส่' ? 'No fertilizer schedule' : `Every ${selectedPlant.fertilizingIntervalDays} days`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Last: {selectedPlant.lastFertilizedAt ? formatTimeAgo(selectedPlant.lastFertilizedAt) : 'Never'}
                  </p>
                </div>

                <div className="bg-secondary/40 p-4 rounded-xl border border-border/40 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Main Fertilizer Type</p>
                  <p className="text-sm font-semibold text-emerald-400">{selectedPlant.fertilizerType || 'ยังไม่ใส่'}</p>
                  {selectedPlant.fertilizerType !== 'ยังไม่ใส่' && (
                    <p className="text-[10px] text-amber-300 font-medium italic">
                      💡 {getFormulaTip(selectedPlant.fertilizerType)}
                    </p>
                  )}
                </div>
              </div>

              {/* Schedules and Deadlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-card/40 border border-border/40">
                  <span className="text-muted-foreground">Next Watering:</span>
                  <span className="font-semibold">
                    {(() => {
                      const days = getDaysSinceWatered(selectedPlant);
                      const rem = selectedPlant.wateringIntervalDays - days;
                      if (rem < 0) return `Overdue by ${Math.abs(rem)} days! 💧`;
                      if (rem === 0) return 'Due today!';
                      return `In ${rem} days`;
                    })()}
                  </span>
                </div>

                {selectedPlant.fertilizerType !== 'ยังไม่ใส่' && (
                  <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-card/40 border border-border/40">
                    <span className="text-muted-foreground">Next Fertilization:</span>
                    <span className="font-semibold">
                      {(() => {
                        const days = getDaysSinceFertilized(selectedPlant);
                        const rem = selectedPlant.fertilizingIntervalDays - days;
                        if (rem < 0) return `Overdue by ${Math.abs(rem)} days! 🧪`;
                        if (rem === 0) return 'Due today!';
                        return `In ${rem} days`;
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Logs Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Care Logs & Timeline
                </h3>
                
                {selectedPlantLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-secondary/20 p-3 rounded-lg border border-border/40">
                    No care actions logged yet. Start tracking by adding a watering or feeding event!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedPlantLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3 rounded-xl bg-card border border-border/40 flex items-center justify-between text-xs hover:border-emerald-500/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">
                            {log.actionType === 'water' ? '💧' : log.actionType === 'feed' ? '🧪' : log.actionType === 'prune' ? '✂️' : '🪴'}
                          </span>
                          <div>
                            <p className="font-semibold capitalize">
                              {log.actionType === 'feed' ? 'Fertilization' : log.actionType}
                            </p>
                            {log.notes && (
                              <p className="text-[10px] text-muted-foreground italic mt-0.5">"{log.notes}"</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatTimeAgo(log.loggedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* Right Col: Add Plant Form */}
        <div className="space-y-6">
          <section className="p-6 rounded-2xl glass-panel border border-border/40 space-y-6" aria-labelledby="add-plant-title">
            <div>
              <h2 id="add-plant-title" className="text-lg font-bold tracking-tight">Add New Plant</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Register a seedling or companion matching your garden layout.
              </p>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="plant-name" className="text-xs font-semibold text-muted-foreground">
                  Plant Name (ชื่อต้นไม้)
                </label>
                <input
                  id="plant-name"
                  type="text"
                  placeholder="e.g. เดซี่ 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plant-nickname" className="text-xs font-semibold text-muted-foreground">
                  Nickname / Custom Note <span className="text-[10px] font-normal text-muted-foreground/60">(Optional)</span>
                </label>
                <input
                  id="plant-nickname"
                  type="text"
                  placeholder="e.g. Figgy / Daisy One"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plant-category" className="text-xs font-semibold text-muted-foreground">
                  Category (ประเภท)
                </label>
                <select
                  id="plant-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="ไม้ดอก">ไม้ดอก (Flowering)</option>
                  <option value="สมุนไพร">สมุนไพร (Herb)</option>
                  <option value="ไม้ใบ">ไม้ใบ (Foliage)</option>
                  <option value="ไม้ประดับ">ไม้ประดับ (Ornamental)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="fertilizer-type" className="text-xs font-semibold text-muted-foreground">
                  Primary Fertilizer (ประเภทปุ๋ยหลัก)
                </label>
                <select
                  id="fertilizer-type"
                  value={fertilizerType}
                  onChange={(e) => setFertilizerType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="กลาง (16-16-16)">กลาง (16-16-16) - สูตรทั่วไป</option>
                  <option value="ดอก (8-24-24)">ดอก (8-24-24) - เร่งดอก</option>
                  <option value="อินทรีย์ (0-0-0)">อินทรีย์ (0-0-0) - ปุ๋ยคอก/ธรรมชาติ</option>
                  <option value="ใบ (20-10-10)">ใบ (20-10-10) - เร่งใบ</option>
                  <option value="ยังไม่ใส่">ยังไม่ใส่ - พักฟื้น/ต้นอ่อน</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="watering-interval" className="text-xs font-semibold text-muted-foreground">
                    Watering Schedule
                  </label>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Every {wateringInterval} days
                  </span>
                </div>
                <input
                  id="watering-interval"
                  type="range"
                  min="1"
                  max="30"
                  value={wateringInterval}
                  onChange={(e) => setWateringInterval(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-secondary rounded-lg h-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 day (Frequent)</span>
                  <span>30 days (Dry)</span>
                </div>
              </div>

              {fertilizerType !== 'ยังไม่ใส่' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="fertilizing-interval" className="text-xs font-semibold text-muted-foreground">
                      Fertilization Schedule
                    </label>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Every {fertilizingInterval} days
                    </span>
                  </div>
                  <input
                    id="fertilizing-interval"
                    type="range"
                    min="3"
                    max="60"
                    value={fertilizingInterval}
                    onChange={(e) => setFertilizingInterval(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-secondary rounded-lg h-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>3 days (Frequent)</span>
                    <span>60 days (Spread)</span>
                  </div>
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-400 font-semibold">{formError}</p>
              )}

              <button
                id="submit-plant-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>🌱</span> Add Companion
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

      </div>

      {/* Log event modal / overlay */}
      {isLogsPanelOpen && selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <section className="w-full max-w-md p-6 rounded-2xl glass-panel border border-border/40 shadow-xl space-y-6" aria-labelledby="modal-title">
            <div className="flex justify-between items-start">
              <div>
                <h2 id="modal-title" className="text-lg font-bold tracking-tight">Log Event for {selectedPlant.name}</h2>
                <p className="text-xs text-muted-foreground">Log care activity manually</p>
              </div>
              <button 
                id="close-modal-btn"
                onClick={() => setIsLogsPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="action-type" className="text-xs font-semibold text-muted-foreground">
                  Action Type
                </label>
                <select
                  id="action-type"
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="water">Watering 💧</option>
                  <option value="feed">Fertilizer/Feeding 🧪</option>
                  <option value="prune">Pruning/Trimming ✂️</option>
                  <option value="repot">Repotting 🪴</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="event-notes" className="text-xs font-semibold text-muted-foreground">
                  Activity Notes <span className="text-[10px] font-normal text-muted-foreground/60">(Optional)</span>
                </label>
                <textarea
                  id="event-notes"
                  placeholder="e.g. Leaf looks shiny, soil completely dry..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-muted-foreground resize-none"
                />
              </div>

              <button
                id="submit-log-btn"
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-xs shadow-md transition-all"
              >
                Log Care Activity
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
