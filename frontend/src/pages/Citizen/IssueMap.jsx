import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  Wrench, 
  Layers, 
  LocateFixed, 
  Plus, 
  Minus, 
  Map as MapIcon, 
  X, 
  MapPin, 
  BrainCircuit, 
  Eye, 
  Share2,
  Filter,
  ChevronRight,
  Clock,
  ThumbsUp,
  Zap,
  Navigation,
  Lightbulb,
  Flame,
  Siren,
  Car,
  Phone,
  ChevronUp,
  ChevronDown,
  Radio
} from 'lucide-react';

/* ── Emergency / Immediate Incidents ── */
const emergencyAlerts = [
  {
    id: 'e1',
    type: 'fire',
    title: 'আগুন লেগেছে — মিরপুর ১১ মার্কেট',
    location: 'Mirpur 11, Kazipara Bazar',
    time: '৫ মিনিট আগে',
    icon: Flame,
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-300',
    bgLight: 'bg-orange-50',
    position: { top: '30%', left: '40%' },
    emergency: '199',
    details: 'কাজীপাড়া বাজারে দোকানে আগুন লেগেছে। ফায়ার সার্ভিসকে জানানো হয়েছে। এলাকাবাসী সরে যাওয়ার অনুরোধ করা হচ্ছে।',
  },
  {
    id: 'e2',
    type: 'accident',
    title: 'সড়ক দুর্ঘটনা — মিরপুর ১০ ফ্লাইওভার',
    location: 'Mirpur 10 Flyover, Begum Rokeya Sarani',
    time: '১২ মিনিট আগে',
    icon: Car,
    color: 'bg-rose-600',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-300',
    bgLight: 'bg-rose-50',
    position: { top: '42%', left: '35%' },
    emergency: '999',
    details: 'ফ্লাইওভারে দুটি যানবাহনের সংঘর্ষ হয়েছে। আহতদের হাসপাতালে নেওয়া হচ্ছে। যানজট সৃষ্টি হয়েছে — বিকল্প রাস্তা ব্যবহার করুন।',
  },
  {
    id: 'e3',
    type: 'gas',
    title: 'গ্যাস লিক — মিরপুর ২ আবাসিক এলাকা',
    location: 'Mirpur 2, Block-F, Road 3',
    time: '২৫ মিনিট আগে',
    icon: AlertTriangle,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    bgLight: 'bg-yellow-50',
    position: { top: '60%', left: '68%' },
    emergency: '199',
    details: 'ব্লক-এফ এ গ্যাস লিক শনাক্ত হয়েছে। তিতাস গ্যাসকে জানানো হয়েছে। আশেপাশের বাসিন্দাদের আগুন থেকে দূরে থাকার পরামর্শ দেওয়া হচ্ছে।',
  },
];

// Static emergency alerts can stay for demonstration, as they are separate from reports


const filters = [
  { label: 'All Issues', icon: MapIcon, active: true },
  { label: 'Critical', icon: AlertTriangle, color: 'text-red-500' },
  { label: 'Water', icon: Droplets, color: 'text-blue-500' },
  { label: 'Waste', icon: Trash2, color: 'text-emerald-500' },
  { label: 'Roads', icon: Wrench, color: 'text-amber-500' },
];

