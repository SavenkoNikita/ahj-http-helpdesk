export default class API {
  static baseURL = window.location.hostname === 'localhost' 
    ? 'http://localhost:7070/'
    : '/';

  static async request(params = {}) {
    if (window.location.hostname !== 'localhost') {
      return this.mockResponse(params);
    }

    const url = new URL(this.baseURL);
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static mockResponse(params) {
    const mockTickets = [
      {
        id: '1',
        name: 'Поменять краску в принтере, ком. 404',
        status: false,
        description: 'Принтер HP LJ 1210, картриджи на складе',
        created: Date.now()
      },
      {
        id: '2', 
        name: 'Переустановить Windows, ПК-Hall24',
        status: true,
        description: 'Установка Windows 10 и офисного пакета',
        created: Date.now() - 3600000
      }
    ];

    switch (params.method) {
      case 'allTickets':
        return mockTickets.map(({ id, name, status, created }) => 
          ({ id, name, status, created }));
      
      case 'ticketById':
        const ticket = mockTickets.find(t => t.id === params.id);
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
      
      case 'createTicket':
        const newTicket = {
          id: String(Date.now()),
          name: params.name || 'Новый тикет',
          description: params.description || '',
          status: false,
          created: Date.now()
        };
        mockTickets.push(newTicket);
        return newTicket;
      
      case 'updateById':
        const ticketIndex = mockTickets.findIndex(t => t.id === params.id);
        if (ticketIndex === -1) throw new Error('Ticket not found');
        mockTickets[ticketIndex] = {
          ...mockTickets[ticketIndex],
          name: params.name || mockTickets[ticketIndex].name,
          description: params.description || mockTickets[ticketIndex].description,
          status: params.status || mockTickets[ticketIndex].status
        };
        return mockTickets[ticketIndex];
      
      case 'deleteById':
        const deleteIndex = mockTickets.findIndex(t => t.id === params.id);
        if (deleteIndex === -1) throw new Error('Ticket not found');
        mockTickets.splice(deleteIndex, 1);
        return { success: true };
      
      default:
        throw new Error('Method not found');
    }
  }

  static async getAllTickets() {
    return this.request({ method: 'allTickets' });
  }

  static async getTicketById(id) {
    return this.request({ method: 'ticketById', id });
  }

  static async createTicket(ticketData) {
    if (window.location.hostname !== 'localhost') {
      return this.request({ 
        method: 'createTicket', 
        name: ticketData.name,
        description: ticketData.description,
        status: ticketData.status
      });
    }

    const formData = new FormData();
    formData.append('name', ticketData.name);
    formData.append('description', ticketData.description || '');
    formData.append('status', ticketData.status || false);
    
    const response = await fetch(`${this.baseURL}?method=createTicket`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  static async updateTicket(id, ticketData) {
    if (window.location.hostname !== 'localhost') {
      return this.request({ 
        method: 'updateById', 
        id: id,
        name: ticketData.name,
        description: ticketData.description,
        status: ticketData.status
      });
    }

    const formData = new FormData();
    formData.append('name', ticketData.name);
    formData.append('description', ticketData.description || '');
    formData.append('status', ticketData.status || false);
    
    const response = await fetch(`${this.baseURL}?method=updateById&id=${id}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  static async deleteTicket(id) {
    if (window.location.hostname !== 'localhost') {
      return this.request({ method: 'deleteById', id });
    }

    const response = await fetch(`${this.baseURL}?method=deleteById&id=${id}`);
    if (response.status !== 204) {
      throw new Error('Delete failed');
    }
    return true;
  }
}