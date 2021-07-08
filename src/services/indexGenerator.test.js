import IndexGenerator from '../services/indexGenerator';
import Index from '../models/index';
import { EMPTY_VALUE } from '../constants/data';

const schema = {
  _id: { type: 'number', primaryKey: true },
  name: { type: 'string' },
  created_at: { type: 'string' },
  verified: { type: 'boolean' },
  tags: { type: 'array' },
};

describe('IndexGenerator', () => {
  let indexGenerator;

  beforeEach(() => {
    const index = new Index({ name: 'users', schema });
    const json = [
      {
        _id: 1,
        name: 'Francisca Rasmussen',
        created_at: 'some-date',
        verified: true,
        tags: ['tagOne'],
      },
      {
        _id: 2,
        name: 'Cross Barlow',
        created_at: '2016-06-23T10:31:39-10:00',
        verified: true,
        tags: ['tagOne', 'tagTwo'],
      },
    ];
    indexGenerator = new IndexGenerator({ json, index });
  });

  it('should initialise with an empty index', () => {
    expect(indexGenerator.index.data).toEqual({});
  });

  it('should validate if the data conforms with the schema', () => {
    expect(indexGenerator.validateData()).toEqual(true);
  });

  it('should not validate if the data does not conform with the schema', () => {
    const index = new Index({ name: 'users', schema });
    const json = [
      {
        _id: 1,
        name: 'Francisca Rasmussen',
        created_at: 'some-date',
        verified: true,
        invalidKey: true,
      },
      {
        _id: 2,
        name: 'Cross Barlow',
        created_at: '2016-06-23T10:31:39-10:00',
        verified: true,
        invalidKey: true,
      },
    ];
    indexGenerator = new IndexGenerator({ json, index });
    expect(indexGenerator.validateData()).toEqual(false);
  });

  it('should respond to getSchema', () => {
    expect(indexGenerator.getSchema()).toEqual(schema);
  });

  it('should respond to indexItem', () => {
    const verifyAddOrUpsertItemSpy = jest.spyOn(
      indexGenerator.index,
      'verifyAddOrUpsertItem'
    );

    indexGenerator.indexItem(['name', 'CrossBarlow'], 2);
    expect(verifyAddOrUpsertItemSpy).toHaveBeenCalledWith(
      ['name', 'crossbarlow'],
      2
    );
  });

  it('should call indexDocumentTerm for each property when calling indexDocumentTerms', () => {
    const indexDocumentTermSpy = jest.spyOn(
      indexGenerator,
      'indexDocumentTerm'
    );
    const document = {
      _id: 3,
      name: 'Bob Smith',
      created_at: 'some-date',
      verified: true,
      tags: ['tagOne'],
    };

    indexGenerator.indexDocumentTerms(document);
    expect(indexDocumentTermSpy).toHaveBeenCalledTimes(5);
    expect(indexDocumentTermSpy).toHaveBeenCalledWith({
      document: {
        _id: 3,
        created_at: 'some-date',
        name: 'Bob Smith',
        verified: true,
        tags: ['tagOne'],
      },
      term: '_id',
      type: 'number',
    });
    expect(indexDocumentTermSpy).toHaveBeenCalledWith({
      document: {
        _id: 3,
        created_at: 'some-date',
        name: 'Bob Smith',
        verified: true,
        tags: ['tagOne'],
      },
      term: 'name',
      type: 'string',
    });
    expect(indexDocumentTermSpy).toHaveBeenCalledWith({
      document: {
        _id: 3,
        created_at: 'some-date',
        name: 'Bob Smith',
        verified: true,
        tags: ['tagOne'],
      },
      term: 'created_at',
      type: 'string',
    });
    expect(indexDocumentTermSpy).toHaveBeenCalledWith({
      document: {
        _id: 3,
        created_at: 'some-date',
        name: 'Bob Smith',
        verified: true,
        tags: ['tagOne'],
      },
      term: 'verified',
      type: 'boolean',
    });
    expect(indexDocumentTermSpy).toHaveBeenCalledWith({
      document: {
        _id: 3,
        created_at: 'some-date',
        name: 'Bob Smith',
        verified: true,
        tags: ['tagOne'],
      },
      term: 'tags',
      type: 'array',
    });
  });

  describe('loadData', () => {
    it('should call indexDocumentTerms for each document when running loadData', () => {
      const indexDocumentTermsSpy = jest.spyOn(
        indexGenerator,
        'indexDocumentTerms'
      );

      indexGenerator.loadData();
      expect(indexDocumentTermsSpy).toHaveBeenCalledTimes(2);
      expect(indexDocumentTermsSpy).toHaveBeenCalledWith({
        _id: 1,
        name: 'Francisca Rasmussen',
        created_at: 'some-date',
        verified: true,
        tags: ['tagOne'],
      });
      expect(indexDocumentTermsSpy).toHaveBeenCalledWith({
        _id: 2,
        name: 'Cross Barlow',
        created_at: '2016-06-23T10:31:39-10:00',
        verified: true,
        tags: ['tagOne', 'tagTwo'],
      });
    });

    it('should return an error if data does not validate', () => {
      const index = new Index({ name: 'users', schema });
      const json = [
        {
          _id: 1,
          name: 'Francisca Rasmussen',
          created_at: 'some-date',
          verified: true,
          invalidAttribute: true,
        },
        {
          _id: 2,
          name: 'Cross Barlow',
          created_at: '2016-06-23T10:31:39-10:00',
          verified: true,
          invalidAttribute: true,
        },
      ];
      indexGenerator = new IndexGenerator({ json, index });
      expect(indexGenerator.loadData()).toEqual(
        'Failed to generate index for users.'
      );
    });
  });

  describe('indexDocumentTerm', () => {
    it('should index term, value and id when it is not an array, primary key or empty', () => {
      const indexItemSpy = jest.spyOn(indexGenerator, 'indexItem');
      const document = {
        _id: 3,
        name: 'Bob Smith',
        created_at: 'some-date',
        verified: true,
      };

      indexGenerator.indexDocumentTerm({
        document,
        term: 'name',
        type: 'string',
      });
      expect(indexItemSpy).toHaveBeenCalledWith(['name', 'Bob Smith'], 3);
    });

    it('should index term, empty-value and id when it is an empty', () => {
      const indexItemSpy = jest.spyOn(indexGenerator, 'indexItem');
      const document = {
        _id: 3,
        name: 'Bob Smith',
        created_at: 'some-date',
      };

      indexGenerator.indexDocumentTerm({
        document,
        term: 'verified',
        type: 'number',
      });
      expect(indexItemSpy).toHaveBeenCalledWith(['verified', EMPTY_VALUE], 3);
    });

    it('should index term, value and document when it is the primary key', () => {
      const indexItemSpy = jest.spyOn(indexGenerator, 'indexItem');
      const document = {
        _id: 3,
        name: 'Bob Smith',
        created_at: 'some-date',
        verified: true,
      };

      indexGenerator.indexDocumentTerm({
        document,
        term: '_id',
        type: 'string',
      });
      expect(indexItemSpy).toHaveBeenCalledWith(['_id', 3], document);
    });

    it('should index term, each array item and id when it is of type array', () => {
      const indexItemSpy = jest.spyOn(indexGenerator, 'indexItem');
      const document = {
        _id: 3,
        name: 'Bob Smith',
        created_at: 'some-date',
        verified: true,
        tags: ['tagOne', 'tagTwo'],
      };

      indexGenerator.indexDocumentTerm({
        document,
        term: 'tags',
        type: 'array',
      });
      expect(indexItemSpy).toHaveBeenCalledTimes(2);
      expect(indexItemSpy).toHaveBeenCalledWith(['tags', 'tagOne'], 3);
      expect(indexItemSpy).toHaveBeenCalledWith(['tags', 'tagTwo'], 3);
    });
  });
});
