const { EMPTY_VALUE } = require('../constants/data');

class IndexGenerator {
  constructor({ json, index }) {
    this.json = json;
    this.index = index;
  }

  loadData = () => {
    if (!this.validateData()) {
      return `Failed to generate index for ${this.index.getName()}.`;
    }
    this.json.forEach((document) => {
      this.indexDocumentTerms(document);
    });
  };

  validateData = () => {
    if (!this.json || !this.index.validateSchema()) {
      return false;
    }

    const valid = this.json.every((document) => {
      return Object.keys(document).every((key) => {
        const value = document[key];
        const schemaType = this.index.getKeyType(key);
        if (Array.isArray(value)) {
          return schemaType === 'array';
        }
        return schemaType === typeof value;
      });
    });

    return valid;
  };

  getSchema = () => {
    return this.index.getSchema();
  };

  indexDocumentTerms = (document) => {
    for (const [term, { type }] of Object.entries(this.getSchema())) {
      this.indexDocumentTerm({ document, term, type });
    }
  };

  indexDocumentTerm = ({ document, term, type }) => {
    const primaryKey = this.index.getPrimaryKey();
    const id = document[primaryKey];
    const value = document[term];

    if (value === undefined) {
      return this.indexItem([term, EMPTY_VALUE], id);
    }

    if (primaryKey === term) {
      return this.indexItem([term, value], document);
    }

    if (type === 'array') {
      value.forEach((item) => this.indexItem([term, item], id));
    } else {
      this.indexItem([term, value], id);
    }
  };

  indexItem = ([term, value], item) => {
    this.index.verifyAddOrUpsertItem([term, String(value).toLowerCase()], item);
  };
}

export default IndexGenerator;
