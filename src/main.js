import { UI } from './ui/UI.js';

const ui = new UI();
export let game = null;
export let assistant = null;
try {
  // Dynamic import keeps initialization errors visible even if a dependency fails.
  const { Game } = await import('./game/Game.js');
  game = new Game(document.querySelector('#scene'), ui);
  ui.bind(game);
  game.start();
} catch (error) {
  console.error(error);
  ui.error(error.message);
}
try {
  const { AssistantUI } = await import('./assistant/AssistantUI.js');
  assistant = new AssistantUI();
} catch (error) {
  console.warn('Assistente local indisponível:', error.message);
  document.querySelector('#assistant-open').disabled=true;
}
