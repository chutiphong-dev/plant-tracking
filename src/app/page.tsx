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
import { 
  Droplet, 
  Sparkles, 
  Trash2, 
  Plus, 
  Search, 
  Settings, 
  Activity, 
  Calendar, 
  Clock, 
  Info, 
  PlusCircle, 
  Heart, 
  LayoutDashboard,
  Bell,
  CheckCircle,
  AlertCircle,
  Sprout,
  Filter,
  Globe
} from 'lucide-react';

// Translation Dictionary
const t = {
  en: {
    title: 'Holographic Workspace',
    subtitle: 'Gaze, log observations, and track daily notes seamlessly.',
    sandboxTitle: 'Apple Vision Pro Spatial Sandbox',
    sandboxDesc: 'Pre-seeded with your exact Thai garden plants from your spreadsheet.',
    sandboxBadge: 'DATABASE: OFFLINE BACKUP',
    searchPlaceholder: 'Gaze Search...',
    totalCollection: 'Total Collection',
    wateredToday: 'Watered Today',
    fertilizedToday: 'Fertilized Today',
    trackedPlants: 'Tracked Companions',
    tabAll: 'All Companions',
    showingPlants: 'Showing {count} of {total} plants',
    noPlantsTitle: 'Garden is Clean',
    noPlantsDesc: 'Gaze filters or search query did not yield matches.',
    soilMoisture: 'Soil Moisture',
    nutrition: 'Nutrition',
    waterBtn: 'Water',
    feedBtn: 'Feed',
    deleteTitle: 'Remove this plant from your spatial workspace?',
    waterQuickLog: 'Quick watering',
    feedQuickLog: 'Quick fertilization: {formula}',
    registerTitle: 'Register Spatial Companion',
    registerSubtitle: 'Add a new plant, seedling, or organic structure to your hologram list.',
    formCommonName: 'Common Name (ชื่อต้นไม้)',
    formNickname: 'Nickname / Registry Note',
    formCategory: 'Category (ประเภท)',
    formFertilizer: 'Primary Fertilizer (ประเภทปุ๋ยหลัก)',
    formWaterFreq: 'Watering Frequency',
    formFeedFreq: 'Fertilizing Frequency',
    formEveryDays: 'Every {days} days',
    formCancel: 'Cancel',
    formRegister: 'Register Companion 🪴',
    diagTitle: 'Spatial Diagnostics',
    diagSubtitle: 'Personalize your environment layout and check connection endpoints.',
    diagProjRef: 'Connected Project Reference',
    diagApiGateway: 'Supabase API Gateway',
    diagStatus: 'Diagnostic Status',
    diagActive: 'Client integration is active and operating perfectly.',
    diagBack: 'Back to Holograms',
    hologramTitle: 'Active Hologram',
    hologramSubtitle: 'Daily Care Tracker',
    formulaReq: 'Formula Requirement',
    waterSchedule: 'Water Schedule',
    feedSchedule: 'Feed Schedule',
    lastWater: 'Last: {time}',
    lastFeed: 'Last: {time}',
    never: 'Never',
    nextWater: 'Next Water Event',
    nextFeed: 'Next Feed Event',
    dueToday: 'Due today!',
    overdue: 'Overdue: {days}d 🚨',
    inDays: 'In {days} days',
    logActionBtn: 'Log Care Note',
    logTimelineTitle: 'Care Observation Timeline',
    noLogs: 'No observations recorded for this companion.',
    noNodeSelected: 'No node selected',
    gazeSelect: 'Gaze and select a holographic companion.',
    modalTitle: 'Add Care Observation',
    modalSubtitle: 'Append a custom record to the {name} hologram.',
    modalCareType: 'Care Type',
    modalNotes: 'Care Notes / Remarks',
    modalLogEntry: 'Log Care Entry',
    logWater: 'Watering 💧',
    logFeed: 'Fertilizer/Feeding 🧪',
    logPrune: 'Pruning/Trimming ✂️',
    logRepot: 'Repotting 🪴',
    logNote: 'General Note 📝',
    logWatered: 'Watered',
    logFertilized: 'Fertilized',
    lastWatered: 'Last Watered',
    lastFertilized: 'Last Fertilized',
    dailyTrackTitle: 'Daily Care & Notes',
    dailyTrackSubtitle: 'Record daily notes, watering, or pruning actions directly.',
    selectCareType: 'Activity Type',
    enterObsNote: 'Write observation or health note here...',
    btnSubmitTrack: 'Save Companion Note 🪴',
  },
  th: {
    title: 'ห้องทำงานโฮโลแกรม',
    subtitle: 'บันทึกภาพ สังเกตสภาพ และติดตามประวัติการดูแลพืชพรรณรายวัน',
    sandboxTitle: 'ระบบจำลองพื้นที่ Apple Vision Pro',
    sandboxDesc: 'โหลดข้อมูลสวนไทยที่ตรงตามตารางเอ็กเซลของคุณไว้เรียบร้อยแล้ว',
    sandboxBadge: 'ฐานข้อมูล: สำรองออฟไลน์',
    searchPlaceholder: 'ใช้สายตาค้นหา...',
    totalCollection: 'จำนวนพืชทั้งหมด',
    wateredToday: 'รดน้ำแล้ววันนี้',
    fertilizedToday: 'ใส่ปุ๋ยแล้ววันนี้',
    trackedPlants: 'พืชที่มีประวัติบำรุง',
    tabAll: 'ต้นไม้ทั้งหมด',
    showingPlants: 'แสดง {count} จากทั้งหมด {total} ต้น',
    noPlantsTitle: 'สวนของคุณเรียบร้อยดี',
    noPlantsDesc: 'ไม่พบต้นไม้ตามตัวกรองที่เลือก',
    soilMoisture: 'ความชื้นในดิน',
    nutrition: 'สารอาหารปุ๋ย',
    waterBtn: 'รดน้ำ',
    feedBtn: 'ใส่ปุ๋ย',
    deleteTitle: 'ต้องการนำต้นไม้นี้ออกจากสวนโฮโลแกรมหรือไม่?',
    waterQuickLog: 'รดน้ำด่วน',
    feedQuickLog: 'ใส่ปุ๋ยด่วนสูตร: {formula}',
    registerTitle: 'ลงทะเบียนสมาชิกสวนใหม่',
    registerSubtitle: 'เพิ่มต้นไม้ ต้นกล้า หรือพืชอินทรีย์ใหม่ลงในรายการของคุณโดยไม่ต้องกำหนดแผนล่วงหน้า',
    formCommonName: 'ชื่อต้นไม้ (Common Name)',
    formNickname: 'ชื่อเล่น / บันทึกเพิ่มเติม',
    formCategory: 'ประเภทพืช (Category)',
    formFertilizer: 'สูตรปุ๋ยหลัก (Primary Fertilizer)',
    formWaterFreq: 'ความถี่การรดน้ำ',
    formFeedFreq: 'ความถี่การใส่ปุ๋ย',
    formEveryDays: 'ทุกๆ {days} วัน',
    formCancel: 'ยกเลิก',
    formRegister: 'บันทึกต้นไม้ใหม่ 🪴',
    diagTitle: 'ระบบวินิจฉัยพื้นที่',
    diagSubtitle: 'จัดการสวนโฮโลแกรมและตรวจสอบการเชื่อมต่อฐานข้อมูล',
    diagProjRef: 'รหัสโครงการที่เชื่อมต่อ (Project Ref)',
    diagApiGateway: 'เกตเวย์ข้อมูล Supabase API',
    diagStatus: 'สถานะการเชื่อมต่อ',
    diagActive: 'ระบบเชื่อมต่อเกตเวย์ทำงานได้อย่างสมบูรณ์',
    diagBack: 'กลับหน้าโฮโลแกรม',
    hologramTitle: 'โฮโลแกรมหลัก',
    hologramSubtitle: 'แผงบันทึกการดูแลรายวัน',
    formulaReq: 'สูตรปุ๋ยบำรุง',
    waterSchedule: 'ประวัติรดน้ำ',
    feedSchedule: 'ประวัติใส่ปุ๋ย',
    lastWater: 'รดน้ำล่าสุด: {time}',
    lastFeed: 'ใส่ปุ๋ยล่าสุด: {time}',
    never: 'ยังไม่เคย',
    nextWater: 'รอบรดน้ำครั้งถัดไป',
    nextFeed: 'รอบใส่ปุ๋ยครั้งถัดไป',
    dueToday: 'ครบกำหนดวันนี้!',
    overdue: 'เลยกำหนดมาแล้ว {days} วัน! 🚨',
    inDays: 'ในอีก {days} วัน',
    logActionBtn: 'บันทึกประวัติการดูแล',
    logTimelineTitle: 'ประวัติการดูแลพืช',
    noLogs: 'ยังไม่มีบันทึกข้อมูลการดูแลพืชนี้',
    noNodeSelected: 'ไม่ได้เลือกโฮโลแกรม',
    gazeSelect: 'กรุณาเลือกต้นไม้เพื่อเปิดระบบบันทึกและประเมินผล',
    modalTitle: 'เพิ่มบันทึกกิจกรรมดูแล',
    modalSubtitle: 'เพิ่มบันทึกกิจกรรมลงในประวัติของ {name}',
    modalCareType: 'ประเภทกิจกรรม',
    modalNotes: 'บันทึกเพิ่มเติม / รายละเอียด',
    modalLogEntry: 'บันทึกกิจกรรมการดูแล',
    logWater: 'การรดน้ำ 💧',
    logFeed: 'การใส่ปุ๋ย 🧪',
    logPrune: 'การตัดแต่งกิ่ง ✂️',
    logRepot: 'การเปลี่ยนกระถาง 🪴',
    logNote: 'บันทึกทั่วไป 📝',
    logWatered: 'รดน้ำเสร็จสิ้น',
    logFertilized: 'ใส่ปุ๋ยเสร็จสิ้น',
    lastWatered: 'รดน้ำล่าสุด',
    lastFertilized: 'ใส่ปุ๋ยล่าสุด',
    dailyTrackTitle: 'บันทึกการดูแลวันนี้',
    dailyTrackSubtitle: 'บันทึกการสังเกต รดน้ำ หรือตัดแต่งกิ่งด้วยตนเองรายวัน',
    selectCareType: 'ประเภทกิจกรรมดูแล',
    enterObsNote: 'เขียนบันทึกสุขภาพพืชหรือรายละเอียดดูแลที่นี่...',
    btnSubmitTrack: 'บันทึกประวัติพืชพรรณ 🪴',
  }
};

