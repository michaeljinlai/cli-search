import SearchRepository from './SearchRepository';
import { usersSchema } from '../schemas/usersSchema';
import { ticketsSchema } from '../schemas/ticketsSchema';
import { relationships } from '../schemas/relationships';
import { makeFileReader } from '../utils/fileReader';
import { generateIndexes } from '../utils/generateIndexes';
import { EMPTY_VALUE } from '../constants/data';
import { INDEX_NOT_FOUND } from '../constants/messages';

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

describe('IndexGenerator', () => {
  let searchRepository;

  beforeEach(() => {
    searchRepository = new SearchRepository({
      indexes,
      relationships,
      logger,
    });
  });

  it('should respond correctly to getIndexNames', () => {
    expect(searchRepository.getIndexNames()).toEqual(['users', 'tickets']);
  });

  it('should respond correctly to getNameByPositionalIndex', () => {
    expect(searchRepository.getNameByPositionalIndex(0)).toEqual('users');
    expect(searchRepository.getNameByPositionalIndex(1)).toEqual('tickets');
    expect(searchRepository.getNameByPositionalIndex(2)).toEqual(undefined);
  });

  describe('getIndexByName', () => {
    it('should return an index if found', () => {
      expect(searchRepository.getIndexByName('users')).toEqual(indexes.users);
    });

    it('should log an error if not found', () => {
      expect(searchRepository.getIndexByName('shoes')).toEqual(undefined);
      expect(errorMock).toHaveBeenCalledWith(INDEX_NOT_FOUND);
    });
  });

  describe('getIndexSearchTerms', () => {
    it('should return search terms if found', () => {
      expect(searchRepository.getIndexSearchTerms('users')).toEqual([
        '_id',
        'name',
        'created_at',
        'verified',
      ]);
    });

    it('should log an error if not found', () => {
      expect(searchRepository.getIndexSearchTerms('shoes')).toEqual(undefined);
      expect(errorMock).toHaveBeenCalledWith(INDEX_NOT_FOUND);
    });
  });

  describe('getItem', () => {
    it('should return item if found', () => {
      const index = searchRepository.getIndexByName('users');
      expect(
        searchRepository.getItem({
          index,
          searchTerm: 'name',
          value: users[0].name.toLowerCase(),
        })
      ).toEqual([users[0]._id]);
    });

    it('should return an empty array not found', () => {
      const index = searchRepository.getIndexByName('users');
      expect(
        searchRepository.getItem({
          index,
          searchTerm: 'name',
          value: 'Fake Name',
        })
      ).toEqual([]);
    });
  });

  describe('searchPrimaryKey', () => {
    it('should pass arguments to getItem', () => {
      const index = searchRepository.getIndexByName('users');
      const getItemSpy = jest.spyOn(searchRepository, 'getItem');
      searchRepository.searchPrimaryKey({
        index,
        searchTerm: 'name',
        value: 'Bob',
      });
      expect(getItemSpy).toHaveBeenCalledWith({
        index,
        searchTerm: 'name',
        value: 'Bob',
      });
    });
  });

  describe('searchEmptyValue', () => {
    it('should call getItem with an index, searchTerm and EMPTY_VALUE', () => {
      const index = searchRepository.getIndexByName('users');
      const getItemSpy = jest.spyOn(searchRepository, 'getItem');
      searchRepository.searchEmptyValue({ index, searchTerm: 'name' });
      expect(getItemSpy).toHaveBeenCalledWith({
        index,
        searchTerm: 'name',
        value: EMPTY_VALUE,
      });
    });
  });

  describe('search', () => {
    it('should call searchEmptyValue when the value is empty', () => {
      const searchEmptyValueSpy = jest.spyOn(
        searchRepository,
        'searchEmptyValue'
      );
      searchRepository.search({
        indexName: 'users',
        searchTerm: 'name',
        value: '',
      });
      expect(searchEmptyValueSpy).toHaveBeenCalledWith({
        index: indexes.users,
        searchTerm: 'name',
      });
    });

    it('should call searchPrimaryKey when the searchTerm is a primary key', () => {
      const searchPrimaryKeySpy = jest.spyOn(
        searchRepository,
        'searchPrimaryKey'
      );
      searchRepository.search({
        indexName: 'users',
        searchTerm: '_id',
        value: users[0]._id,
      });
      expect(searchPrimaryKeySpy).toHaveBeenCalledWith({
        index: indexes.users,
        searchTerm: '_id',
        value: users[0]._id,
      });
    });

    it('should call getItem when the searchTerm is not a primary key nor empty', () => {
      const getItemSpy = jest.spyOn(searchRepository, 'getItem');
      searchRepository.search({
        indexName: 'users',
        searchTerm: 'name',
        value: users[0].name,
      });
      expect(getItemSpy).toHaveBeenCalledWith({
        index: indexes.users,
        searchTerm: 'name',
        value: users[0].name,
      });
    });

    it('should log an error if the index is not found', () => {
      const getItemSpy = jest.spyOn(searchRepository, 'getItem');
      const searchPrimaryKeySpy = jest.spyOn(
        searchRepository,
        'searchPrimaryKey'
      );
      const searchEmptyValueSpy = jest.spyOn(
        searchRepository,
        'searchEmptyValue'
      );
      searchRepository.search({
        indexName: 'fakeindex',
        searchTerm: 'name',
        value: 'fake value',
      });
      expect(getItemSpy).not.toHaveBeenCalled();
      expect(searchPrimaryKeySpy).not.toHaveBeenCalled();
      expect(searchEmptyValueSpy).not.toHaveBeenCalled();
      expect(errorMock).toHaveBeenCalledWith(INDEX_NOT_FOUND);
    });
  });

  describe('searchWithRelationships', () => {
    it('should return results with hasMany relationships', () => {
      expect(
        searchRepository.searchWithRelationships({
          indexName: 'users',
          searchTerm: '_id',
          value: users[0]._id,
        })
      ).toEqual([
        {
          _id: 24,
          created_at: '2016-03-02T03:35:41-11:00',
          name: 'Harris Côpeland',
          tickets: ['A Catastrophe in Korea (North)'],
          verified: false,
        },
      ]);
    });
    it('should return results with belongsTo relationships', () => {
      expect(
        searchRepository.searchWithRelationships({
          indexName: 'tickets',
          searchTerm: '_id',
          value: tickets[0]._id,
        })
      ).toEqual([
        {
          _id: '436bf9b0-1147-4c0a-8439-6f79833bff5b',
          assignee_id: 24,
          assignee_name: 'Harris Côpeland',
          created_at: '2016-04-28T11:19:34-10:00',
          subject: 'A Catastrophe in Korea (North)',
          tags: ['Ohio', 'Pennsylvania'],
          type: 'incident',
        },
      ]);
    });
  });
});
