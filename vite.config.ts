import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Every VITE_* variable is inlined into the public client bundle. Refuse to
// build if one looks like a credential, so a secret can't leak that way again.
const SECRET_ENV_PATTERN = /^VITE_\w*(TOKEN|SECRET|PASSWORD|PRIVATE)/i;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const leaked = Object.keys({
    ...loadEnv(mode, process.cwd()),
    ...process.env,
  }).filter(key => SECRET_ENV_PATTERN.test(key));
  if (leaked.length > 0) {
    throw new Error(
      `Refusing to build: ${leaked.join(', ')} would be exposed in the client bundle. ` +
        'Move secrets to server-side env vars (see server.js).'
    );
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    define: {
      // Define environment variables for Vite
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    },
  };
});
