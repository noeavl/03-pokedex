export default () => ({
  node_env: process.env.NODE_ENV,
  mongodb_uri: process.env.MONGODB_URI,
  port: process.env.PORT,
  host: process.env.HOST,
  defaultLimit: process.env.DEFAULT_LIMIT,
});
