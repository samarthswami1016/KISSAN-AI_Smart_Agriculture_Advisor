/*
  # Market Research Data Schema

  1. New Tables
    - `market_research`
      - `id` (uuid, primary key)
      - `crop_type` (text) - Type of crop (Wheat, Rice, Corn, Soybean)
      - `production_volume` (numeric) - Production volume
      - `market_price` (numeric) - Market price
      - `demand_forecast` (numeric) - Demand forecast
      - `supply_forecast` (numeric) - Supply forecast
      - `price_volatility` (numeric) - Price volatility index
      - `storage_capacity` (numeric) - Available storage capacity
      - `market_risk` (text) - Risk level (Low, Medium, High)
      - `profit_potential` (numeric) - Potential profit margin
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on market_research table
    - Add policies for authenticated users to read data
*/

-- Create market research table
CREATE TABLE IF NOT EXISTS market_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type text NOT NULL,
  production_volume numeric NOT NULL,
  market_price numeric NOT NULL,
  demand_forecast numeric NOT NULL,
  supply_forecast numeric NOT NULL,
  price_volatility numeric NOT NULL,
  storage_capacity numeric NOT NULL,
  market_risk text NOT NULL,
  profit_potential numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read data
CREATE POLICY "Users can read market research data"
  ON market_research
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on crop_type for faster queries
CREATE INDEX IF NOT EXISTS idx_market_research_crop_type ON market_research(crop_type);

-- Create index on market_risk for faster filtering
CREATE INDEX IF NOT EXISTS idx_market_research_risk ON market_research(market_risk);

-- Insert the market research data
INSERT INTO market_research (
  crop_type,
  production_volume,
  market_price,
  demand_forecast,
  supply_forecast,
  price_volatility,
  storage_capacity,
  market_risk,
  profit_potential
) VALUES 
  -- First few rows as example, you'll need to add all rows
  ('Corn', 390.4950982, 146.0534429, 99.30743714, 440.8955732, 1.419497276, 59.64024166, 'High', 58.94441879),
  ('Rice', 403.222271, 178.8039065, 136.2252996, 158.3018355, 1.445731487, 42.54188915, 'Low', 124.3836132),
  ('Soybean', 344.9845461, 181.2838339, 92.26001768, 346.8500643, 0.617148418, 30.44215896, 'Medium', 119.6022897);
  -- ... Add remaining rows