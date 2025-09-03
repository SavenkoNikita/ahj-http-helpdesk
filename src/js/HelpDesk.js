import Modal from './Modal.js';
import API from './API.js';
import TicketView from './TicketView.js';

export default class HelpDesk {
  constructor() {
    this.editModal = null;
    this.deleteModal = null;
    this.ticketsContainer = null;
    this.currentTicket = null;
    this.init();
  }

  init() {
    this.bindDOMEvents();
    this.createModals();
    this.loadTickets();
  }

  bindDOMEvents() {
    const addButton = document.querySelector('.btn-add-ticket');
    addButton.addEventListener('click', () => this.openEditModal());

    const ticketForm = document.getElementById('ticketForm');
    ticketForm.addEventListener('submit', (e) => this.onFormSubmit(e));

    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');
    confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
  }

  createModals() {
    const editModalElement = document.getElementById('editModal');
    const deleteModalElement = document.getElementById('deleteModal');
    
    this.editModal = new Modal(editModalElement);
    this.deleteModal = new Modal(deleteModalElement);
  }

  async loadTickets() {
    this.ticketsContainer = document.querySelector('.tickets-container');
    this.ticketsContainer.innerHTML = '<div class="loading">Загрузка тикетов...</div>';
    
    try {
      const tickets = await API.getAllTickets();
      this.renderTickets(tickets);
    } catch (error) {
      this.showError('Ошибка загрузки тикетов');
    }
  }

  renderTickets(tickets) {
    TicketView.renderTickets(
      tickets,
      this.ticketsContainer,
      (ticket, ticketEl) => this.onTicketClick(ticket, ticketEl),
      (id, status) => this.onCheckboxChange(id, status),
      (ticket) => this.onEditClick(ticket),
      (id) => this.onDeleteClick(id)
    );
  }

  async onTicketClick(ticket, ticketEl) {
    try {
      const fullTicket = await API.getTicketById(ticket.id);
      TicketView.toggleDescription(ticketEl, fullTicket.description);
    } catch (error) {
      console.error('Failed to load ticket details:', error);
    }
  }

  async onCheckboxChange(id, status) {
    try {
      const ticket = await API.getTicketById(id);
      await API.updateTicket(id, {
        ...ticket,
        status: status
      });
      await this.loadTickets();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  }

  onEditClick(ticket) {
    this.currentTicket = ticket;
    this.openEditModal(ticket);
  }

  onDeleteClick(id) {
    this.currentTicket = { id };
    this.openDeleteModal();
  }

  openEditModal(ticket = null) {
    const form = document.getElementById('ticketForm');
    const title = document.querySelector('.modal-title');
    
    if (ticket) {
      title.textContent = 'Изменить тикет';
      form.querySelector('[name="name"]').value = ticket.name;
      form.querySelector('[name="description"]').value = '';
      this.loadTicketDescription(ticket.id);
    } else {
      title.textContent = 'Добавить тикет';
      form.reset();
    }
    
    this.editModal.open();
  }

  async loadTicketDescription(id) {
    try {
      const ticket = await API.getTicketById(id);
      document.querySelector('[name="description"]').value = ticket.description || '';
    } catch (error) {
      console.error('Failed to load description:', error);
    }
  }

  openDeleteModal() {
    this.deleteModal.open();
  }

  async onFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');
    
    try {
      if (this.currentTicket && this.currentTicket.id) {
        await API.updateTicket(this.currentTicket.id, {
          name,
          description,
          status: this.currentTicket.status || false
        });
      } else {
        await API.createTicket({
          name,
          description,
          status: false
        });
      }
      
      this.editModal.close();
      await this.loadTickets();
      this.currentTicket = null;
      
    } catch (error) {
      console.error('Failed to save ticket:', error);
      alert('Ошибка сохранения тикета');
    }
  }

  async confirmDelete() {
    if (!this.currentTicket) return;
    
    try {
      await API.deleteTicket(this.currentTicket.id);
      this.deleteModal.close();
      await this.loadTickets();
      this.currentTicket = null;
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Ошибка удаления тикета');
    }
  }

  showError(message) {
    this.ticketsContainer.innerHTML = `<div class="loading">${message}</div>`;
  }
}