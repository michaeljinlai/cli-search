import { usersSchema } from '../schemas/usersSchema';
import { ticketsSchema } from '../schemas/ticketsSchema';
import { makeFileReader } from '../utils/fileReader';
import { generateIndexes } from '../utils/generateIndexes';
import Index from '../models/index';
import IndexGenerator from '../services/IndexGenerator';

const logger = {
  log: () => {},
  error: () => {},
};

const usersSourcePath = 'usersSourcePath';
const ticketsSourcePath = 'ticketsSourcePath';

const configs = [
  {
    name: 'users',
    sourcePath: usersSourcePath,
    schema: usersSchema,
  },
  {
    name: 'tickets',
    sourcePath: ticketsSourcePath,
    schema: ticketsSchema,
  },
];

const validateSourceMock = () => true;
const readSourceMock = (path) => {
  if (path === usersSourcePath) {
    return users;
  }
  if (path === ticketsSourcePath) {
    return tickets;
  }
  return null;
};

const fileReaderMock = makeFileReader({
  validateSource: validateSourceMock,
  readSource: readSourceMock,
  logger,
});

const tickets = [
  {
    _id: '436bf9b0-1147-4c0a-8439-6f79833bff5b',
    created_at: '2016-04-28T11:19:34-10:00',
    type: 'incident',
    subject: 'A Catastrophe in Korea (North)',
    assignee_id: 24,
    tags: ['Ohio', 'Pennsylvania'],
  },
  {
    _id: '1a227508-9f39-427c-8f57-1b72f3fab87c',
    created_at: '2016-04-14T08:32:31-10:00',
    type: 'incident',
    subject: 'A Catastrophe in Micronesia',
    assignee_id: 38,
    tags: ['Puerto Rico', 'Idaho'],
  },
];

const users = [
  {
    _id: 24,
    name: 'Harris Côpeland',
    created_at: '2016-03-02T03:35:41-11:00',
    verified: false,
  },
  {
    _id: 38,
    name: 'Elma Castro',
    created_at: '2016-01-31T02:46:05-11:00',
    verified: false,
  },
];

describe('generateIndexes', () => {
  let indexes;

  beforeEach(() => {
    indexes = generateIndexes({ fileReader: fileReaderMock, logger })(configs);
  });

  it('should respond correctly to getIndexNames', () => {
    const usersIndexGenerator = new IndexGenerator({
      json: users,
      index: new Index({ name: 'users', schema: usersSchema }),
    });
    usersIndexGenerator.loadData();
    const usersIndex = usersIndexGenerator.index;

    const ticketsIndexGenerator = new IndexGenerator({
      json: tickets,
      index: new Index({ name: 'tickets', schema: ticketsSchema }),
    });
    ticketsIndexGenerator.loadData();
    const ticketsIndex = ticketsIndexGenerator.index;

    expect(JSON.stringify(indexes)).toEqual(
      JSON.stringify({
        users: usersIndex,
        tickets: ticketsIndex,
      })
    );
  });
});
