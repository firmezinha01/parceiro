import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import os from 'os'

function getLanIp() {
  const interfaces = os.networkInterfaces();
  
  // 1. Prioritize Wi-Fi interface if present
  for (const name of Object.keys(interfaces)) {
    if (/wi-fi|wireless|wlan/i.test(name)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  // 2. Prioritize common home network subnets (filter out virtual hotspot/APPA)
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!iface.address.startsWith('192.168.137.') && !iface.address.startsWith('169.254.')) {
          return iface.address;
        }
      }
    }
  }

  return 'localhost';
}

import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'lan-ip-detector',
      configureServer(server) {
        server.middlewares.use('/api/lan-ip', (_req, res) => {
          let publicUrl = null;
          try {
            if (fs.existsSync('tunnel_url.txt')) {
              publicUrl = fs.readFileSync('tunnel_url.txt', 'utf8').trim();
            }
          } catch {}

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ ip: getLanIp(), publicUrl }));
        });
      },
    },
  ],
})
