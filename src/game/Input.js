const ACTIONS = {
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'jump', ArrowUp: 'jump', KeyS: 'slide', ArrowDown: 'slide',
  Escape: 'pause', KeyR: 'restart',
};

export class Input {
  constructor(onAction, target = window) {
    this.listener = event => {
      if (event.target?.closest?.('dialog, input, select, textarea')) return;
      const action = ACTIONS[event.code];
      if (!action) return;
      // Space on a focused menu button must retain its native activation.
      if (event.code === 'Space' && event.target?.closest?.('button')) return;
      event.preventDefault();
      if (!event.repeat) onAction(action);
    };
    this.target = target;
    target.addEventListener('keydown', this.listener);
  }
  dispose() { this.target.removeEventListener('keydown', this.listener); }
}
