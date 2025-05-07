import React, { useState, useEffect } from 'react';
import { Home, Plane as Plant, Cloud, Bell, User, Menu, X, TrendingUp } from 'lucide-react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import HomeTab from './components/HomeTab';
import CropHealthTab from './components/CropHealthTab';
import WeatherTab from './components/WeatherTab';
import AlertsTab from './components/AlertsTab';
import ProfileTab from './components/ProfileTab';
import MarketResearchTab from './components/MarketResearchTab';
import LoginPage from './components/LoginPage';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'cropHealth':
        return <CropHealthTab />;
      case 'weather':
        return <WeatherTab />;
      case 'alerts':
        return <AlertsTab />;
      case 'market':
        return <MarketResearchTab />;
      case 'profile':
        return <ProfileTab onLogout={handleLogout} />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#222623] text-gray-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 p-4 pt-20">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;