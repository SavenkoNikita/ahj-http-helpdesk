export default class TicketView {
  static createTicketElement(ticket) {
    const ticketEl = document.createElement('div');
    ticketEl.className = 'ticket';
    ticketEl.dataset.id = ticket.id;
    
    const createdDate = new Date(ticket.created);
    const formattedDate = createdDate.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');

    ticketEl.innerHTML = `
      <div class="ticket-status">
        <input type="checkbox" ${ticket.status ? 'checked' : ''}>
      </div>
      <div class="ticket-content">
        <div class="ticket-name">${ticket.name}</div>
        <div class="ticket-description hidden"></div>
      </div>
      <div class="ticket-date">${formattedDate}</div>
      <div class="ticket-actions">
        <button class="btn-edit">✎</button>
        <button class="btn-delete">×</button>
      </div>
    `;
    
    return ticketEl;
  }

  static renderTickets(tickets, container, onTicketClick, onCheckboxChange, onEditClick, onDeleteClick) {
    container.innerHTML = '';
    
    if (tickets.length === 0) {
      container.innerHTML = '<div class="loading">Тикетов нет</div>';
      return;
    }

    tickets.forEach(ticket => {
      const ticketEl = this.createTicketElement(ticket);
      
      ticketEl.querySelector('.ticket-content').addEventListener('click', () => {
        onTicketClick(ticket, ticketEl);
      });

      ticketEl.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        onCheckboxChange(ticket.id, e.target.checked);
      });

      ticketEl.querySelector('.btn-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        onEditClick(ticket);
      });

      ticketEl.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        onDeleteClick(ticket.id);
      });

      container.appendChild(ticketEl);
    });
  }

  static toggleDescription(ticketEl, description) {
    const descElement = ticketEl.querySelector('.ticket-description');
    descElement.classList.toggle('hidden');
    
    if (!descElement.classList.contains('hidden') && !descElement.textContent) {
      descElement.textContent = description;
    }
  }
}