import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();


export default defineConfig( {
  
  server: {
    port: 80,
  },
  define: {
    'process.env': {
      ...process.env,
      
    },
  },
  plugins: [react()],
  
});
