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
      <header className="animate-fade-in-up max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 shadow-lg shadow-red-500/20">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Emergency Services</h1>
            <p className="text-sm text-on-surface-variant">Get immediate help when you need it most</p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed text-on-surface-variant">
          Tap a service below to place a call. If anyone is in immediate danger, call National Emergency on <strong className="text-red-700">999</strong>.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Primary emergency services">
        {emergencyServices.map((service) => {
          const Icon = service.icon;
          return (
            <article key={service.id} className={`card-hover rounded-2xl border p-5 ${service.cardClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${service.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {service.primary && <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">Recommended</span>}
              </div>
              <h2 className="mt-4 text-lg font-bold text-on-surface">{service.name}</h2>
              <p className="mt-1 min-h-10 text-sm leading-relaxed text-on-surface-variant">{service.description}</p>
              <button type="button" onClick={() => setSelectedService(service)} className={`mt-5 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 font-bold shadow-sm hover:shadow ${service.textClass}`}>
                <span>Call {service.number}</span>
                <Phone className="h-5 w-5" />
              </button>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface"><AlertTriangle className="h-5 w-5 text-tertiary" /> More useful numbers</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {additionalNumbers.map((service) => (
            <button key={service.number} type="button" onClick={() => setSelectedService(service)} className="flex items-center justify-between rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5">
              <span><span className="block text-sm font-semibold text-on-surface">{service.name}</span><span className="text-sm text-on-surface-variant">{service.number}</span></span>
              <Phone className="h-4 w-4 text-primary" />
            </button>
          ))}
        </div>
      </section>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="call-title">
          <div className="w-full max-w-sm animate-fade-in-up rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600"><Phone className="h-5 w-5" /></div><button type="button" onClick={() => setSelectedService(null)} aria-label="Close call confirmation" className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"><X className="h-5 w-5" /></button></div>
            <h2 id="call-title" className="mt-4 text-xl font-bold text-on-surface">Call {selectedService.name}?</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Your phone will dial <strong className="text-on-surface">{selectedService.number}</strong>.</p>
            <div className="mt-6 flex gap-3"><button type="button" onClick={() => setSelectedService(null)} className="flex-1 rounded-xl border border-outline-variant/60 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container">Cancel</button><button type="button" onClick={makeCall} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"><Check className="h-4 w-4" />Call now</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
