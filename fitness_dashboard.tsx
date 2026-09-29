import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Zap, Heart, Flame, Trophy, FlameIcon, Award, RefreshCw, 
  Upload, Download, Plus, Check, AlertCircle, Calendar, ChevronRight, 
  Settings, Mountain, PieChart, BarChart2, Shield, Play, HelpCircle, 
  Compass, ArrowUpRight, TrendingUp, Dumbbell, Bike, Waves, Running
} from 'lucide-react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePie, Pie 
} from 'recharts';

// Sample Fitness & Freshness Data (CTL, ATL, TSB) over 30 days
const initialFitnessData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const ctl = Math.round(45 + Math.sin(i / 3) * 8 + i * 0.4); // Fitness
  const atl = Math.round(50 + Math.sin(i / 1.5) * 20 + (i % 5 === 0 ? 35 : 0)); // Fatigue
  const tsb = ctl - atl; // Form
  return {
    date: `Sep ${day}`,
    CTL: ctl,
    ATL: atl,
    TSB: tsb
  };
});

// Sample HR Zone Distribution
const hrZoneData = [
  { name: 'Z1 Recovery', value: 15, color: '#3B82F6' },
  { name: 'Z2 Endurance', value: 45, color: '#10B981' },
  { name: 'Z3 Tempo', value: 20, color: '#F59E0B' },
  { name: 'Z4 Threshold', value: 12, color: '#EF4444' },
  { name: 'Z5 VO2 Max', value: 8, color: '#8B5CF6' }
];

// Sample Personal Bests
const initialPBs = {
  Run: [
    { id: 1, title: '5k Run', value: '19:42', date: '2026-08-14', progress: 92, target: '19:00', icon: '🏃' },
    { id: 2, title: '10k Run', value: '41:15', date: '2026-07-22', progress: 85, target: '40:00', icon: '🏃' },
    { id: 3, title: 'Half Marathon', value: '1:32:10', date: '2026-05-10', progress: 95, target: '1:30:00', icon: '🏃' },
    { id: 4, title: 'Marathon', value: '3:24:05', date: '2025-11-04', progress: 78, target: '3:15:00', icon: '🏃' },
  ],
  Ride: [
    { id: 5, title: 'FTP (20-min Max)', value: '295 W', date: '2026-09-02', progress: 88, target: '310 W', icon: '🚴' },
    { id: 6, title: 'Max Power (5s)', value: '1120 W', date: '2026-08-30', progress: 94, target: '1200 W', icon: '🚴' },
    { id: 7, title: '100km Speed', value: '31.4 km/h', date: '2026-06-18', progress: 80, target: '33.0 km/h', icon: '🚴' },
  ],
  Swim: [
    { id: 8, title: '100m Freestyle', value: '1:12', date: '2026-08-01', progress: 90, target: '1:08', icon: '🏊' },
    { id: 9, title: '1500m Swim', value: '23:45', date: '2026-04-12', progress: 82, target: '22:30', icon: '🏊' },
  ],
  Gym: [
    { id: 10, title: 'Deadlift', value: '185 kg', date: '2026-09-12', progress: 92, target: '200 kg', icon: '🏋️' },
    { id: 11, title: 'Back Squat', value: '145 kg', date: '2026-08-25', progress: 86, target: '150 kg', icon: '🏋️' },
    { id: 12, title: 'Bench Press', value: '110 kg', date: '2026-07-19', progress: 95, target: '115 kg', icon: '🏋️' },
  ]
};

