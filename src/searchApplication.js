import { INVALID_OPTION, INVALID_TERM } from './constants/messages';
import { addTabs } from './utils/addTabs';
import { capitalize } from './utils/capitalize';

export const DEFAULT_STATE = {
  menu: true,
  indexName: null,
  searchTerm: null,
  value: null,
};

class SearchApplication {
  constructor({
    logger,
    searchRepository,
    onQuit,
    initialState = DEFAULT_STATE,
  }) {
    this.onQuit = onQuit;
    this.searchRepository = searchRepository;
    this.state = Object.assign({}, initialState);
    this.logger = logger;
  }

  reset = () => {
    this.state = {
      menu: true,
      indexName: null,
      searchTerm: null,
      value: null,
    };
  };

  quit = () => {
    this.onQuit && this.onQuit();
  };

  updateState = (state) => {
    this.state = {
      ...this.state,
      ...state,
    };
  };

  onCommand = (rawInput) => {
    const input = rawInput.toLowerCase();

    if (input === 'quit') {
      return this.quit();
    }
    if (this.state.menu) {
      return this.chooseMenuOption(input);
    }
    if (!this.state.indexName) {
      return this.chooseIndexName(input);
    }
    if (!this.state.searchTerm) {
      return this.chooseSearchTerm(input);
    }
    if (!this.state.value) {
      this.chooseValue(input);
      return this.conductSearch();
    }
  };

  chooseMenuOption = (input) => {
    const parsedInput = parseInt(input);

    if (![1, 2].includes(parsedInput)) {
      this.logger.error(INVALID_OPTION);
    }

    if (parsedInput === 1) {
      this.updateState({ menu: false });
    }

    if (parsedInput === 2) {
      this.logger.log(this.searchableFieldsMessage());
    }
  };

  chooseIndexName = (input) => {
    const position = parseInt(input) - 1;
    const indexName = this.searchRepository.getNameByPositionalIndex(position);
    if (indexName) {
      return this.updateState({ indexName });
    }
    this.logger.log(INVALID_OPTION);
  };

  chooseSearchTerm = (searchTerm) => {
    if (
      this.searchRepository
        .getIndexSearchTerms(this.state.indexName)
        .includes(searchTerm)
    ) {
      return this.updateState({ searchTerm });
    }
    this.logger.error(INVALID_TERM);
  };

  chooseValue = (value) => {
    this.updateState({ value });
  };

  conductSearch = () => {
    const results = this.search({
      indexName: this.state.indexName,
      searchTerm: this.state.searchTerm,
      value: this.state.value,
    });
    this.displayResults(results);
    this.reset();
  };

  displayResults = (results) => {
    if (!results.length) {
      this.logger.log('No results found\n');
    } else {
      results.forEach((result) => {
        Object.keys(result).forEach((key) =>
          this.logger.log(
            key,
            addTabs(key),
            Array.isArray(result[key])
              ? `[${result[key].join(', ')}]`
              : result[key]
          )
        );
      });
      this.logger.log('\n');
    }
  };

  search = ({ indexName, searchTerm, value }) => {
    this.logger.log(
      `Searching ${indexName} for ${searchTerm} with a value of ${value}\n`
    );
    return this.searchRepository.searchWithRelationships({
      indexName,
      searchTerm,
      value,
    });
  };

  getPrompt = () => {
    if (this.state.menu) {
      return this.welcomeMessage();
    }
    if (!this.state.indexName) {
      return this.searchableIndexesMessage();
    }
    if (!this.state.searchTerm) {
      return 'Enter search term\n';
    }
    if (!this.state.value) {
      return 'Enter search value\n';
    }
    return '';
  };

  welcomeMessage = () => {
    return [
      '',
      'Welcome to Zendesk Search',
      "Type 'quit' to exit at any time, Press 'Enter' to continue",
      '',
      'Select search options:',
      '* Press 1 to search Zendesk',
      '* Press 2 to view a list of searchable fields',
      "* Type 'quit' to exit",
      '',
      '',
    ].join('\n');
  };

  searchableFieldsMessage = () => {
    const indexNames = this.searchRepository.getIndexNames();
    return indexNames
      .flatMap((name) => {
        const searchTerms = this.searchRepository.getIndexSearchTerms(name);
        return [
          '----------------------------',
          `Search ${capitalize(name)} with`,
          ...searchTerms,
        ];
      })
      .join('\n');
  };

  searchableIndexesMessage = () => {
    const indexNames = this.searchRepository.getIndexNames();
    const options = indexNames
      .map((name, index) => `${index + 1}) ${capitalize(name)}`)
      .join(' or ');
    return `Select ${options}\n`;
  };
}

export default SearchApplication;
