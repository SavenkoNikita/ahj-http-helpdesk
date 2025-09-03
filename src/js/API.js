export default class API {
  static baseURL = 'http://localhost:7070/';

  static async request(params = {}) {
    const url = new URL(this.baseURL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
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

  static async getAllTickets() {
    return this.request({ method: 'allTickets' });
  }

  static async getTicketById(id) {
    return this.request({ method: 'ticketById', id });
  }

  static async createTicket(ticketData) {
    const formData = new FormData();
    Object.keys(ticketData).forEach(key => formData.append(key, ticketData[key]));
    
    const response = await fetch(this.baseURL + '?method=createTicket', {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  static async updateTicket(id, ticketData) {
    const formData = new FormData();
    Object.keys(ticketData).forEach(key => formData.append(key, ticketData[key]));
    
    const response = await fetch(this.baseURL + `?method=updateById&id=${id}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  static async deleteTicket(id) {
    const response = await fetch(this.baseURL + `?method=deleteById&id=${id}`, {
      method: 'GET'
    });
    if (response.status !== 204) {
      throw new Error('Delete failed');
    }
    return true;
  }
}