// Recommended Workouts Library
const workoutSuggestions = [
  {
    id: 'w1',
    title: '4x5 min VO2 Max Explosions',
    sport: 'Ride',
    intensity: 'High',
    tsbCondition: 'fresh', // suitable when TSB > -5
    duration: '60 mins',
    tss: 82,
    description: 'High-intensity intervals designed to expand aerobic capacity and increase peak power output.',
    structure: [
      { phase: 'Warmup', duration: '15 min', intensity: '50-70% FTP' },
      { phase: 'Intervals', duration: '4x5 min @ 115% FTP', intensity: 'High (Z5)', recovery: '4 min easy spin' },
      { phase: 'Cooldown', duration: '10 min', intensity: '45% FTP' }
    ]
  },
  {
    id: 'w2',
    title: 'Zone 2 Foundation Aerobic Run',
    sport: 'Run',
    intensity: 'Low',
    tsbCondition: 'fatigued', // suitable when TSB < -10
    duration: '45 mins',
    tss: 38,
    description: 'Easy conversational tempo run to build mitochondrial density without strain.',
    structure: [
      { phase: 'Warmup', duration: '5 min', intensity: 'Easy Walk/Jog' },
      { phase: 'Main Set', duration: '35 min', intensity: '65-75% HR Max (Zone 2)' },
      { phase: 'Cooldown', duration: '5 min', intensity: 'Walk & Light Stretch' }
    ]
  },
  {
    id: 'w3',
    title: 'Over-Under Threshold Intervals',
    sport: 'Ride',
    intensity: 'Hard',
    tsbCondition: 'optimal',
    duration: '75 mins',
    tss: 95,
    description: 'Alternate between 2 mins slightly above FTP and 2 mins slightly below to push lactate clearance.',
    structure: [
      { phase: 'Warmup', duration: '20 min', intensity: 'Progressive to 80% FTP' },
      { phase: 'Main Set', duration: '3x (3x 2min @ 105% / 2min @ 90%)', intensity: 'Zone 4/5' },
      { phase: 'Cooldown', duration: '10 min', intensity: 'Easy Spin' }
    ]
  },
  {
    id: 'w4',
    title: '5k Pace Tempo Progression Run',
    sport: 'Run',
    intensity: 'Medium-High',
    tsbCondition: 'fresh',
    duration: '50 mins',
    tss: 65,
    description: 'Build pace steadily every 10 minutes finishing near target 5k pace.',
    structure: [
      { phase: 'Warmup', duration: '10 min', intensity: 'Zone 1/2' },
      { phase: 'Progression', duration: '30 min (10m Z2 -> 10m Z3 -> 10m Z4)', intensity: 'Building Effort' },
      { phase: 'Cooldown', duration: '10 min', intensity: 'Zone 1' }
    ]
  }
];

