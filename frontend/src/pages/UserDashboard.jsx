import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  BrainCircuit,
  Camera,
  CheckCircle,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  User,
  X,
} from 'lucide-react';

const SuccessBanner = ({ show }) => {
  return (
    <div
      className={`transition-all duration-300 overflow-hidden ${
        show ? 'max-h-16 mb-6 opacity-100' : 'max-h-0 mb-0 opacity-0'
      }`}
    >
      <div className="bg-primary-fixed/30 border border-primary/20 text-primary px-4 py-3 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-primary" />
        <span className="font-medium text-sm">Profile updated successfully!</span>
      </div>
    </div>
  );
};

const UserProfileHeader = ({
  userData,
  isEditing,
  setIsEditing,
  onSave,
  onChange,
  inputEditingStyle,
}) => {
  return (
    <section className="glass-card rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 group">
          <img
            alt="Profile"
            className="w-full h-full rounded-2xl object-cover border-4 border-surface shadow-lg"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              userData.name,
            )}&background=0D8ABC&color=fff&size=256`}
          />

          <div
            className="absolute -bottom-1 -right-1 bg-gradient-to-br from-primary to-primary-container text-white p-1.5 rounded-lg border-2 border-surface shadow-sm"
            title="Verified Citizen"
          >
            <BadgeCheck className="w-4 h-4" />
          </div>

          {isEditing && (
            <button
              type="button"
              className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Change</span>
            </button>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left flex-grow">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            {userData.name}
          </h1>
          <p className="text-base text-on-surface-variant mb-2">
            {userData.location}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary/20">
              Top 5% Contributor
            </span>
            <span className="bg-primary-fixed-dim/20 text-on-primary-fixed-variant font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary-fixed-dim/30">
              Verified Citizen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface-variant font-medium text-sm hover:bg-surface-container-low hover:text-primary transition-colors active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>

              <Link
                to="/report"
                className="flex items-center px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#003da8] transition-colors shadow-md shadow-primary/20 active:scale-95"
              >
                Report Issue
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface-variant font-medium text-sm hover:bg-surface-container-low transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#003da8] transition-colors shadow-md shadow-primary/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-outline-variant/20 relative z-10">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                Location / Ward
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={userData.location}
                  onChange={onChange}
                  className={inputEditingStyle}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1 ml-1">
                About Me
              </label>
              <textarea
                name="bio"
                value={userData.bio}
                onChange={onChange}
                rows="2"
                className="block w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 resize-none bg-white border border-outline-variant/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface"
              />
            </div>
          </form>
        </div>
      )}
    </section>
  );
};


const DailyInsightCard = () => {
  return (
    <section className="col-span-1 md:col-span-8 ai-card rounded-2xl p-6">
      {/* Card header with icon and title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl text-primary font-bold">Daily AI Insight</h3>
        <Sparkles className="w-4 h-4 text-primary/50 ml-1" />
      </div>

      {/* Insight message */}
      <p className="text-on-surface mb-4 leading-relaxed">
        There's an increase in reported waste management issues in your ward
        today. Your contribution to verifying these could speed up the
        resolution time by{' '}
        <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          35%
        </span>
        .
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 border border-primary/30 text-primary font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all text-center active:scale-95">
          View Hotspots
        </button>
        <button className="flex-1 bg-gradient-to-r from-primary-container to-primary text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-all text-center shadow-md shadow-primary/20 active:scale-95">
          Verify 3 Reports (+15 XP)
        </button>
      </div>
    </section>
  );
};

const UserDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userData, setUserData] = useState({
    name: 'NagarBondhu User',
    email: 'citizen@nagarbondhu.ai',
    phone: '+880 1700-000000',
    location: 'Ward 12, Dhaka',
    bio: 'Helping improve the city by reporting issues and following civic updates.',
  });

  const inputEditingStyle =
    'block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 bg-white border border-outline-variant/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1 tracking-tight">
            User Dashboard Overview
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Real-time civic intelligence and activity tracking.
          </p>
        </div>

        <SuccessBanner show={showSuccess} />

        <UserProfileHeader
          userData={userData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={handleSave}
          onChange={handleChange}
          inputEditingStyle={inputEditingStyle}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Row 1: AI Insight + Reputation */}
        <DailyInsightCard />
        </div>
      </div>


    </main>
  );
};

export default UserDashboard;
