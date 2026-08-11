import './styles.css';
import { Game } from './game/Game';

const hostElement = document.querySelector<HTMLElement>('#app');
if (!hostElement) throw new Error('Missing #app game host.');
const host: HTMLElement = hostElement;

let game: Game | undefined;

function showStartupError(error: unknown): void {
  console.error('Kirana Dai failed to initialize.', error);

  const panel = document.createElement('section');
  panel.className = 'startup-error';

  const heading = document.createElement('h1');
  heading.textContent = 'Unable to start the 3D renderer';

  const detail = document.createElement('p');
  detail.textContent =
    error instanceof Error
      ? error.message
      : 'This browser may not support the required WebGL features.';

  panel.append(heading, detail);
  host.replaceChildren(panel);
}

function disposeGame(): void {
  game?.dispose();
  game = undefined;
}

try {
  game = new Game(host);
  game.start();
} catch (error) {
  disposeGame();
  showStartupError(error);
}

window.addEventListener('beforeunload', disposeGame, { once: true });

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('beforeunload', disposeGame);
    disposeGame();
  });
}
