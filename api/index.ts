import app from '../dist/server.cjs';

const serverApp = (app as any).default || app;

export default serverApp;
