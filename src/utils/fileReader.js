import { readFileSync, existsSync } from 'fs';

export const makeFileReader =
  ({ readSource, validateSource, logger }) =>
  (path) => {
    if (!validateSource(path)) {
      logger.error(`Source from ${path} is invalid.`);
      return null;
    }

    return readSource(path);
  };

export const readSource = (sourcePath) => {
  const buffer = readFileSync(sourcePath);
  return JSON.parse(buffer.toString());
};

export const validateSource = (sourcePath) => {
  return existsSync(sourcePath);
};
