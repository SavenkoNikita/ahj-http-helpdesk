const Koa = require('koa');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();

app.use(cors());
app.use(koaBody({
  multipart: true,
}));

let tickets = [
  {
    id: uuidv4(),
    name: 'Поменять краску в принтере, ком. 404',
    status: false,
    description: 'Принтер HP LJ 1210, картриджи на складе',
    created: Date.now()
  },
  {
    id: uuidv4(),
    name: 'Переустановить Windows, ПК-Hall24',
    status: false,
    description: 'Необходима установка Windows 10 и офисного пакета',
    created: Date.now() - 3600000
  }
];

app.use(async (ctx) => {
  const { method, id } = ctx.request.query;

  console.log('Request:', method, id);

  try {
    switch (method) {
      case 'allTickets':
        ctx.body = tickets.map(({ id, name, status, created }) => ({
          id, name, status, created
        }));
        break;

      case 'ticketById':
        const ticket = tickets.find(t => t.id === id);
        if (ticket) {
          ctx.body = ticket;
        } else {
          ctx.status = 404;
          ctx.body = { error: 'Ticket not found' };
        }
        break;

      case 'createTicket':
        const { name, description, status } = ctx.request.body;
        const newTicket = {
          id: uuidv4(),
          name: name || 'Новый тикет',
          description: description || '',
          status: status === 'true' || status === true,
          created: Date.now()
        };
        tickets.push(newTicket);
        ctx.body = newTicket;
        break;

      case 'updateById':
        const updateData = ctx.request.body;
        const ticketIndex = tickets.findIndex(t => t.id === id);
        if (ticketIndex !== -1) {
          tickets[ticketIndex] = {
            ...tickets[ticketIndex],
            name: updateData.name || tickets[ticketIndex].name,
            description: updateData.description || tickets[ticketIndex].description,
            status: updateData.status === 'true' || updateData.status === true
          };
          ctx.body = tickets[ticketIndex];
        } else {
          ctx.status = 404;
          ctx.body = { error: 'Ticket not found' };
        }
        break;

      case 'deleteById':
        const deleteIndex = tickets.findIndex(t => t.id === id);
        if (deleteIndex !== -1) {
          tickets.splice(deleteIndex, 1);
          ctx.status = 204;
        } else {
          ctx.status = 404;
          ctx.body = { error: 'Ticket not found' };
        }
        break;

      default:
        ctx.status = 404;
        ctx.body = { error: 'Method not found' };
    }
  } catch (error) {
    console.error('Server error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

const PORT = 7070;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});