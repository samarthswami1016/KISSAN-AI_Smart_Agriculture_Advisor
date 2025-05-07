import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, AlertTriangle, Info, Settings } from 'lucide-react';

const AlertsTab = () => {
  const { t } = useTranslation();

  const alerts = [
    {
      title: t('alerts.pestAlert.title'),
      message: t('alerts.pestAlert.message'),
      time: t('alerts.pestAlert.time'),
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: t('alerts.weatherUpdate.title'),
      message: t('alerts.weatherUpdate.message'),
      time: t('alerts.weatherUpdate.time'),
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('alerts.marketAlert.title'),
      message: t('alerts.marketAlert.message'),
      time: t('alerts.marketAlert.time'),
      icon: Bell,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-4">{t('alerts.header')}</h1>
          <p className="text-gray-400">{t('alerts.subHeader')}</p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <Bell className="h-32 w-32 text-yellow-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className={`${alert.bgColor} p-2 rounded-lg`}>
                  <alert.icon className={`h-6 w-6 ${alert.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{alert.title}</h2>
                    <span className="text-sm text-gray-400">{alert.time}</span>
                  </div>
                  <p className="mt-2 text-gray-400">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">{t('alerts.settings.title')}</h2>
          </div>
          <div className="space-y-6">
            <AlertSwitch
              icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
              label={t('alerts.settings.weather')}
              mode={t('alerts.settings.push_sms')}
            />
            <AlertSwitch
              icon={<Bell className="h-5 w-5 text-blue-500" />}
              label={t('alerts.settings.pest')}
              mode={t('alerts.settings.push')}
            />
            <AlertSwitch
              icon={<Info className="h-5 w-5 text-green-500" />}
              label={t('alerts.settings.market')}
              mode={t('alerts.settings.sms')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertSwitch = ({ icon, label, mode }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
    <div className="flex items-center space-x-3">
      {icon}
      <span>{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">{mode}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" defaultChecked />
        <div className="w-10 h-6 bg-gray-700 rounded-full"></div>
        <div className="absolute left-1 top-1 bg-green-500 w-4 h-4 rounded-full transition-transform transform translate-x-4"></div>
      </div>
    </div>
  </div>
);

export default AlertsTab;
