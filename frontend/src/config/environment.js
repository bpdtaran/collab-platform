const config = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
  },
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'http://localhost:5000',
  },
  app: {
    name: 'Collab Platform',
    version: '1.0.0',
  },
};

export default config;