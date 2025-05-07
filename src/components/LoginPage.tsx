import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: () => void;
}

interface FarmingDetails {
  totalLand: string;
  mainCrops: string;
  farmingSince: string;
  irrigationType: string;
  state: string;
}

const STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh',
  'Rajasthan', 'Gujarat', 'West Bengal', 'Bihar', 'Tamil Nadu',
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Odisha', 'Assam',
  'Chhattisgarh', 'Jharkhand', 'Himachal Pradesh', 'Uttarakhand', 'Goa',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura',
  'Arunachal Pradesh', 'Sikkim', 'Ladakh', 'Telangana'
];

const IRRIGATION_TYPES = [
  'Canal Irrigation',
  'Drip Irrigation',
  'Sprinkler System',
  'Well/Tube Well',
  'Rain-fed',
  'Mixed'
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  
  const [farmingDetails, setFarmingDetails] = useState<FarmingDetails>({
    totalLand: '',
    mainCrops: '',
    farmingSince: '',
    irrigationType: '',
    state: ''
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    farming: '',
    submit: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    if (isSignUp) {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_OPENCAGE_API_KEY`
              );
              const data = await response.json();
              const state = data.results[0]?.components?.state;
              if (state && STATES.includes(state)) {
                setFarmingDetails(prev => ({ ...prev, state }));
              }
            } catch (error) {
              console.error('Error fetching location:', error);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    }
  }, [isSignUp]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateFarmingDetails = () => {
    if (!farmingDetails.totalLand || !farmingDetails.mainCrops || 
        !farmingDetails.farmingSince || !farmingDetails.irrigationType || 
        !farmingDetails.state) {
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFarmingDetails(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, submit: '' }));
    
    // Real-time validation
    if (name === 'email' && value) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? '' : 'Please enter a valid email'
      }));
    }
    if (name === 'password' && value) {
      setErrors(prev => ({
        ...prev,
        password: value.length >= 6 ? '' : 'Password must be at least 6 characters'
      }));
    }
    if (name === 'name' && value) {
      setErrors(prev => ({
        ...prev,
        name: value.length >= 2 ? '' : 'Name must be at least 2 characters'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !validateFarmingDetails()) {
      setErrors(prev => ({ ...prev, farming: 'Please fill all farming details' }));
      return;
    }

    if (!errors.email && !errors.password && (!isSignUp || !errors.name)) {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, submit: '' }));

      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
                farming_details: farmingDetails,
              },
            },
          });

          if (error) throw error;
          onLogin();
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) throw error;
          onLogin();
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error instanceof Error ? error.message : 'An error occurred',
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#222623] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900/50 p-8 rounded-xl backdrop-blur-sm border border-gray-800">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img
              src="https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg"
              alt="Farming"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
              <Sprout className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-100">
            Welcome to Kissan AI
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Your smart farming companion
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-400 mb-1">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  value={farmingDetails.state}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select your state</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="totalLand" className="block text-sm font-medium text-gray-400 mb-1">
                  Total Land (in Acres)
                </label>
                <input
                  id="totalLand"
                  name="totalLand"
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={farmingDetails.totalLand}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter total land in acres"
                />
              </div>

              <div>
                <label htmlFor="mainCrops" className="block text-sm font-medium text-gray-400 mb-1">
                  Main Crops
                </label>
                <input
                  id="mainCrops"
                  name="mainCrops"
                  type="text"
                  required
                  value={farmingDetails.mainCrops}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Wheat, Rice, Cotton"
                />
              </div>

              <div>
                <label htmlFor="farmingSince" className="block text-sm font-medium text-gray-400 mb-1">
                  Farming Since (Year)
                </label>
                <input
                  id="farmingSince"
                  name="farmingSince"
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={farmingDetails.farmingSince}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter year you started farming"
                />
              </div>

              <div>
                <label htmlFor="irrigationType" className="block text-sm font-medium text-gray-400 mb-1">
                  Irrigation Type
                </label>
                <select
                  id="irrigationType"
                  name="irrigationType"
                  required
                  value={farmingDetails.irrigationType}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select irrigation type</option>
                  {IRRIGATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>

          {errors.farming && (
            <div className="rounded-md bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{errors.farming}</p>
            </div>
          )}

          {errors.submit && (
            <div className="rounded-md bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-green-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({ email: '', password: '', name: '', farming: '', submit: '' });
              }}
              className="text-sm text-gray-400 hover:text-green-500 transition-colors duration-200"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;