export default function App() {
  const [activeSport, setActiveSport] = useState('All');
  const [syncStatus, setSyncStatus] = useState({
    strava: { connected: true, lastSync: '12 mins ago', totalActivities: 420 },
    garmin: { connected: true, lastSync: '1 hour ago', totalActivities: 680 },
    intervals: { connected: true, lastSync: 'Just now', totalActivities: 310 }
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [pbs, setPbs] = useState(initialPBs);
  const [fitnessData, setFitnessData] = useState(initialFitnessData);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [customDataModal, setCustomDataModal] = useState(false);

  // Calculated current form metrics
  const latestMetrics = useMemo(() => {
    const last = fitnessData[fitnessData.length - 1];
    return {
      ctl: last ? last.CTL : 0,
      atl: last ? last.ATL : 0,
      tsb: last ? last.TSB : 0
    };
  }, [fitnessData]);

  // Dynamic status text based on TSB
  const formStatus = useMemo(() => {
    const { tsb } = latestMetrics;
    if (tsb > 10) return { label: 'Fresh / Tapering', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (tsb >= -10 && tsb <= 10) return { label: 'Optimal Training Zone', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    if (tsb >= -25 && tsb < -10) return { label: 'Productive Fatigue', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { label: 'High Fatigue / Overreaching', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  }, [latestMetrics]);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncStatus({
        strava: { ...syncStatus.strava, lastSync: 'Just now' },
        garmin: { ...syncStatus.garmin, lastSync: 'Just now' },
        intervals: { ...syncStatus.intervals, lastSync: 'Just now' }
      });
      setIsSyncing(false);
    }, 1500);
  };

  const handleToggleConnection = (platform) => {
    setSyncStatus(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        connected: !prev[platform].connected
      }
    }));
  };

  const handleDownloadZWO = (workout) => {
    const xmlContent = `
<workout_file>
  <author>Apex Fitness AI</author>
  <name>${workout.title}</name>
  <description>${workout.description}</description>
  <sportType>${workout.sport.toLowerCase()}</sportType>
  <workout>
    <Warmup Duration="900" PowerLow="0.5" PowerHigh="0.7"/>
    <IntervalsT Repeat="4" OnDuration="300" OffDuration="240" OnPower="1.15" OffPower="0.5"/>
    <Cooldown Duration="600" PowerLow="0.7" PowerHigh="0.4"/>
  </workout>
</workout_file>`.trim();

    const element = document.createElement("a");
    const file = new Blob([xmlContent], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = `${workout.title.replace(/\s+/g, '_')}.zwo`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-4 md:p-8 selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Activity className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PULSE // ATHLETE ENGINE
              </h1>
              <p className="text-sm text-slate-400">Unified Analytics • Strava • Garmin • Intervals.icu</p>
            </div>
          </div>
        </div>

        {/* Sync Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:border-cyan-500/50 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Feeds...' : 'Sync All Platforms'}
          </button>

          <button 
            onClick={() => setCustomDataModal(true)}
            className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Import / Custom Data
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* SECTION 1: Connected Apps & Sync Status */}
        {}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strava Card */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-orange-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
                STR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Strava</span>
                  <span className={`w-2 h-2 rounded-full ${syncStatus.strava.connected ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                </div>
                <p className="text-xs text-slate-400">Synced {syncStatus.strava.lastSync} • {syncStatus.strava.totalActivities} acts</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggleConnection('strava')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                syncStatus.strava.connected 
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30' 
                  : 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              {syncStatus.strava.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Garmin Card */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                GAR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Garmin Connect</span>
                  <span className={`w-2 h-2 rounded-full ${syncStatus.garmin.connected ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                </div>
                <p className="text-xs text-slate-400">Synced {syncStatus.garmin.lastSync} • {syncStatus.garmin.totalActivities} acts</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggleConnection('garmin')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                syncStatus.garmin.connected 
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30' 
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              {syncStatus.garmin.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Intervals.icu Card */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                ICU
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Intervals.icu</span>
                  <span className={`w-2 h-2 rounded-full ${syncStatus.intervals.connected ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                </div>
                <p className="text-xs text-slate-400">Synced {syncStatus.intervals.lastSync} • {syncStatus.intervals.totalActivities} acts</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggleConnection('intervals')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                syncStatus.intervals.connected 
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30' 
                  : 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
              }`}
            >
              {syncStatus.intervals.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </section>

        {/* SECTION 2: Fitness & Freshness Curve (Intervals.icu Style) */}
        {}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">Fitness & Freshness Curve</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">CTL (Fitness), ATL (Fatigue) and TSB (Form) modeling</p>
            </div>

            {/* Current Metrics Pill Banner */}
            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 px-4 text-xs">
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Fitness (CTL)</span>
                <span className="text-lg font-bold text-cyan-400">{latestMetrics.ctl}</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Fatigue (ATL)</span>
                <span className="text-lg font-bold text-rose-400">{latestMetrics.atl}</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Form (TSB)</span>
                <span className={`text-lg font-bold ${latestMetrics.tsb >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {latestMetrics.tsb > 0 ? `+${latestMetrics.tsb}` : latestMetrics.tsb}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className={`px-3 py-1 rounded-xl text-xs font-semibold border ${formStatus.bg} ${formStatus.color} ${formStatus.border}`}>
                {formStatus.label}
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fitnessData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Line type="monotone" dataKey="CTL" name="Fitness (CTL)" stroke="#06b6d4" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="ATL" name="Fatigue (ATL)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="TSB" name="Form (TSB)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* SECTION 3: Personal Bests (PBs) Display */}
        {}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold tracking-tight text-white">Personal Best Records</h2>
            </div>

            {/* Sport Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              {['All', 'Run', 'Ride', 'Swim', 'Gym'].map(sport => (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSport === sport 
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* PB Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(pbs)
              .filter(([sport]) => activeSport === 'All' || activeSport === sport)
              .flatMap(([_, records]) => records)
              .map(record => (
                <div key={record.id} className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{record.icon}</span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                      {record.date}
                    </span>
                  </div>
                  
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{record.title}</h3>
                  <p className="text-2xl font-black text-white mt-1 group-hover:text-cyan-400 transition-colors">
                    {record.value}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                      <span>Target: {record.target}</span>
                      <span className="text-cyan-400 font-semibold">{record.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${record.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* SECTION 4: Fun Equivalent Data & Heart Rate Breakdown */}
        {}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Fun Equivalents Card */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">Fun Fitness Equivalents</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Everest Equivalent */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    <Mountain className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Elevation Climbed</p>
                    <p className="text-xl font-black text-white mt-0.5">3.4x Mt. Everest</p>
                    <p className="text-[11px] text-slate-500 mt-1">30,083 m out of 8,848 m</p>
                  </div>
                </div>

                {/* Pizza Calorie Equivalent */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                    <FlameIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Calories Burned Equivalent</p>
                    <p className="text-xl font-black text-white mt-0.5">142 Pizza Slices 🍕</p>
                    <p className="text-[11px] text-slate-500 mt-1">Approx. 40,470 kcal burned</p>
                  </div>
                </div>

                {/* Earth Circumference Equivalent */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Distance Covered</p>
                    <p className="text-xl font-black text-white mt-0.5">8.2% Around Earth 🌍</p>
                    <p className="text-[11px] text-slate-500 mt-1">3,280 km logged lifetime</p>
                  </div>
                </div>

                {/* Sweat Loss Equivalent */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                    <Waves className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Estimated Sweat Lost</p>
                    <p className="text-xl font-black text-white mt-0.5">48.5 Gallons 💧</p>
                    <p className="text-[11px] text-slate-500 mt-1">Roughly 360 drink bottles filled</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
              <span>Equivalents updated based on connected Strava & Garmin cumulative metrics.</span>
            </div>
          </div>

          {/* Heart Rate Zones Pie Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">HR Zone Breakdown</h2>
              </div>
              
              <div className="h-48 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RePie>
                    <Pie 
                      data={hrZoneData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={75} 
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {hrZoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                  </RePie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* HR Zone Legend */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
              {hrZoneData.map((zone) => (
                <div key={zone.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="text-slate-300 font-medium">{zone.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{zone.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: AI Workout Suggestions & Library */}
        {}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">AI Engine Workout Suggestions</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Recommended structured workouts based on current Form (TSB: {latestMetrics.tsb})</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Form Adaptability:</span>
              <span className={`text-xs px-3 py-1 rounded-full border font-bold ${formStatus.bg} ${formStatus.color} ${formStatus.border}`}>
                {latestMetrics.tsb > 0 ? 'High Capacity for Intensity' : 'Aerobic / Light Recommended'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutSuggestions.map((workout) => (
              <div 
                key={workout.id} 
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                        workout.sport === 'Ride' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {workout.sport}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">tss ~ {workout.tss} • {workout.duration}</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      workout.intensity === 'High' || workout.intensity === 'Hard'
                        ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {workout.intensity} Effort
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{workout.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{workout.description}</p>

                  {/* Intervals structure preview */}
                  <div className="space-y-1.5 bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 text-xs mb-4">
                    {workout.structure.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold text-slate-400">{step.phase}:</span>
                        <span className="font-mono text-cyan-400">{step.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  <button 
                    onClick={() => handleDownloadZWO(workout)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl py-2 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Export .ZWO
                  </button>
                  <button 
                    onClick={() => setSelectedWorkout(workout)}
                    className="flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-4 py-2 text-xs transition-colors shadow-md shadow-cyan-500/10"
                  >
                    View Structure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL: Import Custom Data */}
      {}
      {customDataModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Import Activity / Custom Data</h3>
              <button 
                onClick={() => setCustomDataModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">Upload GPX, FIT, JSON or CSV activity metrics to manually calculate CTL/ATL scores.</p>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">Drag & Drop files here</p>
              <p className="text-[11px] text-slate-500 mt-1">Supports .FIT, .GPX, .JSON, .CSV</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setCustomDataModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setCustomDataModal(false);
                  alert('Sample FIT/JSON file parsed! Fitness metrics updated.');
                }}
                className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
              >
                Simulate Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Workout Details */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {selectedWorkout.sport}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedWorkout.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedWorkout(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedWorkout.description}</p>

            <div className="space-y-2 bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Workout Structure</h4>
              {selectedWorkout.structure.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white block">{step.phase}</span>
                    <span className="text-slate-400 text-[11px]">{step.intensity}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {step.duration}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => handleDownloadZWO(selectedWorkout)}
                className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                Download Structured File (.ZWO)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}