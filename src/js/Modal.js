export default class Modal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.bindEvents();
  }

  bindEvents() {
    const cancelButtons = this.modal.querySelectorAll('.btn-cancel');
    cancelButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}