import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

changeEnvFiles()

export default function changeEnvFiles() {
  fs.writeFileSync(
    './server/.env',
    `SERVER_IP=${process.env.SERVER_IP}
DB_IP=${process.env.DB_IP}
DB_USERNAME=${process.env.DB_USERNAME}
DB_PASSWORD=${process.env.DB_PASSWORD}
DB_NAME=${process.env.DB_NAME}
SERVER_PORT=${process.env.SERVER_PORT}
HTTPS_PORT=${process.env.HTTPS_PORT}
CLIENT_PORT=${process.env.CLIENT_PORT}
CERTIFICATE=../${process.env.CERTIFICATE}
PRIVATE_KEY=../${process.env.PRIVATE_KEY}
LDAP_URL=${process.env.LDAP_URL}
LDAP_LOGIN=${process.env.LDAP_LOGIN}
LDAP_PASSWORD=${process.env.LDAP_PASSWORD}
LDAP_OU_NAME=${process.env.LDAP_OU_NAME}
LDAP_DC_NAME=${process.env.LDAP_DC_NAME}`
  )
  fs.writeFileSync(
    './client/.env',
    `VITE_SERVER_IP=${process.env.SERVER_IP}
VITE_SERVER_PORT=${process.env.SERVER_PORT}
VITE_SOCKET_PORT=${process.env.HTTPS_PORT}`
  )
  fs.writeFileSync(
    './client/vite.config.ts',
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: '../${process.env.PRIVATE_KEY}',
      cert: '../${process.env.CERTIFICATE}'
    }
  }
})`
  )
  console.log('Pliki env oraz konfiguracja serwera po stronie klienta zostały zmienione/stworzone')
}
