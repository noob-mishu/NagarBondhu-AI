import React, { useState } from 'react';
import { 
  Phone, 
  Flame, 
  Shield, 
  Ambulance, 
  Siren,
  AlertTriangle,
  MapPin,
  PhoneCall,
  X,
  ChevronRight,
  Clock,
  Info
} from 'lucide-react';

const emergencyServices = [
  {
    id: 'national',
    name: 'জাতীয় জরুরি সেবা',
    nameEn: 'National Emergency',
    number: '99965',
    description: 'পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স — সব এক নম্বরে',
    icon: Siren,
    gradient: 'from-red-600 to-rose-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    ring: 'ring-red-500/30',
    pulse: true,
  },
  {
    id: 'police',
    name: 'পুলিশ',
    nameEn: 'Police',
    number: '999',
    description: 'চুরি, ডাকাতি, সন্ত্রাসী কার্যকলাপ রিপোর্ট করুন',
    icon: Shield,
    gradient: 'from-blue-700 to-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    ring: 'ring-blue-500/30',
  },
  {
    id: 'fire',
    name: 'ফায়ার সার্ভিস',
    nameEn: 'Fire Service',
    number: '199',
    description: 'আগুন, গ্যাস লিক, উদ্ধার অপারেশনের জন্য কল করুন',
    icon: Flame,
    gradient: 'from-orange-600 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    ring: 'ring-orange-500/30',
  },
  {
    id: 'ambulance',
    name: 'অ্যাম্বুলেন্স',
    nameEn: 'Ambulance',
    number: '199',
    description: 'জরুরি চিকিৎসা সাহায্যের জন্য কল করুন',
    icon: Ambulance,
    gradient: 'from-emerald-600 to-green-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/30',
  },
];

const additionalNumbers = [
  { name: 'RAB (র‍্যাব)', number: '01৭৭৯-৫১১১৫' },
  { name: 'নারী ও শিশু নির্যাতন', number: '10921' },
  { name: 'দুর্নীতি দমন কমিশন', number: '106' },
  { name: 'তথ্য সেবা', number: '333' },
  { name: 'স্বাস্থ্য বাতায়ন', number: '16263' },
  { name: 'দুর্যোগ ব্যবস্থাপনা', number: '1090' },
];

const EmergencyPage = () => {
  const [confirmCall, setConfirmCall] = useState(null);

  const handleCall = (service) => {
    setConfirmCall(service);
  };

  const makeCall = (number) => {
    window.location.href = `tel:${number}`;
    setConfirmCall(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pt-6 pb-12">

      
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">জরুরি সেবা</h1>
            <p className="text-sm text-on-surface-variant">Emergency Services</p>
          </div>
        </div>
        <p className="text-base text-on-surface-variant mt-3 leading-relaxed">
          এক ট্যাপে জরুরি সেবায় কল করুন। আপনার নিরাপত্তা আমাদের অগ্রাধিকার।
        </p>
      </div>

      
      <div className="bg-gradient-to-r from-red-600 to-rose-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-red-500/20 animate-fade-in-up stagger-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 animate-pulse-soft">
          <AlertTriangle className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 z-10">
          <h2 className="text-white font-bold text-lg">বিপদে পড়লে এখনই কল করুন</h2>
          <p className="text-white/80 text-sm mt-0.5">জরুরি পরিস্থিতিতে নিচের যেকোনো নম্বরে ট্যাপ করুন</p>
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {emergencyServices.map((service, idx) => (
          <button
            key={service.id}
            onClick={() => handleCall(service)}
            className={`${service.bg} border ${service.border} rounded-2xl p-5 flex flex-col gap-4 text-left hover-lift active:scale-[0.97] transition-all duration-200 animate-fade-in-up stagger-${idx + 2} relative overflow-hidden group`}
          >
          
            {service.pulse && (
              <div className="absolute top-4 right-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${service.text}`}>{service.name}</h3>
                <p className="text-xs text-on-surface-variant font-medium">{service.nameEn}</p>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">{service.description}</p>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/30">
              <div className="flex items-center gap-2">
                <PhoneCall className={`w-5 h-5 ${service.text}`} />
                <span className={`text-2xl font-bold ${service.text} tracking-wider`}>{service.number}</span>
              </div>
              <div className={`w-8 h-8 rounded-full ${service.bg} border ${service.border} flex items-center justify-center group-hover:bg-white transition-colors`}>
                <ChevronRight className={`w-4 h-4 ${service.text}`} />
              </div>
            </div>
          </button>
        ))}
      </div>

      
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
        <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          অন্যান্য গুরুত্বপূর্ণ নম্বর
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {additionalNumbers.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.number}`}
              className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary/20 transition-all group"
            >
              <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</span>
              <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {item.number}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="ai-card rounded-2xl p-6 animate-fade-in-up">
        <h3 className="font-bold text-lg text-on-surface mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          জরুরি কলের সময় মনে রাখবেন
        </h3>
        <ul className="space-y-2.5">
          {[
            'শান্ত থাকুন এবং স্পষ্টভাবে কথা বলুন',
            'আপনার সঠিক অবস্থান (ঠিকানা/ল্যান্ডমার্ক) জানান',
            'কী ধরনের জরুরি পরিস্থিতি তা বলুন',
            'আহত ব্যক্তির সংখ্যা জানান',
            'অপারেটর লাইন কাটতে না বলা পর্যন্ত ফোনে থাকুন',
          ].map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-on-surface-variant">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      
      {confirmCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-br ${confirmCall.gradient} p-6 text-center`}>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <confirmCall.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl">{confirmCall.name}</h3>
              <p className="text-white/80 text-sm mt-1">{confirmCall.nameEn}</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-center text-on-surface-variant">
                <span className="text-4xl font-bold text-on-surface block mb-1">{confirmCall.number}</span>
                এই নম্বরে কল করতে চান?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmCall(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-outline-variant text-on-surface-variant font-medium hover:bg-surface-container-low transition-colors active:scale-95"
                >
                  বাতিল
                </button>
                <button 
                  onClick={() => makeCall(confirmCall.number)}
                  className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r ${confirmCall.gradient} text-white font-bold shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2`}
                >
                  <PhoneCall className="w-5 h-5" />
                  কল করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
