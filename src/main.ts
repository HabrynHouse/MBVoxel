import { Game } from './game/Game';
import { hideLoading, showError } from './ui/UIManager';

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

async function start(): Promise<void> {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  if (!canvas) {
    showError('Canvas element not found.');
    return;
  }

  resizeCanvas(canvas);

  try {
    const game = new Game(canvas);
    hideLoading();

    const resize = () => {
      resizeCanvas(canvas);
      game.resize();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => {
      setTimeout(resize, 100);
    });
  } catch (error) {
    console.error(error);
    showError(
      error instanceof Error
        ? error.message
        : 'Failed to start the 3D engine. Try refreshing the page.'
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void start();
  });
} else {
  void start();
}
