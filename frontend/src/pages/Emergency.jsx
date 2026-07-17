import { useState } from "react";
import {
  Ambulance,
  AlertTriangle,
  Check,
  Flame,
  Phone,
  Shield,
  Siren,
  X,
} from "lucide-react";

const emergencyServices = [
  {
    id: "national",
    name: "National Emergency",
    number: "999",
    description: "Police, fire service, and ambulance assistance from one number.",
    icon: Siren,
    cardClass: "border-red-200 bg-red-50",
    iconClass: "bg-red-600",
    textClass: "text-red-700",
    primary: true,
  },
  {
    id: "police",
    name: "Police",
    number: "999",
    description: "Report crime, threats, theft, or other immediate danger.",
    icon: Shield,
    cardClass: "border-blue-200 bg-blue-50",
    iconClass: "bg-blue-600",
    textClass: "text-blue-700",
  },
  {
    id: "fire",
    name: "Fire Service",
    number: "199",
    description: "For fires, gas leaks, rescue operations, and related hazards.",
    icon: Flame,
    cardClass: "border-orange-200 bg-orange-50",
    iconClass: "bg-orange-600",
    textClass: "text-orange-700",
  },
  {
    id: "ambulance",
    name: "Ambulance",
    number: "199",
    description: "Request urgent medical assistance and ambulance support.",
    icon: Ambulance,
    cardClass: "border-emerald-200 bg-emerald-50",
    iconClass: "bg-emerald-600",
    textClass: "text-emerald-700",
  },
];

const additionalNumbers = [
  { name: "RAB", number: "01777-511115" },
  { name: "Women & Child Helpline", number: "10921" },
  { name: "Anti-Corruption Commission", number: "106" },
  { name: "National Information Service", number: "333" },
  { name: "Health Helpline", number: "16263" },
  { name: "Disaster Management", number: "1090" },
];

const Emergency = () => {
  const [selectedService, setSelectedService] = useState(null);

  const makeCall = () => {
    if (!selectedService) return;
    window.location.href = `tel:${selectedService.number.replace(/[^0-9+]/g, "")}`;
    setSelectedService(null);
  };

  return (
    <div className="w-full max-w-5xl px-4 py-8 pb-12 md:px-8 md:py-12">
      
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
            {/* Pulse indicator for national emergency */}
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

      
    </div>
  );
};

export default Emergency;
