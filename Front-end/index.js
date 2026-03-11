console.log('[index.js] App entry point - starting');
import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

console.log('[index.js] Registering app component');
AppRegistry.registerComponent(appName, () => App);

