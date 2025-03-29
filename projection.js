import { setupUI } from './ui.js';
import { getDefaultState } from './state.js'

console.log("projection");

window.addEventListener('load', () => {
    console.log("projection loading");

    const defaultState = getDefaultState(2025);

    setupUI(defaultState);
});