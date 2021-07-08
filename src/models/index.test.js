import Index from './index';

const schema = {
  _id: { type: 'number', primaryKey: true },
  name: { type: 'string' },
  tags: { type: 'array' },
};

const userOne = { _id: 1, name: 'John Smith', tags: ['tagOne'] };
const userTwo = { _id: 2, name: 'Jane Doe', tags: ['tagOne', 'tagTwo'] };

describe('Index', () => {
  let index;

  beforeEach(() => {
    const data = {
      _id: {
        [userOne._id]: [userOne],
        [userTwo._id]: [userTwo],
      },
      name: {
        [userOne.name]: [userOne._id],
        [userTwo.name]: [userTwo._id],
      },
      tags: {
        tagOne: [userOne._id, userTwo._id],
        tagTwo: [userTwo._id],
      },
    };
    index = new Index({ name: 'users', schema, data });
  });

  it('should return name with getName', () => {
    expect(index.getName()).toEqual('users');
  });

  it('should return schema with getSchema', () => {
    expect(index.getSchema()).toEqual(schema);
  });

  it('should respond to getKeys', () => {
    expect(index.getKeys()).toEqual(['_id', 'name', 'tags']);
  });

  it('should respond to getKeyType', () => {
    expect(index.getKeyType('_id')).toEqual('number');
    expect(index.getKeyType('name')).toEqual('string');
    expect(index.getKeyType('fakeKey')).toEqual(undefined);
  });

  it('should respond to getPrimaryKey', () => {
    expect(index.getPrimaryKey()).toEqual('_id');
  });

  it('should respond to getDocumentById', () => {
    expect(index.getDocumentById(1)).toEqual([userOne]);
    expect(index.getDocumentById(99)).toEqual(undefined);
  });

  it('should respond to getItem', () => {
    expect(index.getItem(['_id', '1'])).toEqual([userOne]);
    expect(index.getItem(['_id', '99'])).toEqual(undefined);
  });

  it('should respond to verifyPath', () => {
    expect(index.verifyPath(['name', 'Bob Smith'])).toEqual(true);
    expect(index.verifyPath(['unexpectedKey', 'Bob Smith'])).toEqual(false);
    expect(index.verifyPath(['name', 'Bob Smith', 'extra'])).toEqual(false);
  });

  describe('verifyAddOrUpsertItem', () => {
    it('should do nothing if path is not verified', () => {
      index.verifyAddOrUpsertItem(['unexpectedKey', 'Bob Smith'], 3);
      expect(index.data).toEqual({
        _id: {
          1: [{ _id: 1, name: 'John Smith', tags: ['tagOne'] }],
          2: [{ _id: 2, name: 'Jane Doe', tags: ['tagOne', 'tagTwo'] }],
        },
        name: { 'Jane Doe': [2], 'John Smith': [1] },
        tags: { tagOne: [1, 2], tagTwo: [2] },
      });
    });

    it("should create a new item if it doesn't exist", () => {
      index.verifyAddOrUpsertItem(['name', 'Bob Smith'], 3);
      expect(index.data).toEqual({
        _id: {
          1: [{ _id: 1, name: 'John Smith', tags: ['tagOne'] }],
          2: [{ _id: 2, name: 'Jane Doe', tags: ['tagOne', 'tagTwo'] }],
        },
        name: { 'Bob Smith': [3], 'Jane Doe': [2], 'John Smith': [1] },
        tags: { tagOne: [1, 2], tagTwo: [2] },
      });
    });

    it('should create insert an additional item if it already exists', () => {
      index.verifyAddOrUpsertItem(['tags', 'tagOne'], 3);
      expect(index.data).toEqual({
        _id: {
          1: [{ _id: 1, name: 'John Smith', tags: ['tagOne'] }],
          2: [{ _id: 2, name: 'Jane Doe', tags: ['tagOne', 'tagTwo'] }],
        },
        name: { 'Jane Doe': [2], 'John Smith': [1] },
        tags: { tagOne: [1, 2, 3], tagTwo: [2] },
      });
    });
  });
});