const IssueMap = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All Issues');
  const [showList, setShowList] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  
  // New state for API data
  const [apiReports, setApiReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getActiveReports('', 20); // Get up to 20 recent reports
        setApiReports(data.reports);
      } catch (error) {
        console.error('Failed to fetch map reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Map backend categories to UI icons and colors
  const getCategoryStyling = (category) => {
    switch (category) {
      case 'Infrastructure': return { icon: Wrench, color: 'bg-amber-500', colorLight: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-200' };
      case 'Waste Management': return { icon: Trash2, color: 'bg-emerald-500', colorLight: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-200' };
      case 'Utilities': return { icon: Droplets, color: 'bg-blue-500', colorLight: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' };
      case 'Safety': return { icon: AlertTriangle, color: 'bg-red-500', colorLight: 'bg-red-50', textColor: 'text-red-600', borderColor: 'border-red-200' };
      case 'Transportation': return { icon: Car, color: 'bg-indigo-500', colorLight: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-200' };
      default: return { icon: Layers, color: 'bg-gray-500', colorLight: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' };
    }
  };

  // Convert backend data to IssueMap format
  const issueData = apiReports.map((report, index) => {
    const style = getCategoryStyling(report.category);
    // Hardcoded pseudo-random positions for static map visual
    const positions = [
      { top: '35%', left: '50%' },
      { top: '22%', left: '62%' },
      { top: '55%', left: '30%' },
      { top: '65%', left: '55%' },
      { top: '48%', left: '72%' },
      { top: '30%', left: '20%' },
      { top: '70%', left: '40%' },
      { top: '40%', left: '80%' },
      { top: '80%', left: '60%' },
      { top: '50%', left: '25%' }
    ];
    const pos = positions[index % positions.length];
    
    // Calculate simple age
    const ageDays = Math.floor((new Date() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
    const ageStr = ageDays > 0 ? `${ageDays}d` : 'Today';

    // Parse severity
    let severityStr = 'Medium';
    if (report.aiAnalysis && report.aiAnalysis.severity && report.aiAnalysis.severity !== 'Unknown') {
      severityStr = report.aiAnalysis.severity;
    }

    return {
      id: report._id,
      type: report.category.toLowerCase(),
      title: report.title,
      location: report.location,
      reports: report.upvoteCount || 1,
      age: ageStr,
      radius: '20m',
      severity: severityStr,
      department: report.category,
      icon: style.icon,
      color: style.color,
      colorLight: style.colorLight,
      textColor: style.textColor,
      borderColor: style.borderColor,
      position: pos,
      count: report.upvoteCount || 1,
      pulse: false,
      aiInsight: report.aiAnalysis?.summary || report.description,
    };
  });

  const visibleAlerts = emergencyAlerts.filter(a => !dismissedAlerts.includes(a.id));

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
    setIsSheetOpen(true);
  };

  const severityColor = {
    Critical: 'text-red-600 bg-red-50 border-red-200',
    High: 'text-blue-600 bg-blue-50 border-blue-200',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <div className="absolute top-16 left-0 right-0 bottom-0 lg:left-80 overflow-hidden bg-background">

//project done
      {/* Map Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600&h=900')" }}
      >
        <div className="absolute inset-0 bg-surface/15 mix-blend-overlay"></div>
      </div>

      {/* Map Markers */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {issueData.map((issue) => (
          <button
            key={issue.id}
            onClick={() => handleMarkerClick(issue)}
            className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: issue.position.top, left: issue.position.left }}
          >
            <div className={`relative flex items-center justify-center ${issue.color} text-white rounded-full shadow-lg border-[3px] border-white transition-transform duration-200 group-hover:scale-125 ${issue.count > 5 ? 'w-12 h-12' : 'w-9 h-9'}`}>
              {issue.pulse && (
                <div className={`absolute inset-0 rounded-full ${issue.color} animate-ping opacity-40`}></div>
              )}
              <issue.icon className={`${issue.count > 5 ? 'w-5 h-5' : 'w-4 h-4'} relative z-10`} strokeWidth={2.5} />
              {issue.count > 1 && (
                <div className={`absolute -top-2 -right-2 bg-white ${issue.textColor} font-bold text-[10px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 ${issue.borderColor} shadow-sm z-20`}>
                  {issue.count}
                </div>
              )}
            </div>
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-outline-variant/20">
              <div className="text-xs font-bold text-on-surface">{issue.title}</div>
              <div className="text-[10px] text-on-surface-variant">{issue.reports} reports • {issue.severity}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-outline-variant/20 rotate-45 -mt-1"></div>
            </div>
          </button>
        ))}

        {/* Emergency Incident Markers */}
        {visibleAlerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
            className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group z-20"
            style={{ top: alert.position.top, left: alert.position.left }}
          >
            <div className={`relative flex items-center justify-center ${alert.color} text-white rounded-full shadow-xl border-[3px] border-white w-14 h-14 transition-transform duration-200 group-hover:scale-110`}>
              <div className={`absolute inset-0 rounded-full ${alert.color} animate-ping opacity-50`}></div>
              <div className={`absolute -inset-2 rounded-full ${alert.color} opacity-20 animate-pulse`}></div>
              <alert.icon className="w-6 h-6 relative z-10" strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md z-20">
                <Siren className={`w-3.5 h-3.5 ${alert.textColor}`} />
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-xl shadow-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-56 border-2 border-red-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Siren className={`w-3.5 h-3.5 ${alert.textColor}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">জরুরি</span>
              </div>
              <div className="text-xs font-bold text-on-surface">{alert.title}</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">{alert.time}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-red-100 rotate-45 -mt-1.5"></div>
            </div>
          </button>
        ))}
      </div>

      {/* Top Header Bar */}
      <div className="absolute left-4 lg:left-6 right-4 lg:right-6 top-4 pointer-events-auto z-20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        {/* Left: Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-outline-variant/20 p-1 flex gap-1 overflow-x-auto max-w-full hide-scrollbar">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-200 active:scale-95 whitespace-nowrap ${
                activeFilter === f.label
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Right: Compact Stats (hidden on mobile) */}
        <div className="hidden lg:flex bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-outline-variant/20 py-2 px-4 items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 border-r border-outline-variant/20 pr-4">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-on-surface">Mirpur, Dhaka</span>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <span>Total: <strong className="text-on-surface">40</strong></span>
            <span className="flex items-center gap-1" title="Critical"><span className="w-2 h-2 rounded-full bg-red-500"></span> 20</span>
            <span className="flex items-center gap-1" title="High"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 7</span>
            <span className="flex items-center gap-1" title="Medium"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 9</span>
            <span className="flex items-center gap-1" title="Low"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 4</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 lg:right-6 bottom-28 lg:bottom-6 flex flex-col gap-2 pointer-events-auto z-20">
        <button 
          onClick={() => setShowList(!showList)}
          className={`w-11 h-11 rounded-xl shadow-md flex items-center justify-center transition-all border ${showList ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-outline-variant/30 hover:text-primary hover:bg-surface-container-low'}`}
          title="Toggle issue list"
        >
          <MapIcon className="w-5 h-5" />
        </button>
        <button className="w-11 h-11 bg-white rounded-xl shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all border border-outline-variant/30" title="My location">
          <Navigation className="w-5 h-5" />
        </button>
        <div className="h-1"></div>
        <div className="flex flex-col bg-white rounded-xl shadow-md border border-outline-variant/30 overflow-hidden">
          <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low border-b border-outline-variant/20 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Issue List Panel (togglable) */}
      <div className={`absolute left-4 lg:left-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] sm:w-96 pointer-events-auto z-20 transition-all duration-300 ${showList ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-outline-variant/20 max-h-80 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/15">
            <h4 className="text-sm font-bold text-on-surface">Nearby Issues ({issueData.length})</h4>
            <button onClick={() => setShowList(false)} className="p-1 rounded-lg hover:bg-surface-container-low transition-colors">
              <X className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
            {issueData.map((issue) => (
              <button
                key={issue.id}
                onClick={() => handleMarkerClick(issue)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-lowest transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${issue.colorLight} ${issue.textColor} flex items-center justify-center flex-shrink-0`}>
                  <issue.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface truncate">{issue.title}</div>
                  <div className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{issue.age}</span>
                    <span>•</span>
                    <span>{issue.reports} reports</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColor[issue.severity]}`}>
                  {issue.severity}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sheet (Detail Panel) */}
      <div 
        className={`fixed bottom-0 left-0 w-full lg:w-[440px] lg:left-auto lg:right-6 lg:bottom-6 lg:max-h-[calc(100vh-8rem)] bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl border border-outline-variant/20 z-40 transition-all duration-300 ease-out ${
          isSheetOpen && selectedIssue ? 'translate-y-0 lg:opacity-100' : 'translate-y-full lg:translate-y-4 lg:opacity-0 lg:pointer-events-none'
        }`}
      >
        {selectedIssue && (
          <>
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-3 lg:hidden cursor-pointer" onClick={() => setIsSheetOpen(false)}>
              <div className="w-10 h-1.5 bg-outline-variant/40 rounded-full"></div>
            </div>

            <div className="p-6 pt-1 lg:pt-6 overflow-y-auto max-h-[70vh] lg:max-h-[calc(100vh-10rem)]">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full border ${severityColor[selectedIssue.severity]}`}>
                      {selectedIssue.severity}
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider rounded-full border border-outline-variant/30">
                      {selectedIssue.department}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface">{selectedIssue.title}</h2>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" /> {selectedIssue.location}
                  </p>
                </div>
                <button 
                  className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors flex-shrink-0 ml-2" 
                  onClick={() => setIsSheetOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { value: selectedIssue.reports, label: 'Reports', color: selectedIssue.textColor },
                  { value: selectedIssue.age, label: 'Age', color: 'text-on-surface' },
                  { value: selectedIssue.radius, label: 'Radius', color: 'text-on-surface' },
                ].map((s, i) => (
                  <div key={i} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-center">
                    <span className={`block text-xl font-bold ${s.color}`}>{s.value}</span>
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              <div className="ai-card rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm text-primary font-bold mb-1 flex items-center gap-1">
                      AI Insight
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{selectedIssue.aiInsight}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link 
                  to={`/issue/${selectedIssue.id}`} 
                  className="flex-1 bg-primary text-white text-sm font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-[#003da8] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Details
                </Link>
                <button className="bg-surface-container-lowest text-on-surface-variant py-3 px-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low hover:text-primary active:scale-95 transition-all flex items-center justify-center gap-2">
                  <ThumbsUp className="w-4 h-4" /> Upvote
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ Emergency Alerts Banner ═══ */}
      {visibleAlerts.length > 0 && (
        <div className="absolute left-4 lg:left-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] sm:w-[420px] pointer-events-auto z-30">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 overflow-hidden">
            {/* Header */}
            <button 
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Siren className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                </div>
                <span className="font-bold text-sm">জরুরি ঘটনা — মিরপুর এলাকা</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{visibleAlerts.length}</span>
              </div>
              {alertsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Alert Items */}
            {alertsExpanded && (
              <div className="max-h-64 overflow-y-auto">
                {visibleAlerts.map((alert, idx) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 ${idx !== visibleAlerts.length - 1 ? 'border-b border-outline-variant/15' : ''} ${selectedAlert?.id === alert.id ? alert.bgLight : 'bg-white'} transition-colors`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl ${alert.bgLight} ${alert.textColor} flex items-center justify-center flex-shrink-0`}>
                        <alert.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${alert.textColor} ${alert.bgLight} px-1.5 py-0.5 rounded border ${alert.borderColor}`}>
                            {alert.type === 'fire' ? '🔥 আগুন' : alert.type === 'accident' ? '🚗 দুর্ঘটনা' : '⚠️ গ্যাস লিক'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {alert.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-on-surface leading-snug">{alert.title}</h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {alert.location}
                        </p>
                        
                        {/* Expanded details */}
                        {selectedAlert?.id === alert.id && (
                          <div className="mt-2 pt-2 border-t border-outline-variant/15">
                            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">{alert.details}</p>
                            <div className="flex gap-2">
                              <a 
                                href={`tel:${alert.emergency}`} 
                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-600 transition-colors active:scale-95"
                              >
                                <Phone className="w-3.5 h-3.5" /> কল করুন {alert.emergency}
                              </a>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDismissedAlerts(prev => [...prev, alert.id]); setSelectedAlert(null); }}
                                className="px-3 py-2 text-xs font-medium text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors active:scale-95"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Expand toggle */}
                      <button 
                        onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                        className="self-start p-1.5 rounded-lg hover:bg-surface-container-low transition-colors flex-shrink-0"
                      >
                        {selectedAlert?.id === alert.id ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default IssueMap;
