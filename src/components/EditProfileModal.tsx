import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Phone, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: userData.name,
    phone: userData.phone,
    totalLand: userData.farmingDetails.totalLand,
    mainCrops: userData.farmingDetails.mainCrops,
    farmingSince: userData.farmingDetails.farmingSince,
    irrigationType: userData.farmingDetails.irrigationType
  });
  
  const [contactNumbers, setContactNumbers] = useState<string[]>(
    userData.contactNumbers || []
  );
  const [newNumber, setNewNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNumber = () => {
    if (newNumber && !contactNumbers.includes(newNumber)) {
      setContactNumbers([...contactNumbers, newNumber]);
      setNewNumber('');
    }
  };

  const handleRemoveNumber = (index: number) => {
    setContactNumbers(contactNumbers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          phone: formData.phone,
          contact_numbers: contactNumbers,
          farming_details: {
            ...userData.farmingDetails,
            totalLand: formData.totalLand,
            mainCrops: formData.mainCrops,
            farmingSince: formData.farmingSince,
            irrigationType: formData.irrigationType
          }
        }
      });

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 w-full max-w-md">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6">{t('profile.editProfile')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.additionalContacts')}
              </label>
              <div className="space-y-2">
                {contactNumbers.map((number, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {number}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNumber(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="tel"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder={t('profile.addNewContact')}
                    className="flex-1 bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddNumber}
                    className="p-2 text-green-500 hover:text-green-400 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.totalLand')}
              </label>
              <input
                type="number"
                name="totalLand"
                value={formData.totalLand}
                onChange={handleChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.mainCrops')}
              </label>
              <input
                type="text"
                name="mainCrops"
                value={formData.mainCrops}
                onChange={handleChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.farmingSince')}
              </label>
              <input
                type="number"
                name="farmingSince"
                value={formData.farmingSince}
                onChange={handleChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t('profile.irrigationType')}
              </label>
              <select
                name="irrigationType"
                value={formData.irrigationType}
                onChange={handleChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-gray-100 border border-gray-700/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
              >
                <option value="Canal Irrigation">Canal Irrigation</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler System">Sprinkler System</option>
                <option value="Well/Tube Well">Well/Tube Well</option>
                <option value="Rain-fed">Rain-fed</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r transition-all duration-200 ${
                  loading
                    ? 'from-green-600/50 to-green-500/50 cursor-not-allowed'
                    : 'from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                }`}
              >
                {loading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;