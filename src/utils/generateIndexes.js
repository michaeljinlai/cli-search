import Index from '../models/index';
import IndexGenerator from '../services/indexGenerator';

export const generateIndexes =
  ({ logger, fileReader }) =>
  (configs) => {
    logger.log('Generating indexes...');

    const indexes = configs.reduce((indexes, { sourcePath, schema, name }) => {
      const json = fileReader(sourcePath);

      const index = new Index({ name, schema });
      const indexGenerator = new IndexGenerator({ json, index });

      const error = indexGenerator.loadData();

      if (error) {
        logger.error(error);
        return indexes;
      }

      return {
        ...indexes,
        [name]: indexGenerator.index,
      };
    }, {});

    logger.log('Finished generating indexes!');

    return indexes;
  };
