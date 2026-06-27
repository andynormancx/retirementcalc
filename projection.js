import { setupUI, loadStartupScenario } from './ui.js?v=2';
import { getDefaultState } from './state.js?v=2'

window.addEventListener('load', () => {
    const defaultState = getDefaultState(2026);

    setupUI(defaultState);
    loadStartupScenario();
});