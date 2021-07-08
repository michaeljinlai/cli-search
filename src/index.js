import { createInterface } from 'readline';
import { configs } from './configs';
import { relationships } from './schemas/relationships';
import { makeFileReader, readSource, validateSource } from './utils/fileReader';
import { logger } from './utils/logger';
import { generateIndexes } from './utils/generateIndexes';
import SearchRepository from './services/searchRepository';
import SearchApplication from './searchApplication';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fileReader = makeFileReader({ validateSource, readSource, logger });
const indexes = generateIndexes({ fileReader, logger })(configs);
const searchRepository = new SearchRepository({
  indexes,
  relationships,
  logger,
});
const onQuit = () => readline.close();
const searchApplication = new SearchApplication({
  searchRepository,
  logger,
  onQuit,
});

readline
  .on('line', (line) => {
    searchApplication.onCommand(line);
    readline.setPrompt(searchApplication.getPrompt());
    readline.prompt();
  })
  .on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  })
  .setPrompt(searchApplication.getPrompt());

readline.prompt();
