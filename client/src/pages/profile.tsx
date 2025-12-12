
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn, LogOut, Mail, Phone, Zap } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import { useI18n } from "@/lib/i18n";
import { PhoneAuth } from "@/components/phone-auth";

export default function ProfileScreen() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [phoneUser, setPhoneUser] = useState<UserType | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(true);
  
  // Check for phone auth user on mount
  useEffect(() => {
    const checkPhoneAuth = async () => {
      try {
        const res = await fetch("/api/auth/phone/user");
        if (res.ok) {
          const data = await res.json();
          setPhoneUser(data);
        }
      } catch (err) {
        // Not authenticated via phone
      } finally {
        setPhoneLoading(false);
      }
    };
    checkPhoneAuth();
  }, []);

  const handlePhoneLogout = async () => {
    try {
      await fetch("/api/auth/phone/logout", { method: "POST" });
      setPhoneUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handlePhoneAuthSuccess = async () => {
    // Re-check phone auth after successful login
    const res = await fetch("/api/auth/phone/user");
    if (res.ok) {
      const data = await res.json();
      setPhoneUser(data);
    }
    setShowPhoneAuth(false);
  };
  
  if (isLoading || phoneLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary font-mono animate-pulse flex items-center gap-3">
          <Zap className="w-6 h-6 animate-spin" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  // Show phone auth form
  if (showPhoneAuth) {
    return (
      <div className="min-h-screen p-6 pt-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <PhoneAuth onSuccess={handlePhoneAuthSuccess} />
        <button
          onClick={() => setShowPhoneAuth(false)}
          className="w-full text-gray-400 py-4 text-sm hover:text-white transition-colors mt-4"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  // If logged in via phone
  if (phoneUser) {
    return (
      <div className="min-h-screen p-6 pt-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        
        <header className="relative z-10 mb-8">
          <h1 className="text-4xl font-black text-white font-heading uppercase">{t('profile.title')}</h1>
          <p className="text-xs text-primary font-mono tracking-[0.2em] uppercase mt-1">
            {t('profile.subtitle')}
          </p>
        </header>
        
        <div className="relative z-10 space-y-6">
          <div className="bg-black/80 border-2 border-primary/30 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary flex items-center justify-center">
                <Phone className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white font-heading uppercase">
                  {t('phoneAuth.title')}
                </h2>
                {phoneUser.phone && (
                  <p className="text-gray-400 font-mono">{phoneUser.phone}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 border border-white/10">
              <Phone className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">{phoneUser.phone}</span>
            </div>
          </div>
          
          <button
            onClick={handlePhoneLogout}
            data-testid="button-phone-logout"
            className="w-full bg-red-500/20 border-2 border-red-500/50 text-red-400 py-4 font-black text-lg flex items-center justify-center gap-3 font-heading uppercase hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-6 h-6" />
            {t('profile.signOut')}
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-primary/10 border-4 border-primary/30 flex items-center justify-center mx-auto mb-8">
            <User className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-4xl font-black text-white font-heading uppercase mb-4">
            {t('profile.accessRequired')}
          </h1>
          <p className="text-gray-400 font-mono text-sm mb-8 max-w-xs">
            {t('profile.signInDesc')}
          </p>
          
          <a
            href="/api/login"
            data-testid="button-login"
            className="inline-flex items-center gap-3 bg-primary text-black px-8 py-4 font-black text-lg font-heading uppercase shadow-[0_0_40px_rgba(0,255,128,0.5)] hover:shadow-[0_0_60px_rgba(0,255,128,0.7)] transition-all"
          >
            <LogIn className="w-6 h-6" />
            {t('profile.signIn')}
          </a>
          
          <p className="text-[10px] text-gray-600 font-mono mt-6 uppercase tracking-wider">
            {t('profile.authMethods')}
          </p>
          
          {/* Phone auth option */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm mb-4">{t('phoneAuth.orPhone')}</p>
            <button
              onClick={() => setShowPhoneAuth(true)}
              data-testid="button-phone-login"
              className="inline-flex items-center gap-3 bg-white/10 border-2 border-white/20 text-white px-8 py-4 font-black text-lg font-heading uppercase hover:border-primary hover:text-primary transition-all"
            >
              <Phone className="w-6 h-6" />
              {t('phoneAuth.title')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typedUser = user as UserType;

  return (
    <div className="min-h-screen p-6 pt-10 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      
      <header className="relative z-10 mb-8">
        <h1 className="text-4xl font-black text-white font-heading uppercase">{t('profile.title')}</h1>
        <p className="text-xs text-primary font-mono tracking-[0.2em] uppercase mt-1">
          {t('profile.subtitle')}
        </p>
      </header>
      
      <div className="relative z-10 space-y-6">
        {/* User Card */}
        <div className="bg-black/80 border-2 border-primary/30 p-6">
          <div className="flex items-center gap-4 mb-6">
            {typedUser?.profileImageUrl ? (
              <img 
                src={typedUser.profileImageUrl} 
                alt="Profile" 
                className="w-20 h-20 object-cover border-2 border-primary shadow-[0_0_20px_rgba(0,255,128,0.3)]"
              />
            ) : (
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black text-white font-heading uppercase">
                {typedUser?.firstName || typedUser?.email?.split('@')[0] || 'Operator'}
              </h2>
              {typedUser?.lastName && (
                <p className="text-gray-400 font-heading uppercase">{typedUser.lastName}</p>
              )}
            </div>
          </div>
          
          {typedUser?.email && (
            <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 border border-white/10">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">{typedUser.email}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <a
          href="/api/logout"
          data-testid="button-logout"
          className="w-full bg-red-500/20 border-2 border-red-500/50 text-red-400 py-4 font-black text-lg flex items-center justify-center gap-3 font-heading uppercase hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut className="w-6 h-6" />
          {t('profile.signOut')}
        </a>
      </div>
    </div>
  );
}
