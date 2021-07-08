class Index {
  constructor({ name, schema, data = {} }) {
    this.name = name;
    this.schema = schema;
    this.data = Object.assign({}, data);
  }

  getName = () => {
    return this.name;
  };

  getSchema = () => {
    return this.schema;
  };

  getKeys = () => {
    return Object.keys(this.data);
  };

  getKeyType = (key) => {
    const schemaItem = this.getSchema()[key];
    return schemaItem && schemaItem.type;
  };

  getPrimaryKey = () => {
    return Object.keys(this.schema).find(
      (key) => this.schema[key].primaryKey === true
    );
  };

  getDocumentById = (id) => {
    const primaryKey = this.getPrimaryKey();
    return this.data[primaryKey][id];
  };

  getItem = (path) => {
    return path.reduce(
      (prevObject, key) => prevObject && prevObject[key],
      this.data
    );
  };

  verifyPath = (path) => {
    switch (true) {
      case !Array.isArray(path):
      case path.length !== 2:
      case !Object.keys(this.getSchema()).includes(path[0]):
        return false;
      default:
        return true;
    }
  };

  verifyAddOrUpsertItem = (path, value) => {
    if (this.verifyPath(path)) {
      if (!this.getItem(path)) {
        this.addItem(path, [value]);
      } else {
        this.upsertItem(path, value);
      }
    }
  };

  addItem = (path, value) => {
    path.reduce((acc, key, index) => {
      if (acc[key] === undefined) {
        acc[key] = {};
      }
      if (index === path.length - 1) {
        acc[key] = value;
      }
      return acc[key];
    }, this.data);
  };

  upsertItem = (path, value) => {
    path.reduce((acc, key, index) => {
      if (index === path.length - 1) {
        acc[key].push(value);
      }
      return acc[key];
    }, this.data);
  };

  validateSchema = () => {
    const schemaItemsWithPrimaryKey = Object.values(this.schema).filter(
      ({ primaryKey }) => primaryKey === true
    );
    return schemaItemsWithPrimaryKey.length === 1;
  };
}

export default Index;
