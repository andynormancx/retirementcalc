import { setupUI } from './ui.js';
import { getDefaultState } from './state.js'

window.addEventListener('load', () => {
    const defaultState = getDefaultState(2025);

    setupUI(defaultState);
});