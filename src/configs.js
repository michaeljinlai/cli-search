import path from 'path';
import { usersSchema } from './schemas/usersSchema';
import { ticketsSchema } from './schemas/ticketsSchema';

const configs = [
  {
    name: 'users',
    sourcePath: path.join(__dirname, '..', 'data', 'users.json'),
    schema: usersSchema,
  },
  {
    name: 'tickets',
    sourcePath: path.join(__dirname, '..', 'data', 'tickets.json'),
    schema: ticketsSchema,
  },
];

export { configs };
