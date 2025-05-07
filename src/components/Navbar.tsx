import React from 'react';
import { Home, Sprout, Cloud, Bell, User, Menu, X, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', label: t('common.home'), icon: Home },
    { id: 'cropHealth', label: t('common.cropHealth'), icon: Sprout },
    { id: 'weather', label: t('common.weather'), icon: Cloud },
    { id: 'market', label: t('common.market'), icon: TrendingUp },
    { id: 'alerts', label: t('common.alerts'), icon: Bell },
    { id: 'profile', label: t('common.profile'), icon: User },
  ];

  return (
    <nav className="fixed w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 text-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Kissan AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-green-600/20 text-green-500'
                      : 'hover:bg-gray-800 hover:text-green-500'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-100 hover:text-green-500 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-green-600/20 text-green-500'
                      : 'hover:bg-gray-800 hover:text-green-500'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;