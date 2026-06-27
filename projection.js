import { setupUI } from './ui.js?v=1';
import { getDefaultState } from './state.js?v=1'

window.addEventListener('load', () => {
    const defaultState = getDefaultState(2026);

    setupUI(defaultState);
});