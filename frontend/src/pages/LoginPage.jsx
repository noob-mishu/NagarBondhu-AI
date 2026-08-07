import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Lock, User, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
  });
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          location: formData.location,
        });
      }
      // The useEffect listening to isAuthenticated will handle the redirect
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-background text-on-background antialiased flex flex-col md:flex-row"
      style={{ minHeight: 'max(884px, 100dvh)' }}
    >
      {/* Left Side: Branding / Imagery */}
      <div className="hidden md:flex flex-col flex-1 bg-surface-container-low relative overflow-hidden">
        {/* Abstract gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface-container to-secondary/5 opacity-50 z-0"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between p-12">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 text-primary cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Building className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">NagarBondhu AI</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-on-surface mb-6 leading-tight">
              Towards a Smarter Bangladesh.
            </h1>
            <p className="text-lg text-on-surface-variant">
              Join our civic AI platform to report issues, track community progress, and build a more transparent future together. Your voice, amplified by artificial intelligence.
            </p>
          </div>
          
          {/* Subtle Image Integration */}
          <div className="mt-12 rounded-xl overflow-hidden shadow-lg bg-white border border-outline-variant/30 h-64 relative">
            <div 
              className="bg-cover bg-center w-full h-full" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMzNiN-zXryqjp7udy53A5OFtTAzMcKnRD1Kwk3pV09cHrn_yAJiPWkm_0udeXC_w1JJX312ieDAYRL769cc97tNDjzM8WDDDXXDm_LB659wwO_ct-xdAFm-4Iv38UdXIT0M5SJB8ntuIB36LyIEg7hzWBAoVQ660P1XeDwAaa4cplB97Inz9TCeyHeRsm3k3gDtRJAiAudwz_B_RKd8EBy7vfx4-4qAfJ9-eM9kWixSbJPsdGZ-6Eyjb6w-7ZQ_maHhYOdcu0KHA')" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex flex-col flex-1 justify-center px-6 py-12 md:px-10 bg-surface-container-lowest z-10 shadow-[-4px_0_24px_rgba(30,41,59,0.02)] overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Mobile Logo */}
          <div 
            className="md:hidden flex items-center justify-center gap-2 text-primary mb-8 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Building className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">NagarBondhu AI</span>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-on-surface mb-2">
              {isLogin ? 'Welcome back' : 'Create an Account'}
            </h2>
            <p className="text-base text-on-surface-variant">
              {isLogin ? 'Please enter your details to sign in.' : 'Join your community to report and track issues.'}
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Signup Fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-outline-variant w-5 h-5" />
                    </div>
                    <input 
                      id="name" 
                      name="name"
                      type="text" 
                      required 
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg text-base bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="location">Area / Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="text-outline-variant w-5 h-5" />
                    </div>
                    <input 
                      id="location" 
                      name="location"
                      type="text" 
                      required 
                      placeholder="Mirpur 10, Dhaka"
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg text-base bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow" 
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field (Both) */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="email">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-outline-variant w-5 h-5" />
                </div>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  placeholder="citizen@dhaka.gov.bd"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg text-base bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow" 
                />
              </div>
            </div>

            {/* Password Field (Both) */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-outline-variant w-5 h-5" />
                </div>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete={isLogin ? "current-password" : "new-password"} 
                  required 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg text-base bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow" 
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password (Login Only) */}
            {isLogin && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-on-surface-variant">Remember me</label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary-container">Forgot your password?</a>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create Account')}
              </button>
            </div>
          </form>

          {/* Social Auth */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-outline">Or continue with</span>
              </div>
            </div>
            <div className="mt-6">
              <button type="button" className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-outline-variant rounded-lg bg-white text-sm font-medium text-on-surface hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                <svg aria-hidden="true" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                </svg>
                Google
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-on-surface-variant">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="font-medium text-primary hover:text-primary-container"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up now' : 'Sign in'}
            </button>
          </p>

          {/* Bottom Links mimicking Footer style slightly */}
          <div className="mt-12 pt-6 border-t border-outline-variant/30 flex justify-center gap-6 text-xs font-bold uppercase tracking-wider text-outline">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
