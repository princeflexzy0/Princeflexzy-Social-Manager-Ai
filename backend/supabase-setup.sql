-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    platform VARCHAR(50) DEFAULT 'twitter',
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    posted_at TIMESTAMP WITH TIME ZONE,
    tweet_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id UUID REFERENCES tweets(id),
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tweets_status ON tweets(status);
CREATE INDEX IF NOT EXISTS idx_tweets_scheduled ON tweets(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_analytics_tweet ON analytics(tweet_id);
