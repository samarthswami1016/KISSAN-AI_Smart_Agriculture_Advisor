import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ChevronDown, ChevronUp, BarChart3, LineChart, PieChart, DollarSign, Search, RefreshCw } from 'lucide-react';
import { createChart, ColorType } from 'lightweight-charts';
import { supabase } from '../lib/supabase';

interface MarketData {
  crop_type: string;
  production_volume: number;
  market_price: number;
  demand_forecast: number;
  supply_forecast: number;
  price_volatility: number;
  storage_capacity: number;
  market_risk: string;
  profit_potential: number;
}

interface AggregatedData {
  crop_type: string;
  avg_price: number;
  avg_profit: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  trend: 'up' | 'down' | 'stable';
}

interface RealTimePrice {
  symbol: string;
  price: number;
  timestamp: string;
  change: number;
}

const MarketResearchTab = () => {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [realTimePrices, setRealTimePrices] = useState<RealTimePrice[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [chartData, setChartData] = useState<any[]>([]);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  // Exchange rate (1 USD = ~83 INR as of 2024)
  const USD_TO_INR = 83;

  // Commodity symbols mapping for Indian markets
  const commoditySymbols: { [key: string]: string } = {
    'गेहूं': 'WHEAT',
    'चावल': 'RICE',
    'मक्का': 'CORN',
    'सोयाबीन': 'SOYBEAN',
    'Wheat': 'WHEAT',
    'Rice': 'RICE',
    'Corn': 'CORN',
    'Soybean': 'SOYBEAN'
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      fetchRealTimePrices();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCrop && chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      const lineSeries = chart.addLineSeries({
        color: '#10B981',
        lineWidth: 2,
      });

      lineSeries.setData(chartData);

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [selectedCrop, chartData]);

  const fetchRealTimePrices = async () => {
    try {
      const responses = await Promise.all(
        Object.values(commoditySymbols).map(async (symbol) => {
          try {
            const response = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHAVANTAGE_API_KEY}`
            );
            const data = await response.json();

            // Check if we have valid data
            if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
              console.error(`Invalid or missing data for symbol: ${symbol}`);
              return {
                symbol,
                price: 0,
                change: 0,
                timestamp: new Date().toISOString().split('T')[0]
              };
            }

            return {
              symbol,
              price: parseFloat(data['Global Quote']['05. price']) * USD_TO_INR,
              change: parseFloat(data['Global Quote']['09. change'] || '0'),
              timestamp: data['Global Quote']['07. latest trading day'] || new Date().toISOString().split('T')[0]
            };
          } catch (error) {
            console.error(`Error fetching data for symbol: ${symbol}`, error);
            return {
              symbol,
              price: 0,
              change: 0,
              timestamp: new Date().toISOString().split('T')[0]
            };
          }
        })
      );

      // Filter out any failed responses
      const validResponses = responses.filter(response => response.price !== 0);
      setRealTimePrices(validResponses);
    } catch (error) {
      console.error('Error fetching real-time prices:', error);
      // Keep the previous prices if the update fails
    }
  };

  const fetchHistoricalData = async (symbol: string) => {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHAVANTAGE_API_KEY}`
      );
      const data = await response.json();
      
      if (!data['Time Series (Daily)']) {
        console.error('Invalid historical data response:', data);
        setChartData([]);
        return;
      }

      const timeSeriesData = data['Time Series (Daily)'];
      
      const chartData = Object.entries(timeSeriesData).map(([date, values]: [string, any]) => ({
        time: date,
        value: parseFloat(values['4. close']) * USD_TO_INR
      })).reverse();

      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setChartData([]);
    }
  };

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_research')
        .select('*');

      if (error) throw error;

      setMarketData(data || []);
      processMarketData(data || []);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMarketData = (data: MarketData[]) => {
    const cropTypes = [...new Set(data.map(item => item.crop_type))];
    
    const processed = cropTypes.map(crop => {
      const cropData = data.filter(item => item.crop_type === crop);
      
      return {
        crop_type: crop,
        avg_price: calculateAverage(cropData.map(item => item.market_price)),
        avg_profit: calculateAverage(cropData.map(item => item.profit_potential)),
        risk_distribution: {
          low: cropData.filter(item => item.market_risk === 'Low').length,
          medium: cropData.filter(item => item.market_risk === 'Medium').length,
          high: cropData.filter(item => item.market_risk === 'High').length,
        },
        trend: determineTrend(cropData),
      };
    });

    setAggregatedData(processed);
  };

  const calculateAverage = (numbers: number[]): number => {
    return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
  };

  const determineTrend = (data: MarketData[]): 'up' | 'down' | 'stable' => {
    const prices = data.map(item => item.market_price);
    const avgChange = (prices[prices.length - 1] - prices[0]) / prices.length;
    if (avgChange > 0.5) return 'up';
    if (avgChange < -0.5) return 'down';
    return 'stable';
  };

  const getRiskColor = (risk: string): string => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop);
    const symbol = commoditySymbols[crop];
    if (symbol) {
      fetchHistoricalData(symbol);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };

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

  const filteredData = marketData.filter(item =>
    item.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.market_risk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-4">{t('market.title')}</h1>
          <p className="text-gray-400">{t('market.subtitle')}</p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <BarChart3 className="h-32 w-32 text-blue-500/10" />
        </div>
      </div>

      {/* Search and Real-time Prices */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="relative flex-1 w-full md:w-auto mb-4 md:mb-0 md:mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by crop name, risk level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50"
            />
          </div>
          <button
            onClick={fetchRealTimePrices}
            className="flex items-center px-4 py-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Prices
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {realTimePrices.map((price) => (
            <div
              key={price.symbol}
              className="bg-gray-800/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => handleCropSelect(price.symbol)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{price.symbol}</span>
                <span className={price.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {price.change >= 0 ? '+' : ''}{price.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-bold">{formatPrice(price.price)}</div>
              <div className="text-sm text-gray-400 mt-1">
                Last updated: {new Date(price.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      {selectedCrop && (
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Price History: {selectedCrop}</h2>
          <div ref={chartContainerRef} className="w-full h-[300px]" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aggregatedData.map((crop) => (
          <div
            key={crop.crop_type}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{crop.crop_type}</h3>
              {crop.trend === 'up' ? (
                <ChevronUp className="h-5 w-5 text-green-500" />
              ) : crop.trend === 'down' ? (
                <ChevronDown className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-blue-500" />
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Average Price</p>
                <p className="text-2xl font-bold">{formatPrice(crop.avg_price)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Profit Potential</p>
                <p className="text-lg font-semibold text-green-500">
                  +{crop.avg_profit.toFixed(1)}%
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Risk Distribution</p>
                <div className="flex space-x-2 mt-1">
                  <div className="flex-1 bg-green-500/20 rounded-full h-2" style={{ width: `${crop.risk_distribution.low}%` }}></div>
                  <div className="flex-1 bg-yellow-500/20 rounded-full h-2" style={{ width: `${crop.risk_distribution.medium}%` }}></div>
                  <div className="flex-1 bg-red-500/20 rounded-full h-2" style={{ width: `${crop.risk_distribution.high}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <LineChart className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Market Trends</h2>
          </div>
          
          <div className="space-y-4">
            {filteredData.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.crop_type}</p>
                  <p className="text-sm text-gray-400">
                    Volume: {item.production_volume.toFixed(0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.market_price)}</p>
                  <p className={`text-sm ${getRiskColor(item.market_risk)}`}>
                    {item.market_risk} Risk
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <PieChart className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-xl font-semibold">Market Analysis</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Top Performing Crops</h3>
              <div className="space-y-3">
                {aggregatedData
                  .sort((a, b) => b.avg_profit - a.avg_profit)
                  .slice(0, 3)
                  .map((crop, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <span>{crop.crop_type}</span>
                      </div>
                      <span className="text-green-500">+{crop.avg_profit.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Market Insights</h3>
              <div className="space-y-3 text-gray-400">
                <p>• High demand expected for {aggregatedData[0]?.crop_type}</p>
                <p>• Price stability observed in {aggregatedData[1]?.crop_type}</p>
                <p>• Consider diversifying into {aggregatedData[2]?.crop_type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResearchTab;