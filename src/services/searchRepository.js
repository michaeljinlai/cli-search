const { EMPTY_VALUE } = require('../constants/data');
const { INDEX_NOT_FOUND } = require('../constants/messages');

class SearchRepository {
  constructor({ indexes, relationships, logger }) {
    this.indexes = indexes;
    this.relationships = relationships;
    this.logger = logger;
  }

  getIndexNames = () => {
    return Object.keys(this.indexes);
  };

  getIndexByName = (indexName) => {
    const index = this.indexes[indexName];
    if (index) {
      return index;
    }
    this.logger.error(INDEX_NOT_FOUND);
  };

  getNameByPositionalIndex = (position) => {
    return Object.keys(this.indexes)[position];
  };

  getIndexSearchTerms = (indexName) => {
    const index = this.getIndexByName(indexName);
    if (index) {
      return index.getKeys();
    }
    this.logger.error(INDEX_NOT_FOUND);
  };

  getItem = ({ index, searchTerm, value }) => {
    return index.getItem([searchTerm, value]) || [];
  };

  searchPrimaryKey = ({ index, searchTerm, value }) => {
    return this.getItem({ index, searchTerm, value });
  };

  searchEmptyValue = ({ index, searchTerm }) => {
    return this.getItem({ index, searchTerm, value: EMPTY_VALUE }).flatMap(
      index.getDocumentById
    );
  };

  search = ({ indexName, searchTerm, value }) => {
    const index = this.getIndexByName(indexName);
    if (index) {
      if (value === '') {
        return this.searchEmptyValue({ index, searchTerm });
      }
      if (index.getPrimaryKey() === searchTerm) {
        return this.searchPrimaryKey({ index, searchTerm, value });
      }
      return this.getItem({ index, searchTerm, value }).flatMap(
        index.getDocumentById
      );
    }
    this.logger.error(INDEX_NOT_FOUND);
  };

  searchWithRelationships = ({ indexName, searchTerm, value }) => {
    const results = this.search({ indexName, searchTerm, value });

    const relationships = (this.relationships[indexName] || []).filter(
      ({ entity }) => !!this.indexes[entity]
    );

    if (results && relationships) {
      results.forEach((result) => {
        relationships.forEach(
          ({
            relation,
            entity,
            primaryKeyName,
            foreignKeyName,
            foreignFieldName,
            valueFromField,
          }) => {
            if (relation === 'hasMany') {
              const associationResults = this.search({
                indexName: entity,
                searchTerm: foreignKeyName,
                value: result[primaryKeyName],
              });
              result[foreignFieldName] = associationResults.map(
                (associationResult) => associationResult[valueFromField]
              );
            }
            if (relation === 'belongsTo') {
              const associationResults = this.search({
                indexName: entity,
                searchTerm: primaryKeyName,
                value: result[foreignKeyName],
              });
              result[foreignFieldName] = associationResults.length
                ? associationResults[0][valueFromField]
                : [];
            }
          }
        );
      });
    }

    return results;
  };
}

export default SearchRepository;
