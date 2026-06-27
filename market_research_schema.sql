-- Supabase Schema for Market Research Features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS research_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    idea TEXT NOT NULL,
    industry TEXT,
    region TEXT,
    depth TEXT,
    report_json JSONB NOT NULL,
    confidence_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES research_reports(id),
    company_name TEXT,
    website TEXT,
    pricing TEXT,
    funding_estimate TEXT,
    positioning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trend_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT,
    source TEXT,
    growth_score INTEGER,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT,
    complaint TEXT,
    frequency INTEGER,
    sentiment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT,
    pricing_model TEXT,
    monthly_price NUMERIC,
    enterprise_available BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES research_reports(id),
    insight_type TEXT,
    message TEXT,
    severity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: ClickHouse tables should be deployed in a separate ClickHouse instance.
-- market_signals, search_trends, social_trends, forecast_metrics, traffic_analytics, competitor_metrics, industry_growth, pricing_changes, startup_launches
