import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane as Plant, Sun, CloudRain, Wind, Sprout, Calendar, AlertTriangle, TrendingUp, Brain } from 'lucide-react';

const HomeTab = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [advisorInsights, setAdvisorInsights] = useState({
    cropRecommendations: ['Wheat', 'Soybeans', 'Cotton'],
    profitabilityScore: 85,
    nextActions: [
      'Consider crop rotation for better soil health',
      'Implement drip irrigation to optimize water usage',
      'Plan harvesting within next 2 weeks'
    ]
  });

  const [marketInsights, setMarketInsights] = useState({
    trendingCrops: [
      { name: 'Organic Cotton', growth: '+15%' },
      { name: 'Soybeans', growth: '+8%' },
      { name: 'Wheat', growth: '+5%' }
    ],
    marketForecast: 'Positive',
    priceProjections: {
      shortTerm: 'Upward trend expected in next 2 months',
      longTerm: 'Stable growth projected for the season'
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-4">{t('home.welcome')}</h1>
          <p className="text-gray-400">
            {t('home.subtitle')}
          </p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <Plant className="h-32 w-32 text-green-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg mr-3">
              <Plant className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">{t('home.cropStatus')}</h2>
          </div>
          <p className="text-gray-400">{t('home.cropHealthy')}</p>
          <div className="mt-4 flex items-center">
            <Sprout className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-500">{t('home.healthyGrowth')}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
              <Sun className="h-6 w-6 text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold">{t('home.weatherNow')}</h2>
          </div>
          <p className="text-gray-400">{t('home.weatherDesc')}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold">25°C</span>
            </div>
            <div className="flex items-center justify-end">
              <Wind className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-gray-400">12 km/h</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
              <CloudRain className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">{t('home.irrigation')}</h2>
          </div>
          <p className="text-gray-400">{t('home.nextIrrigation')}</p>
          <div className="mt-4 flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-500">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Farmer Advisor Section */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
            <Brain className="h-6 w-6 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Farmer Advisor Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Recommended Actions</h3>
              <ul className="space-y-2">
                {advisorInsights.nextActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-2"></div>
                    <span className="text-gray-300">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Profitability Score</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-purple-500">{advisorInsights.profitabilityScore}</div>
                <div className="text-gray-400 ml-2">/ 100</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold mb-4">Recommended Crops</h3>
            <div className="space-y-3">
              {advisorInsights.cropRecommendations.map((crop, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span>{crop}</span>
                  <div className="flex items-center text-green-500">
                    <Sprout className="h-4 w-4 mr-1" />
                    <span>Optimal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Researcher Section */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
            <TrendingUp className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold">Market Research Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Market Forecast</h3>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-blue-500">{marketInsights.marketForecast}</div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400">Short Term: {marketInsights.priceProjections.shortTerm}</p>
                <p className="text-sm text-gray-400">Long Term: {marketInsights.priceProjections.longTerm}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold mb-4">Trending Crops</h3>
            <div className="space-y-3">
              {marketInsights.trendingCrops.map((crop, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span>{crop.name}</span>
                  <div className="flex items-center text-green-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{crop.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">{t('home.tips')}</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
              <Plant className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('home.cropRotation')}</h3>
              <p className="text-gray-400">{t('home.cropRotationDesc')}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <CloudRain className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('home.moisture')}</h3>
              <p className="text-gray-400">{t('home.moistureDesc')}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('home.pestControl')}</h3>
              <p className="text-gray-400">{t('home.pestControlDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;