import { usersSchema } from './schemas/usersSchema';
import { ticketsSchema } from './schemas/ticketsSchema';
import { relationships } from './schemas/relationships';
import { makeFileReader } from './utils/fileReader';
import { generateIndexes } from './utils/generateIndexes';
import { INVALID_OPTION, INVALID_TERM } from './constants/messages';
import SearchRepository from './services/searchRepository';
import SearchApplication, { DEFAULT_STATE } from './searchApplication';

const onQuitMock = jest.fn();
const logMock = jest.fn();
const errorMock = jest.fn();

const logger = {
  log: logMock,
  error: errorMock,
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

const indexes = generateIndexes({ fileReader: fileReaderMock, logger })(
  configs
);
const searchRepository = new SearchRepository({
  indexes,
  relationships,
  logger,
});

describe('SearchApplication', () => {
  it('should initialize with default state if none is passed', () => {
    const searchApplication = new SearchApplication({
      searchRepository,
      logger,
      onQuit: onQuitMock,
    });
    expect(searchApplication.state).toEqual(DEFAULT_STATE);
  });

  it('should initialize with initial state it is passed', () => {
    const initialState = {
      menu: false,
      indexName: 'users',
      searchTerm: null,
      value: null,
    };
    const searchApplication = new SearchApplication({
      searchRepository,
      logger,
      onQuit: onQuitMock,
      initialState,
    });
    expect(searchApplication.state).toEqual(initialState);
  });

  describe('When the user is at the menu', () => {
    let searchApplication;

    beforeEach(() => {
      searchApplication = new SearchApplication({
        searchRepository,
        logger,
        onQuit: onQuitMock,
        initialState: {
          menu: true,
          indexName: null,
          searchTerm: null,
          value: null,
        },
      });
    });

    it("should call onQuit when input is 'quit'", () => {
      searchApplication.onCommand('quit');
      expect(onQuitMock).toHaveBeenCalledTimes(1);
    });

    it('should show the correct prompt', () => {
      expect(searchApplication.getPrompt()).toEqual(
        searchApplication.welcomeMessage()
      );
    });

    it('should transition to index name question when input is 1', () => {
      searchApplication.onCommand('1');
      expect(searchApplication.state).toEqual({
        indexName: null,
        menu: false,
        searchTerm: null,
        value: null,
      });
    });

    it('should show searchable fields when input is 2', () => {
      searchApplication.onCommand('2');
      expect(logMock).toHaveBeenCalledWith(
        searchApplication.searchableFieldsMessage()
      );
    });

    it('should return error when input is invalid', () => {
      searchApplication.onCommand('blah blah');
      expect(errorMock).toHaveBeenCalledWith(INVALID_OPTION);
    });
  });

  describe('When the user is at the index name question', () => {
    let searchApplication;

    beforeEach(() => {
      searchApplication = new SearchApplication({
        searchRepository,
        logger,
        onQuit: onQuitMock,
        initialState: {
          menu: false,
          indexName: 'users',
          searchTerm: null,
          value: null,
        },
      });
    });

    it("should call onQuit when input is 'quit'", () => {
      searchApplication.onCommand('quit');
      expect(onQuitMock).toHaveBeenCalledTimes(1);
    });

    it('should show the correct prompt', () => {
      expect(searchApplication.getPrompt()).toEqual('Enter search term\n');
    });

    it('should transition to search term question when input is valid', () => {
      searchApplication.onCommand('_id');
      expect(searchApplication.state).toEqual({
        indexName: 'users',
        menu: false,
        searchTerm: '_id',
        value: null,
      });
    });

    it('should show error when input is invalid', () => {
      searchApplication.onCommand('faketerm');
      expect(errorMock).toHaveBeenCalledWith(INVALID_TERM);
      expect(searchApplication.state).toEqual({
        indexName: 'users',
        menu: false,
        searchTerm: null,
        value: null,
      });
    });
  });

  describe('When the user is at the search value question', () => {
    let searchApplication;

    beforeEach(() => {
      searchApplication = new SearchApplication({
        searchRepository,
        logger,
        onQuit: onQuitMock,
        initialState: {
          menu: false,
          indexName: 'users',
          searchTerm: '_id',
          value: null,
        },
      });
    });

    it("should call onQuit when input is 'quit'", () => {
      searchApplication.onCommand('quit');
      expect(onQuitMock).toHaveBeenCalledTimes(1);
    });

    it('should show the correct prompt', () => {
      expect(searchApplication.getPrompt()).toEqual('Enter search value\n');
    });

    it('should reset the state', () => {
      searchApplication.onCommand('1');
      expect(searchApplication.state).toEqual({
        indexName: null,
        menu: true,
        searchTerm: null,
        value: null,
      });
    });

    it('should show search results if there are results', () => {
      const displayResultsMock = jest.spyOn(
        searchApplication,
        'displayResults'
      );
      searchApplication.onCommand('38');
      expect(displayResultsMock).toHaveBeenCalledWith([
        {
          _id: 38,
          name: 'Elma Castro',
          created_at: '2016-01-31T02:46:05-11:00',
          verified: false,
          tickets: ['A Catastrophe in Micronesia'],
        },
      ]);
    });

    it('should show message if there are no results', () => {
      searchApplication.onCommand('999');
      expect(logMock).toHaveBeenCalledWith('No results found\n');
    });
  });
});
