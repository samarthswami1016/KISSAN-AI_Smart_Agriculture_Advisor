# [🌾 KISSAN AI – Smart Agriculture Advisor](https://kissan-ai.netlify.app/)

**KISSAN AI** is a web-based multi-agent system designed to assist farmers in making sustainable and data-driven decisions. The platform combines real-time weather forecasting, crop health monitoring, market analysis, and personalized guidance — all in one easy-to-use interface.

---

## 🧠 Key Features

- **Multi-Agent System**: Modular agents for Farmer Advisory, Market Research, Weather Monitoring, and Crop Health Analysis.
- **Real-Time Data**: Integrated APIs including:
  - OpenWeather & WeatherAPI (Weather Forecasting)
  - AlphaVantage (Market Pricing)
  - Plant.ID (Crop Disease Identification)
- **User Authentication**: Powered by Supabase for secure access.
- **Modern Tech Stack**: Built using React, TypeScript, TailwindCSS, and Vite.
- **Multilingual Support**: Language selector for accessibility.

---

## 📁 Project Structure

```
project/
├── public/                  # Static assets
├── src/
│   ├── components/          # Modular agent components
│   ├── lib/                 # Supabase config
│   ├── App.tsx              # Main app logic
│   └── main.tsx             # Entry point
├── .env                     # API keys
├── tailwind.config.js       # TailwindCSS setup
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite build config
```

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/samarthswami1016/KISSAN-AI_Smart_Agriculture_Advisor.git
   cd kissan-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   VITE_OPENWEATHER_API_KEY=your_openweather_key
   VITE_WEATHERAPI_KEY=your_weatherapi_key
   VITE_PLANTID_API_KEY=your_plantid_key
   VITE_ALPHAVANTAGE_API_KEY=your_alphavantage_key
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

---

## 🔮 Future Enhancements

- SQLite integration for long-term memory and offline support
- Improve UI/UX for enhanced user experience
- Higher accuracy and efficiency using advanced models
- IoT sensor integration (soil/moisture data)

---

## 🤝 Contributions

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
