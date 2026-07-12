import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Compass } from "lucide-react";

const LandingPage = () => {
  // STATE VARIABLES
  const [menuOpen, setMenuOpen] = useState(false); // Controls the mobile menu open/close state

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ----------------- NAVBAR SECTION ----------------- */}
      <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-sm py-3 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md group-hover:shadow-lg transition-shadow bg-linear-to-br from-blue-600 to-blue-700">
              N
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-slate-900">Nagar</span>
              <span className="text-blue-600">Bondhu</span>
              <span className="text-slate-400 font-normal text-md ml-1">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#impact" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              Impact
            </a>
            <a href="#reviews" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              Reviews
            </a>
          </div>

          {/* Desktop Login/Report Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 text-slate-700 text-sm font-semibold rounded-xl
              border border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all">
              Sign In
            </Link>
            <Link to="/report" className="px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-linear-to-br from-blue-600 to-blue-700">
              Report Issue
            </Link>
          </div>

          {/* Mobile Menu Toggle Button (Hamburger Icon) */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu (only shows if menuOpen is true) */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
            <div className="px-6 py-4 flex flex-col gap-2">
              <a href="#features" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">
                How It Works
              </a>
              <a href="#impact" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">
                Impact
              </a>
              <hr className="my-2 border-slate-100" />
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 text-center hover:bg-slate-50">
                Sign In
              </Link>
              <Link to="/report" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl text-center">
                Report Issue
              </Link>
            </div>
          </div>
        )}
      </nav>


      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-50 via-slate-50 to-slate-50">
        {/* Background decorative circles */}
        

          <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 md:pt-48 md:pb-36">
            <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">

              {/* Left Side: Text and Buttons */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wider rounded-full mb-8">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  AI-Powered Civic Platform
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-6">
                  <span className="text-slate-900">Build a</span><br />
                  <span className="text-slate-900">Better City,</span><br />
                  <span className="bg-linear-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    Together.
                  </span>
                </h1>

                <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
                  Report civic issues, track resolution progress, and collaborate with authorities for a cleaner, safer Bangladesh.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link to="/report" className="flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm bg-linear-to-br from-blue-600 to-blue-700">
                    <AlertTriangle className="w-4 h-4" /> Report a Problem <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/feed" className="flex items-center justify-center gap-2 px-7 py-4 bg-white text-slate-700 font-bold border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-200 text-sm">
                    <Compass className="w-4 h-4" /> Explore Community
                  </Link>
                </div>
              </div>

              {/* Right Side: Dashboard Visual (Hidden on mobile) */}
              <div className="hidden md:block relative">
                <div className="absolute inset-4 bg-blue-100/60 rounded-3xl rotate-3" />

                <div className="relative rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af)' }}>
                  <div className="p-7 pb-5">
                    <div className="flex justify-between items-center mb-7">
                      <div className="flex items-center gap-2.5">
                        <Building className="w-7 h-7 text-blue-300" />
                        <span className="text-white font-bold text-sm">NagarBondhu Dashboard</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-300 text-xs font-bold">LIVE</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Fake live data rows */}
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-white text-sm font-semibold">Road Repair — Block C</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300">
                            In Progress
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: '65%' }} />
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-white text-sm font-semibold">Streetlight Out — Gulshan</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-400/15 text-green-300">
                            Resolved
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-green-400" style={{ width: '100%' }} />
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 opacity-60">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-white text-sm font-semibold">Drain Overflow — Sector 7</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-400/15 text-blue-300">
                            Submitted
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-400" style={{ width: '20%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Resolved this week</p>
                      <p className="text-2xl font-black text-slate-900">+127</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
      </section>


      {/* ----------------- IMPACT NUMBERS SECTION ----------------- */}
      <section id="impact" className="relative overflow-hidden py-20 md:py-24" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">Making a Real Difference</h2>
              <p className="text-blue-200/50 max-w-md mx-auto">Real numbers from real communities across Bangladesh.</p>
            </div>

            {/* Render the animated counting stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem icon={ClipboardList} endValue={12500} suffix="+" label="Issues Reported" />
              <StatItem icon={CheckCircle} endValue={8200} suffix="+" label="Problems Solved" />
              <StatItem icon={Users} endValue={24000} suffix="+" label="Active Citizens" />
              <StatItem icon={MapPin} endValue={64} suffix="" label="Districts Covered" />
            </div>
          </div>
      </section>


      {/* ----------------- FEATURES SECTION ----------------- */}
      <section id="features" className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs uppercase tracking-wider rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Features
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-5 tracking-tight">
                Everything You Need to <span className="bg-linear-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">Fix Your City</span>
              </h2>
            </div>

            {/* Loop through the FEATURES_DATA array and map it to FeatureCards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES_DATA.map((feature, idx) => (
                <FeatureCard key={idx} icon={feature.icon} title={feature.title} desc={feature.desc} color={feature.color} />
              ))}
            </div>
          </div>
      </section>


      {/* ----------------- HOW IT WORKS SECTION ----------------- */}
      <section id="how-it-works" className="py-24 md:py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 font-semibold text-xs uppercase tracking-wider rounded-full mb-5">
                <Award className="w-3.5 h-3.5" /> How It Works
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-5 tracking-tight">From Report to Resolution</h2>
            </div>

            <div className="relative">
              {/* Rainbow connecting line (only visible on desktop) */}
              <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-0.5" style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6, #f59e0b, #10b981)' }} />

              {/* Loop through HOW_IT_WORKS_STEPS array */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <div key={i} className="group text-center md:text-center">
                    <div className="w-12 h-12 rounded-full text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ background: step.color, boxShadow: `0 8px 20px -4px ${step.color}40` }}>
                      {step.num}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </section>


      {/* ----------------- TESTIMONIALS SECTION ----------------- */}
      <section id="reviews" className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-xs uppercase tracking-wider rounded-full mb-5">
                <Heart className="w-3.5 h-3.5" /> Reviews
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-5 tracking-tight">Trusted by Communities</h2>
            </div>

            {/* Loop through REVIEWS_DATA array */}
            <div className="grid md:grid-cols-3 gap-5">
              {REVIEWS_DATA.map((review, idx) => (
                <TestimonialCard key={idx} name={review.name} role={review.role} text={review.text} color={review.color} />
              ))}
            </div>
          </div>
      </section>


      {/* ----------------- CTA (CALL TO ACTION) SECTION ----------------- */}
      <section className="py-20 md:py-24 px-6" style={{ background: 'linear-gradient(180deg, #f8fafc, #eff6ff)' }}>
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}>
            {/* Background design elements */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full" />

            <div className="relative text-center py-20 px-6">
              <Sparkles className="w-10 h-10 text-blue-300/40 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
                Ready to Make a<br className="hidden sm:block" /> Difference?
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
                <Link to="/login" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
                  Get Started Free <ArrowRight className="w-4 h-4 inline ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ----------------- FOOTER SECTION ----------------- */}
      <footer className="bg-slate-900 text-slate-400 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h3 className="text-xl font-bold text-white mb-2">NagarBondhu</h3>
            <p className="max-w-sm leading-relaxed text-sm">Empowering citizens with technology to build a smarter, safer, and cleaner Bangladesh.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-800 text-xs">
          <p>&copy; {new Date().getFullYear()} NagarBondhu AI. Built for Bangladesh.</p>
        </div>
      </footer>


      {/* ----------------- MOBILE BOTTOM NAVBAR ----------------- */}
      {/* This nav replaces the top navbar on small screens (phones) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-lg border-t border-slate-200 flex justify-around py-3 z-50">
        <Link to="/" className="flex flex-col items-center text-blue-600"><Home className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-bold">Home</span></Link>
        <Link to="/feed" className="flex flex-col items-center text-slate-400"><Rss className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-bold">Feed</span></Link>
        <Link to="/report" className="flex flex-col items-center text-slate-400"><AlertTriangle className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-bold">Report</span></Link>
        <Link to="/map" className="flex flex-col items-center text-slate-400"><Map className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-bold">Map</span></Link>
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400"><User className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-bold">Profile</span></Link>
      </div>

    </div>
  );
};

export default LandingPage;
