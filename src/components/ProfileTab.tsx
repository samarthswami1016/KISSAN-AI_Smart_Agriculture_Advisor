import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Edit, LogOut, Tractor, Wheat, Calendar, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import EditProfileModal from './EditProfileModal';
import LanguageSelector from './LanguageSelector';

interface ProfileTabProps {
  onLogout: () => void;
}

interface UserData {
  email: string;
  name: string;
  phone: string;
  contactNumbers: string[];
  location: string;
  farmingDetails: {
    totalLand: string;
    mainCrops: string;
    farmingSince: string;
    irrigationType: string;
    state: string;
  };
  currentSeason: {
    cropType: string;
    sowingDate: string;
    expectedHarvest: string;
    cropHealth: string;
  };
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const farmingDetails = user.user_metadata.farming_details || {
          totalLand: 'Not set',
          mainCrops: 'Not set',
          farmingSince: 'Not set',
          irrigationType: 'Not set',
          state: 'Not set'
        };

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        let season;
        if (month >= 6 && month <= 10) {
          season = 'Kharif';
        } else if (month >= 10 || month <= 3) {
          season = 'Rabi';
        } else {
          season = 'Zaid';
        }

        let mainCrop = farmingDetails.mainCrops.split(',')[0].trim();
        let sowingDate = '';
        let harvestDate = '';

        if (season === 'Kharif') {
          sowingDate = 'June 2024';
          harvestDate = 'October 2024';
        } else if (season === 'Rabi') {
          sowingDate = 'October 2024';
          harvestDate = 'March 2025';
        } else {
          sowingDate = 'March 2024';
          harvestDate = 'June 2024';
        }

        setUserData({
          email: user.email || 'Not set',
          name: user.user_metadata.full_name || 'Not set',
          phone: user.phone || 'Not set',
          contactNumbers: user.user_metadata.contact_numbers || [],
          location: farmingDetails.state,
          farmingDetails,
          currentSeason: {
            cropType: mainCrop,
            sowingDate,
            expectedHarvest: harvestDate,
            cropHealth: 'Good'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-800 rounded-lg"></div>
          <div className="h-64 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center text-gray-400 hover:text-green-500 transition-colors duration-200"
            >
              <Edit className="h-5 w-5 mr-1" />
              {t('profile.editProfile')}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-1" />
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
          <div className="text-center">
            <div className="inline-block p-2 rounded-full bg-gray-800 mb-4">
              <User className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">{userData.name}</h2>
            <p className="text-gray-400">{t('profile.farmingExperience')}</p>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center text-gray-400">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{userData.location}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Phone className="h-5 w-5 mr-2" />
              <span>{userData.phone}</span>
            </div>
            {userData.contactNumbers.map((number, index) => (
              <div key={index} className="flex items-center text-gray-400 pl-7">
                <span>{number}</span>
              </div>
            ))}
            <div className="flex items-center text-gray-400">
              <Mail className="h-5 w-5 mr-2" />
              <span>{userData.email}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-sm font-medium text-gray-400 mb-2">{t('common.language')}</p>
            <LanguageSelector />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Tractor className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold">{t('profile.farmDetails')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">{t('profile.totalLand')}</p>
                <p className="text-xl font-semibold">{userData.farmingDetails.totalLand} Acres</p>
              </div>
              <div>
                <p className="text-gray-400">{t('profile.mainCrops')}</p>
                <p className="text-xl font-semibold">{userData.farmingDetails.mainCrops}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('profile.farmingSince')}</p>
                <p className="text-xl font-semibold">{userData.farmingDetails.farmingSince}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('profile.irrigationType')}</p>
                <p className="text-xl font-semibold">{userData.farmingDetails.irrigationType}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Wheat className="h-6 w-6 text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold">{t('profile.currentSeason')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('profile.cropType')}</span>
                <span>{userData.currentSeason.cropType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('profile.sowingDate')}</span>
                <span>{userData.currentSeason.sowingDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('profile.expectedHarvest')}</span>
                <span>{userData.currentSeason.expectedHarvest}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('profile.cropHealth')}</span>
                <div className="flex items-center text-green-500">
                  <Sprout className="h-5 w-5 mr-1" />
                  <span>{userData.currentSeason.cropHealth}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onUpdate={fetchUserData}
      />
    </div>
  );
};

export default ProfileTab;