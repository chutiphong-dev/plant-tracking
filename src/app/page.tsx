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
  const [wateringInterval, setWateringInterval] = useState(7);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Active Action State
  const [activeTab, setActiveTab] = useState<'all' | 'thirsty' | 'healthy'>('all');
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

  // Handle care action log submission
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant) return;

    try {
      await logCareAction(selectedPlant.id, logType, logNotes);
      setLogNotes('');
      
      // Reload plant list to update lastWateredAt calculations
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
      const res = await createPlant(name, nickname, wateringInterval);
      setPlantsList(prev => [res.data, ...prev]);
      setSelectedPlant(res.data);
      
      // Reset form
      setName('');
      setNickname('');
      setWateringInterval(7);
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
      
      // Refresh state
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

  // Calculate stats
  const totalPlantsCount = plantsList.length;
  
  const getDaysSinceWatered = (plant: Plant) => {
    if (!plant.lastWateredAt) return 999;
    const diffTime = Date.now() - new Date(plant.lastWateredAt).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const isThirsty = (plant: Plant) => {
    const days = getDaysSinceWatered(plant);
    return days >= plant.wateringIntervalDays;
  };

  const thirstyCount = plantsList.filter(isThirsty).length;
  const healthyCountCount = totalPlantsCount - thirstyCount;

  // Filtering
  const filteredPlants = plantsList.filter(p => {
    if (activeTab === 'thirsty') return isThirsty(p);
    if (activeTab === 'healthy') return !isThirsty(p);
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Offline Status Alert */}
      {isMockMode && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h2 className="font-semibold text-sm">Offline Development Fallback Active</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                The application detected that your Supabase Postgres database URL is not configured yet. 
                Running with an elegant local in-memory store so you can test features seamlessly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-[10px] bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">
              DATABASE_URL empty/mocked
            </code>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Inventory Metrics">
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Plants</p>
          <p className="text-3xl font-extrabold mt-2 text-foreground font-mono">{totalPlantsCount}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thirsty Collection</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-extrabold text-amber-500 font-mono">{thirstyCount}</p>
            {thirstyCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                Attention Required
              </span>
            )}
          </div>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Healthy Flora</p>
          <p className="text-3xl font-extrabold mt-2 text-emerald-500 font-mono">{healthyCountCount}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-border/40 hover-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boilerplate Engine</p>
          <p className="text-sm font-semibold mt-3 text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block w-fit">
            Ready to Deploy
          </p>
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
                All Plants
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
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-2xl glass-panel animate-pulse border border-border/40" />
              ))}
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/20">
              <span className="text-3xl" role="img" aria-label="magnifying glass">🔍</span>
              <h3 className="mt-4 font-semibold text-sm">No plants found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === 'all' 
                  ? "Get started by adding your first plant to the system!" 
                  : `No plants matching "${activeTab}" state.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlants.map((plant) => {
                const daysSince = getDaysSinceWatered(plant);
                const thirsty = isThirsty(plant);
                const selected = selectedPlant?.id === plant.id;
                
                // Calculate hydration percentage for slider bar
                const percent = Math.max(0, Math.min(100, Math.floor(((plant.wateringIntervalDays - Math.min(daysSince, plant.wateringIntervalDays)) / plant.wateringIntervalDays) * 100)));

                return (
                  <div
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant)}
                    className={`p-5 rounded-2xl border cursor-pointer hover-card flex flex-col justify-between h-48 transition-all ${
                      selected 
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                        : 'border-border/40 glass-panel'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base tracking-tight leading-tight">{plant.name}</h3>
                          {plant.nickname && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">"{plant.nickname}"</p>
                          )}
                        </div>
                        {thirsty ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Thirsty
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Healthy
                          </span>
                        )}
                      </div>

                      {/* Hydration progress bar */}
                      <div className="mt-5 space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Soil Hydration</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden border border-border/40">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent < 25 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        Interval: {plant.wateringIntervalDays} days
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          id={`delete-btn-${plant.id}`}
                          onClick={(e) => handleDelete(plant.id, e)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          aria-label="Remove plant"
                          title="Remove plant"
                        >
                          <span role="img" aria-label="bin">🗑️</span>
                        </button>
                        <button
                          id={`water-btn-${plant.id}`}
                          onClick={(e) => handleQuickWater(plant, e)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                        >
                          <span role="img" aria-label="droplet">💧</span> Water
                        </button>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 id="plant-details-title" className="text-xl font-bold tracking-tight">
                    {selectedPlant.name} Care Profile
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Added to registry on {formatDate(selectedPlant.createdAt)}
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
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Watering Frequency</p>
                  <p className="text-sm font-semibold mt-1">Every {selectedPlant.wateringIntervalDays} days</p>
                </div>
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Last Care Action</p>
                  <p className="text-sm font-semibold mt-1">
                    {selectedPlant.lastWateredAt 
                      ? `${formatTimeAgo(selectedPlant.lastWateredAt)} (Water)`
                      : 'Never recorded'}
                  </p>
                </div>
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Next Care Event</p>
                  <p className="text-sm font-semibold mt-1">
                    {(() => {
                      const days = getDaysSinceWatered(selectedPlant);
                      const rem = selectedPlant.wateringIntervalDays - days;
                      if (rem <= 0) return 'Overdue for water! 💧';
                      return `Water in ${rem} days`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Logs Drawer Inline */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Care Logs & Timeline
                </h3>
                
                {selectedPlantLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-secondary/20 p-3 rounded-lg border border-border/40">
                    No care actions logged yet. Water the plant to create your first care log!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedPlantLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3 rounded-xl bg-card border border-border/40 flex items-center justify-between text-xs hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center font-bold text-[8px] ${
                            log.actionType === 'water' 
                              ? 'bg-emerald-500 text-emerald-950' 
                              : log.actionType === 'prune'
                              ? 'bg-amber-500 text-amber-950'
                              : 'bg-indigo-500 text-indigo-950'
                          }`}>
                            {log.actionType === 'water' ? '💧' : log.actionType === 'prune' ? '✂️' : '🍃'}
                          </span>
                          <div>
                            <p className="font-semibold capitalize">{log.actionType}</p>
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
                Register a new seedling or potted companion.
              </p>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="plant-name" className="text-xs font-semibold text-muted-foreground">
                  Plant Common Name
                </label>
                <input
                  id="plant-name"
                  type="text"
                  placeholder="e.g. Swiss Cheese Plant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plant-nickname" className="text-xs font-semibold text-muted-foreground">
                  Custom Nickname <span className="text-[10px] font-normal text-muted-foreground/60">(Optional)</span>
                </label>
                <input
                  id="plant-nickname"
                  type="text"
                  placeholder="e.g. Monty"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="watering-interval" className="text-xs font-semibold text-muted-foreground">
                    Watering Schedule
                  </label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
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
                  className="w-full accent-primary bg-secondary rounded-lg h-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 day (Frequent)</span>
                  <span>30 days (Dry)</span>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-400 font-semibold">{formError}</p>
              )}

              <button
                id="submit-plant-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span role="img" aria-label="sprout">🌱</span> Add Companion
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="water">Watering 💧</option>
                  <option value="prune">Pruning/Trimming ✂️</option>
                  <option value="feed">Fertilizer/Feeding 🧪</option>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground resize-none"
                />
              </div>

              <button
                id="submit-log-btn"
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-primary-foreground font-bold text-xs shadow-md transition-all"
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
