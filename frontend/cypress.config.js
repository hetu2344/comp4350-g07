// import { defineConfig } from 'cypress';
// import pkg from '@cypress/vite-dev-server';
// const { startDevServer } = pkg;
// import coverageTask from '@cypress/code-coverage/task.js';
// import viteConfig from './vite.config.js';

// export default defineConfig({
//   e2e: {
//     baseUrl: 'http://localhost:8017',
//     setupNodeEvents(on, config) {
//       coverageTask(on, config);
//       on('dev-server:start', (options) => {
//         return startDevServer({
//           options,
//           viteConfig,
//         });
//       });
//       return config;
//     },
//   },
// });

import { defineConfig } from 'cypress';
import pkg from '@cypress/vite-dev-server';
const { startDevServer } = pkg;
import coverageTask from '@cypress/code-coverage/task.js';
import viteConfig from './vite.config.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8018',
    setupNodeEvents(on, config) {
      coverageTask(on, config);
      on('dev-server:start', (options) => {
        return startDevServer({
          options,
          viteConfig,
        });
      });
      return config;
    },
  },
});
