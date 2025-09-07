export default () => ({
  LIVEKIT_URL: process.env.LIVEKIT_URL,
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  APP_PORT: process.env.APP_PORT,
  NODE_ENV: process.env.NODE_ENV,
});
