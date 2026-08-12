export type CashierInteractionState = 'idle' | 'entering' | 'active' | 'exiting';

export interface CashierInteractionUiDiagnostics {
  state: CashierInteractionState;
  promptVisible: boolean;
}

/** Lightweight keyboard/touch UI for the register interaction foundation. */
export class CashierInteractionUI {
  private readonly prompt: HTMLButtonElement;
  private readonly panel: HTMLElement;
  private readonly exitButton: HTMLButtonElement;
  private state: CashierInteractionState = 'idle';
  private promptVisible = false;

  constructor(
    host: HTMLElement,
    private readonly onUse: () => void,
    private readonly onExit: () => void,
  ) {
    this.prompt = document.createElement('button');
    this.prompt.type = 'button';
    this.prompt.className = 'interaction-prompt';
    this.prompt.setAttribute('aria-label', 'Use Register');
    this.prompt.innerHTML = '<span class="interaction-prompt__key" aria-hidden="true">E</span><span>Use Register</span>';

    this.panel = document.createElement('section');
    this.panel.className = 'cashier-interaction-panel';
    this.panel.setAttribute('aria-live', 'polite');

    const eyebrow = document.createElement('span');
    eyebrow.className = 'cashier-interaction-panel__eyebrow';
    eyebrow.textContent = 'CASH REGISTER';

    const heading = document.createElement('strong');
    heading.textContent = 'Cashier station ready';

    const detail = document.createElement('span');
    detail.textContent = 'Billing controls arrive in the next phase.';

    this.exitButton = document.createElement('button');
    this.exitButton.type = 'button';
    this.exitButton.className = 'cashier-interaction-panel__exit';
    this.exitButton.textContent = 'Exit';

    this.panel.append(eyebrow, heading, detail, this.exitButton);
    host.append(this.prompt, this.panel);

    this.prompt.addEventListener('click', this.handleUse);
    this.exitButton.addEventListener('click', this.handleExit);
    this.prompt.addEventListener('pointerdown', this.stopPointerPropagation);
    this.panel.addEventListener('pointerdown', this.stopPointerPropagation);
    window.addEventListener('keydown', this.handleKeyDown);
    this.render();
  }

  setState(state: CashierInteractionState, promptVisible: boolean): void {
    if (state === this.state && promptVisible === this.promptVisible) return;
    this.state = state;
    this.promptVisible = promptVisible;
    this.render();
  }

  getDiagnostics(): CashierInteractionUiDiagnostics {
    return { state: this.state, promptVisible: this.promptVisible };
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.prompt.removeEventListener('click', this.handleUse);
    this.exitButton.removeEventListener('click', this.handleExit);
    this.prompt.removeEventListener('pointerdown', this.stopPointerPropagation);
    this.panel.removeEventListener('pointerdown', this.stopPointerPropagation);
    this.prompt.remove();
    this.panel.remove();
  }

  private render(): void {
    const showPrompt = this.state === 'idle' && this.promptVisible;
    const showPanel = this.state === 'entering' || this.state === 'active';
    this.prompt.classList.toggle('is-visible', showPrompt);
    this.prompt.disabled = !showPrompt;
    this.prompt.setAttribute('aria-hidden', String(!showPrompt));
    this.panel.classList.toggle('is-visible', showPanel);
    this.panel.setAttribute('aria-hidden', String(!showPanel));
    this.exitButton.disabled = !showPanel;
  }

  private readonly handleUse = (): void => {
    if (this.state === 'idle' && this.promptVisible) this.onUse();
  };

  private readonly handleExit = (): void => {
    if (this.state === 'entering' || this.state === 'active') this.onExit();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    if ((event.code === 'KeyE' || event.code === 'Enter') && this.state === 'idle' && this.promptVisible) {
      event.preventDefault();
      this.onUse();
      return;
    }
    if (
      (event.code === 'KeyE' || event.code === 'Escape') &&
      (this.state === 'entering' || this.state === 'active')
    ) {
      event.preventDefault();
      this.onExit();
    }
  };

  private readonly stopPointerPropagation = (event: PointerEvent): void => {
    event.stopPropagation();
  };
}