export default function DashboardPage() {
  const [lang, setLang] = useState<'en' | 'th'>('th'); // Default to Thai for spreadsheet match
  const currentT = t[lang];

  const [plantsList, setPlantsList] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedPlantLogs, setSelectedPlantLogs] = useState<CareLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation tabs for Vision OS Dock
  const [activeDockTab, setActiveDockTab] = useState<'dashboard' | 'add' | 'settings'>('dashboard');

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
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [logType, setLogType] = useState('water');
  
  // Mobile UI States
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Load plants initially
  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getPlants();
      setPlantsList(res.data);
      setIsMockMode(res.isMock);
      
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

  // Toggle bilingual state
  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'th' : 'en');
  };

  // Handle plant deletion
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(currentT.deleteTitle)) return;
    
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
      
      const res = await getPlants();
      setPlantsList(res.data);
      
      const logsRes = await getCareLogs(selectedPlant.id);
      setSelectedPlantLogs(logsRes.data);
      
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
      setFormError(lang === 'en' ? 'Plant name is required.' : 'กรุณาระบุชื่อต้นไม้');
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
      
      setName('');
      setNickname('');
      setCategory('ไม้ดอก');
      setFertilizerType('กลาง (16-16-16)');
      setWateringInterval(7);
      setFertilizingInterval(14);
      setActiveDockTab('dashboard');
    } catch (err) {
      console.error(err);
      setFormError(lang === 'en' ? 'Failed to register plant.' : 'เกิดข้อผิดพลาดในการลงทะเบียนต้นไม้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick watering trigger
  const handleQuickWater = async (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await logCareAction(plant.id, 'water', currentT.waterQuickLog);
      
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
      await logCareAction(plant.id, 'feed', currentT.feedQuickLog.replace('{formula}', plant.fertilizerType || ''));
      
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
    if (formula.includes('0-0-0')) return lang === 'en' ? 'Organic compost formula' : 'สูตรจำง่าย (พอซื้อครบ)';
    if (formula.includes('8-24-24')) return lang === 'en' ? 'Boost blossoms blooming' : 'อยากได้ "ดอก" -> 8-24-24';
    if (formula.includes('16-16-16')) return lang === 'en' ? 'Balanced multipurpose formula' : 'ใช้ทั่วไป -> 16-16-16';
    if (formula.includes('20-10-10')) return lang === 'en' ? 'Boost vibrant green foliage' : 'อยากได้ "ใบ" -> 20-10-10';
    return lang === 'en' ? 'Standard nutrition' : 'บำรุงตามความเหมาะสม';
  };

  // Interactive spotlight highlight for visionOS card gaze effect
  const handleSpotlightMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  // Helper to check if a date is within "today"
  const isCaredToday = (dateStr?: Date | string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Stats calculation
  const totalPlantsCount = plantsList.length;
  const wateredTodayCount = plantsList.filter(p => isCaredToday(p.lastWateredAt)).length;
  const fertilizedTodayCount = plantsList.filter(p => isCaredToday(p.lastFertilizedAt)).length;
  const trackedCompanionsCount = plantsList.filter(p => p.lastWateredAt || p.lastFertilizedAt).length;

  // Filtering list based on search and tab selection (by category)
  const filteredPlants = plantsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.nickname && p.nickname.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeTab !== 'all') {
      return p.category === activeTab;
    }
    return true;
  });

  // Get Plant Emojis to match design
  const getPlantEmoji = (cat: string | null) => {
    if (!cat) return '🌱';
    if (cat.includes('ดอก')) return '🌸';
    if (cat.includes('สมุนไพร')) return '🌿';
    if (cat.includes('ใบ')) return '🍃';
    if (cat.includes('ประดับ')) return '🪴';
    return '🌱';
  };

  // Translate Category name for UI matching
  const translateCategory = (cat: string | null) => {
    if (!cat) return lang === 'en' ? 'Not specified' : 'ไม่ระบุประเภท';
    if (lang === 'en') {
      if (cat.includes('ดอก')) return 'Flowering';
      if (cat.includes('สมุนไพร')) return 'Herb';
      if (cat.includes('ใบ')) return 'Foliage';
      if (cat.includes('ประดับ')) return 'Ornamental';
    }
    return cat;
  };

  // Category Badge Colors
  const getCategoryStyles = (cat: string | null) => {
    if (!cat) return 'bg-white/5 text-gray-300 border-white/10';
    if (cat.includes('ดอก')) return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
    if (cat.includes('สมุนไพร')) return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    if (cat.includes('ใบ')) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    if (cat.includes('ประดับ')) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25';
    return 'bg-teal-500/10 text-teal-300 border-teal-500/25';
  };

  return (
    <div className="relative w-full flex flex-col lg:flex-row gap-8 items-start select-none pb-28 lg:pb-0">
      
      {/* 1. Apple Vision Pro Floating Left Vertical Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:sticky lg:top-24 lg:bottom-auto lg:left-auto lg:translate-x-0 w-[90%] max-w-[400px] sm:w-auto lg:w-16 h-16 lg:h-[380px] rounded-full flex lg:flex-col items-center justify-between px-6 lg:px-0 lg:py-6 z-40 vision-glass shadow-2xl transition-all duration-500" aria-label="Spatial Controls">
        <div className="flex lg:flex-col items-center gap-4 w-full justify-around lg:justify-center">
          
          <button
            onClick={() => setActiveDockTab('dashboard')}
            className={`vision-btn-icon ${activeDockTab === 'dashboard' ? 'vision-btn-icon-active' : ''}`}
            title="Dashboard Overview"
            aria-label="Dashboard Overview"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveDockTab('add')}
            className={`vision-btn-icon ${activeDockTab === 'add' ? 'vision-btn-icon-active' : ''}`}
            title="Register Companion"
            aria-label="Register Companion"
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveDockTab('settings')}
            className={`vision-btn-icon ${activeDockTab === 'settings' ? 'vision-btn-icon-active' : ''}`}
            title="Spatial Options"
            aria-label="Spatial Options"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Glowing Glass Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="vision-btn-icon border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60"
            title="Switch Language / สลับภาษา"
            aria-label="Switch Language / สลับภาษา"
          >
            <Globe className="w-5 h-5" />
          </button>

        </div>

        <div className="hidden lg:flex flex-col items-center gap-4 pb-2">
          <span className="text-[9px] font-bold text-gray-400 font-mono uppercase">{lang}</span>
        </div>
      </nav>

      {/* Main Glass Workspace View */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[700px]">
        
        {/* Left 2 Columns: Floating dashboard cards */}
        <div className="lg:col-span-2 space-y-6">

          {/* Vision OS Sub Header Alert */}
          {isMockMode && (
            <div className="p-4 rounded-3xl border border-white/10 vision-glass flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  🧬
                </div>
                <div>
                  <h3 className="font-bold text-xs">{currentT.sandboxTitle}</h3>
                  <p className="text-[10px] text-gray-400">{currentT.sandboxDesc}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-white/10 text-gray-300 border border-white/10 px-2 py-0.5 rounded-full">
                {currentT.sandboxBadge}
              </span>
            </div>
          )}

          {/* Active spatial overview or setting layout based on Left Dock selection */}
          {activeDockTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Search & Quick Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{currentT.title}</h2>
                  <p className="text-xs text-gray-400">{currentT.subtitle}</p>
                </div>

                {/* Spatial Search Bar */}
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentT.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-white/5 bg-white/5 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Spatial dials / quick metrics */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="Garden Vital Signs">
                <div className="p-4 rounded-3xl vision-glass flex flex-col justify-between h-24 hover:scale-[1.02] transition-transform">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{currentT.totalCollection}</span>
                  <span className="text-3xl font-extrabold font-mono mt-1 text-white">{totalPlantsCount}</span>
                </div>
                <div className="p-4 rounded-3xl vision-glass flex flex-col justify-between h-24 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">{currentT.wateredToday}</span>
                    {wateredTodayCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />}
                  </div>
                  <span className="text-3xl font-extrabold font-mono mt-1 text-blue-400">{wateredTodayCount}</span>
                </div>
                <div className="p-4 rounded-3xl vision-glass flex flex-col justify-between h-24 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none">{currentT.fertilizedToday}</span>
                    {fertilizedTodayCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                  </div>
                  <span className="text-3xl font-extrabold font-mono mt-1 text-amber-500">{fertilizedTodayCount}</span>
                </div>
                <div className="p-4 rounded-3xl vision-glass flex flex-col justify-between h-24 hover:scale-[1.02] transition-transform">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">{currentT.trackedPlants}</span>
                  <span className="text-3xl font-extrabold font-mono mt-1 text-emerald-400">{trackedCompanionsCount}</span>
                </div>
              </section>

              {/* Dynamic Quick Filters (Category-based) */}
              <div className="flex bg-white/5 p-1 rounded-full border border-white/5 w-full sm:w-fit items-center gap-1 overflow-x-auto scrollbar-none whitespace-nowrap">
                <button
                  id="tab-all"
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-white text-[#05080c] shadow'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {lang === 'en' ? 'All Companions' : 'ทั้งหมด'}
                </button>
                <button
                  id="tab-flowering"
                  onClick={() => setActiveTab('ไม้ดอก')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'ไม้ดอก'
                      ? 'bg-white text-[#05080c] shadow'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🌸 {lang === 'en' ? 'Flowering' : 'ไม้ดอก'}
                </button>
                <button
                  id="tab-herbs"
                  onClick={() => setActiveTab('สมุนไพร')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'สมุนไพร'
                      ? 'bg-white text-[#05080c] shadow'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🌿 {lang === 'en' ? 'Herbs' : 'สมุนไพร'}
                </button>
                <button
                  id="tab-foliage"
                  onClick={() => setActiveTab('ไม้ใบ')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'ไม้ใบ'
                      ? 'bg-white text-[#05080c] shadow'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🍃 {lang === 'en' ? 'Foliage' : 'ไม้ใบ'}
                </button>
                <button
                  id="tab-ornamental"
                  onClick={() => setActiveTab('ไม้ประดับ')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'ไม้ประดับ'
                      ? 'bg-white text-[#05080c] shadow'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🪴 {lang === 'en' ? 'Ornamental' : 'ไม้ประดับ'}
                </button>
              </div>

              {/* Grid of spatial cards */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-60 rounded-[1.75rem] vision-glass animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : filteredPlants.length === 0 ? (
                <div className="p-16 text-center rounded-[2rem] border border-dashed border-white/10 vision-glass">
                  <Sprout className="w-8 h-8 text-gray-400 mx-auto animate-bounce" />
                  <h3 className="mt-4 font-bold text-sm">{currentT.noPlantsTitle}</h3>
                  <p className="text-xs text-gray-400 mt-1">{currentT.noPlantsDesc}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredPlants.map((plant) => {
                    const selected = selectedPlant?.id === plant.id;
                    
                    const formatLastCareDate = (dateStr?: Date | string) => {
                      if (!dateStr) return currentT.never;
                      const date = new Date(dateStr);
                      if (isCaredToday(date)) return lang === 'en' ? 'Today 🌟' : 'วันนี้ 🌟';
                      
                      // Check if yesterday
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      if (date.toDateString() === yesterday.toDateString()) {
                        return lang === 'en' ? 'Yesterday' : 'เมื่อวานนี้';
                      }
                      
                      return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    };

                    return (
                      <div
                        key={plant.id}
                        onClick={() => { setSelectedPlant(plant); setIsMobileDetailOpen(true); }}
                        onMouseMove={handleSpotlightMouseMove}
                        className={`p-6 vision-card flex flex-col justify-between h-64 cursor-pointer relative vision-spotlight transition-all ${
                          selected 
                            ? 'border-white/35 bg-white/[0.12] ring-2 ring-white/15' 
                            : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {/* 3D-like glowing emoji avatar container */}
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner shadow-white/5">
                                {getPlantEmoji(plant.category)}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-base tracking-tight leading-snug">{plant.name}</h3>
                                {plant.nickname && (
                                  <p className="text-[10px] text-gray-400 italic">"{plant.nickname}"</p>
                                )}
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border mt-2 ${getCategoryStyles(plant.category)}`}>
                                  {translateCategory(plant.category)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 items-end">
                              {isCaredToday(plant.lastWateredAt) || isCaredToday(plant.lastFertilizedAt) ? (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  {lang === 'en' ? 'Cared Today' : 'ดูแลแล้ววันนี้'}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                                  {lang === 'en' ? 'Pending Observation' : 'รอดำเนินการสังเกต'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Last Care Activity Metrics */}
                          <div className="mt-5 space-y-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1.5 text-gray-400">
                                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                                {currentT.lastWatered}
                              </span>
                              <span className="font-semibold text-white text-[11px] font-mono">
                                {formatLastCareDate(plant.lastWateredAt)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1.5 text-gray-400">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                {currentT.lastFertilized}
                              </span>
                              <span className="font-semibold text-white text-[11px] font-mono">
                                {plant.fertilizerType === 'ยังไม่ใส่' ? '-' : formatLastCareDate(plant.lastFertilizedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Care Actions footer */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-3">
                          <span className="text-[10px] text-gray-400 font-semibold font-mono flex items-center gap-1">
                            🧪 {plant.fertilizerType === 'ยังไม่ใส่' ? '-' : plant.fertilizerType}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              id={`delete-btn-${plant.id}`}
                              onClick={(e) => handleDelete(plant.id, e)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all hover:scale-105"
                              title="Delete registry"
                              aria-label="Delete registry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              id={`water-btn-${plant.id}`}
                              onClick={(e) => handleQuickWater(plant, e)}
                              className="px-3.5 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-blue-950 font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1 transition-all hover:scale-105"
                              title="Log water Care Action"
                            >
                              💧 {currentT.waterBtn}
                            </button>

                            {plant.fertilizerType !== 'ยังไม่ใส่' && (
                              <button
                                id={`feed-btn-${plant.id}`}
                                onClick={(e) => handleQuickFeed(plant, e)}
                                className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all hover:scale-105"
                                title="Log feed Care Action"
                              >
                                🧪 {currentT.feedBtn}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* Left Dock selection: Register new plant panel */}
          {activeDockTab === 'add' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{currentT.registerTitle}</h2>
                <p className="text-xs text-gray-400">{currentT.registerSubtitle}</p>
              </div>

              <section className="p-6 rounded-[2rem] vision-glass border border-white/10 space-y-6" aria-labelledby="form-section-title">
                <h3 id="form-section-title" className="sr-only">New Plant Registry Information</h3>
                <form onSubmit={handleCreatePlant} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="plant-name" className="text-xs font-semibold text-gray-300">
                        {currentT.formCommonName}
                      </label>
                      <input
                        id="plant-name"
                        type="text"
                        placeholder="e.g. แพรเซี่ยงไฮ้ / Moss Rose"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/5 bg-white/5 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="plant-nickname" className="text-xs font-semibold text-gray-300">
                        {currentT.formNickname}
                      </label>
                      <input
                        id="plant-nickname"
                        type="text"
                        placeholder="e.g. Daisy 1"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/5 bg-white/5 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="plant-category" className="text-xs font-semibold text-gray-300">
                        {currentT.formCategory}
                      </label>
                      <select
                        id="plant-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/5 bg-[#0e1622] focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      >
                        <option value="ไม้ดอก">{lang === 'en' ? 'Flowering (ไม้ดอก)' : 'ไม้ดอก (Flowering)'}</option>
                        <option value="สมุนไพร">{lang === 'en' ? 'Herb (สมุนไพร)' : 'สมุนไพร (Herb)'}</option>
                        <option value="ไม้ใบ">{lang === 'en' ? 'Foliage (ไม้ใบ)' : 'ไม้ใบ (Foliage)'}</option>
                        <option value="ไม้ประดับ">{lang === 'en' ? 'Ornamental (ไม้ประดับ)' : 'ไม้ประดับ (Ornamental)'}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fertilizer-type" className="text-xs font-semibold text-gray-300">
                        {currentT.formFertilizer}
                      </label>
                      <select
                        id="fertilizer-type"
                        value={fertilizerType}
                        onChange={(e) => setFertilizerType(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/5 bg-[#0e1622] focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      >
                        <option value="กลาง (16-16-16)">กลาง (16-16-16) - {lang === 'en' ? 'Multipurpose' : 'สูตรทั่วไป'}</option>
                        <option value="ดอก (8-24-24)">ดอก (8-24-24) - {lang === 'en' ? 'Flower Booster' : 'เร่งดอก'}</option>
                        <option value="อินทรีย์ (0-0-0)">อินทรีย์ (0-0-0) - {lang === 'en' ? 'Organic/Manure' : 'ปุ๋ยคอก/ธรรมชาติ'}</option>
                        <option value="ใบ (20-10-10)">ใบ (20-10-10) - {lang === 'en' ? 'Foliage Booster' : 'เร่งใบ'}</option>
                        <option value="ยังไม่ใส่">ยังไม่ใส่ - {lang === 'en' ? 'None/Resting' : 'พักฟื้น/ต้นอ่อน'}</option>
                      </select>
                    </div>
                  </div>



                  {formError && <p className="text-xs text-red-400 font-semibold">{formError}</p>}

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      id="cancel-add-btn"
                      type="button"
                      onClick={() => setActiveDockTab('dashboard')}
                      className="px-6 py-2.5 text-xs rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
                    >
                      {currentT.formCancel}
                    </button>
                    <button
                      id="submit-add-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-xs rounded-full bg-white text-[#03060a] font-bold hover:scale-105 transition-all shadow-xl shadow-white/10"
                    >
                      {isSubmitting ? (lang === 'en' ? 'Registering...' : 'กำลังบันทึก...') : currentT.formRegister}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* Left Dock selection: Settings and profile diagnostics */}
          {activeDockTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{currentT.diagTitle}</h2>
                <p className="text-xs text-gray-400">{currentT.diagSubtitle}</p>
              </div>

              <section className="p-6 rounded-[2rem] vision-glass border border-white/10 space-y-6" aria-labelledby="settings-section-title">
                <h3 id="settings-section-title" className="sr-only">Diagnostic Information</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{currentT.diagProjRef}</p>
                    <p className="text-xs font-mono font-bold text-emerald-400">qfqpuuqwvkkiphaqvabm</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{currentT.diagApiGateway}</p>
                    <p className="text-xs font-mono text-gray-300">https://qfqpuuqwvkkiphaqvabm.supabase.co</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{currentT.diagStatus}</p>
                    <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 
                      {currentT.diagActive}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    id="back-diag-btn"
                    onClick={() => setActiveDockTab('dashboard')}
                    className="px-6 py-2.5 text-xs rounded-full bg-white text-[#03060a] font-bold hover:scale-105 transition-all"
                  >
                    {currentT.diagBack}
                  </button>
                </div>
              </section>
            </div>
          )}

        </div>

        {/* Right 1 Column: Holographic detailed Care Card for the active plant */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          
          {selectedPlant ? (
            <section className="p-6 rounded-[2rem] vision-glass border border-white/15 space-y-6 relative overflow-hidden" aria-labelledby="hologram-card-title">
              {/* Decorative spatial ambient overlay */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl z-0" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 id="hologram-card-title" className="text-lg font-bold tracking-tight">{currentT.hologramTitle}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">{currentT.hologramSubtitle}</p>
                </div>
                
                <span className="text-2xl animate-pulse">📡</span>
              </div>

              {/* Main details avatar display */}
              <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-4 shadow-inner">
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-5xl shadow-2xl relative">
                  {getPlantEmoji(selectedPlant.category)}
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#03060a] flex items-center justify-center text-[10px] font-bold">✓</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xl leading-tight">{selectedPlant.name}</h3>
                  {selectedPlant.nickname && (
                    <p className="text-xs text-emerald-400 italic font-medium mt-0.5">"{selectedPlant.nickname}"</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">Registry ID: {selectedPlant.id.substring(0, 8)}...</p>
                </div>

                {/* Specific custom formula details from spreadsheet */}
                <div className="w-full pt-3 border-t border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{currentT.formulaReq}</span>
                  <span className="text-xs font-semibold text-amber-300 block mt-0.5">
                    {selectedPlant.fertilizerType || 'ยังไม่ใส่'}
                  </span>
                  {selectedPlant.fertilizerType !== 'ยังไม่ใส่' && (
                    <p className="text-[10px] text-gray-400 italic mt-1 bg-white/5 p-2 rounded-xl border border-white/5">
                      💡 {getFormulaTip(selectedPlant.fertilizerType)}
                    </p>
                  )}
                </div>
              </div>

              {/* Daily Care Track & Integrated Observation Note Editor */}
              <div className="relative z-10 border-t border-white/5 pt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    📝 {currentT.dailyTrackTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{currentT.dailyTrackSubtitle}</p>
                </div>

                <form onSubmit={handleAddLog} className="space-y-3">
                  {/* Activity Selector Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">{currentT.selectCareType}</span>
                    <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setLogType('water')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'water'
                            ? 'bg-blue-500 text-blue-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        💧 {lang === 'en' ? 'Water' : 'รดน้ำ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogType('feed')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'feed'
                            ? 'bg-amber-500 text-amber-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        🧪 {lang === 'en' ? 'Feed' : 'ใส่ปุ๋ย'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogType('prune')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'prune'
                            ? 'bg-emerald-500 text-emerald-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        ✂️ {lang === 'en' ? 'Prune' : 'ตัดแต่ง'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogType('note')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'note'
                            ? 'bg-purple-500 text-purple-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        📝 {lang === 'en' ? 'Note' : 'บันทึก'}
                      </button>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div className="space-y-1">
                    <textarea
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder={currentT.enterObsNote}
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-white/5 bg-white/5 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 text-white resize-none placeholder:text-gray-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-white text-[#03060a] font-bold text-xs shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-1"
                  >
                    {currentT.btnSubmitTrack}
                  </button>
                </form>
              </div>

              {/* Care action history timeline */}
              <div className="relative z-10 space-y-3.5 border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none">{currentT.logTimelineTitle}</span>
                
                {selectedPlantLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-white/5 p-4 rounded-2xl border border-white/5">
                    {currentT.noLogs}
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {selectedPlantLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:bg-white/10 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {log.actionType === 'water' ? '💧' : log.actionType === 'feed' ? '🧪' : log.actionType === 'prune' ? '✂️' : '🪴'}
                          </span>
                          <div>
                            <p className="font-bold text-gray-200 capitalize">
                              {log.actionType === 'feed' ? currentT.logFertilized : log.actionType === 'water' ? currentT.logWatered : log.actionType}
                            </p>
                            {log.notes && (
                              <p className="text-[10px] text-gray-400 italic mt-0.5">"{log.notes}"</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatTimeAgo(log.loggedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </section>
          ) : (
            <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 vision-glass h-80 flex flex-col items-center justify-center">
              <Info className="w-6 h-6 text-gray-400 animate-pulse" />
              <h3 className="mt-4 font-bold text-sm text-white">{currentT.noNodeSelected}</h3>
              <p className="text-xs text-gray-400 mt-1">{currentT.gazeSelect}</p>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Holographic Drawer Bottom-Sheet */}
      {isMobileDetailOpen && selectedPlant && (
        <div className="fixed inset-x-0 bottom-0 top-0 z-50 lg:hidden flex items-end justify-center bg-[#03060a]/75 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileDetailOpen(false)}>
          <div className="w-full max-h-[82vh] overflow-y-auto rounded-t-[2.5rem] vision-glass border-t border-x border-white/20 p-6 space-y-6 shadow-2xl animate-slide-up relative pb-24" onClick={(e) => e.stopPropagation()}>
            {/* Drawer line indicator */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" onClick={() => setIsMobileDetailOpen(false)} />

            <div className="space-y-5 animate-fade-in">

              {/* Main details avatar display */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-4 shadow-inner">
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-5xl shadow-2xl relative">
                  {getPlantEmoji(selectedPlant.category)}
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#03060a] flex items-center justify-center text-[10px] font-bold">✓</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xl leading-tight">{selectedPlant.name}</h3>
                  {selectedPlant.nickname && (
                    <p className="text-xs text-emerald-400 italic font-medium mt-0.5">"{selectedPlant.nickname}"</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">Registry ID: {selectedPlant.id.substring(0, 8)}...</p>
                </div>

                {/* Specific custom formula details */}
                <div className="w-full pt-3 border-t border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{currentT.formulaReq}</span>
                  <span className="text-xs font-semibold text-amber-300 block mt-0.5">
                    {selectedPlant.fertilizerType || 'ยังไม่ใส่'}
                  </span>
                  {selectedPlant.fertilizerType !== 'ยังไม่ใส่' && (
                    <p className="text-[10px] text-gray-400 italic mt-1 bg-white/5 p-2 rounded-xl border border-white/5">
                      💡 {getFormulaTip(selectedPlant.fertilizerType)}
                    </p>
                  )}
                </div>
              </div>

              {/* Last Care Activity Metrics */}
              <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Droplet className="w-3.5 h-3.5 text-blue-400" />
                    {currentT.lastWatered}
                  </span>
                  <span className="font-semibold text-white text-[11px] font-mono">
                    {selectedPlant.lastWateredAt ? new Date(selectedPlant.lastWateredAt).toLocaleDateString() : currentT.never}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {currentT.lastFertilized}
                  </span>
                  <span className="font-semibold text-white text-[11px] font-mono">
                    {selectedPlant.fertilizerType === 'ยังไม่ใส่' ? '-' : (selectedPlant.lastFertilizedAt ? new Date(selectedPlant.lastFertilizedAt).toLocaleDateString() : currentT.never)}
                  </span>
                </div>
              </div>

              {/* Daily Care Track & Integrated Observation Note Editor */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    📝 {currentT.dailyTrackTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{currentT.dailyTrackSubtitle}</p>
                </div>

                <form onSubmit={async (e) => {
                  await handleAddLog(e);
                  setIsMobileDetailOpen(false);
                }} className="space-y-3">
                  {/* Activity Selector Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">{currentT.selectCareType}</span>
                    <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setLogType('water')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'water'
                            ? 'bg-blue-500 text-blue-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        💧 {lang === 'en' ? 'Water' : 'รดน้ำ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogType('feed')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'feed'
                            ? 'bg-amber-500 text-amber-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        🧪 {lang === 'en' ? 'Feed' : 'ใส่ปุ๋ย'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogType('prune')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'prune'
                            ? 'bg-emerald-500 text-emerald-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        ✂️ {lang === 'en' ? 'Prune' : 'ตัดแต่ง'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogType('note')}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logType === 'note'
                            ? 'bg-purple-500 text-purple-950 font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        📝 {lang === 'en' ? 'Note' : 'บันทึก'}
                      </button>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div className="space-y-1">
                    <textarea
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder={currentT.enterObsNote}
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-white/5 bg-white/5 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 text-white resize-none placeholder:text-gray-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-white text-[#03060a] font-bold text-xs shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-1"
                  >
                    {currentT.btnSubmitTrack}
                  </button>
                </form>
              </div>

              {/* Care action history timeline */}
              <div className="space-y-3.5 border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none">{currentT.logTimelineTitle}</span>
                
                {selectedPlantLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-white/5 p-4 rounded-2xl border border-white/5">
                    {currentT.noLogs}
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {selectedPlantLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:bg-white/10 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {log.actionType === 'water' ? '💧' : log.actionType === 'feed' ? '🧪' : log.actionType === 'prune' ? '✂️' : '🪴'}
                          </span>
                          <div>
                            <p className="font-bold text-gray-200 capitalize">
                              {log.actionType === 'feed' ? currentT.logFertilized : log.actionType === 'water' ? currentT.logWatered : log.actionType}
                            </p>
                            {log.notes && (
                              <p className="text-[10px] text-gray-400 italic mt-0.5">"{log.notes}"</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatTimeAgo(log.loggedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
