import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { setupMock } from './lib/mockSetup';

// If running in development mode locally, set up the mock server functions
if (import.meta.env.DEV) {
  setupMock(0); // No delay for local dev
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
