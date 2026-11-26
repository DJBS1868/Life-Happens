import { boot } from './ui.js';
import * as game from './game.js';

// Expose a tiny debug surface for automated checks and curious players.
window.LifeHappens = { game };

boot();
