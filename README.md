# Zendesk Coding Challenge

A simple command line application to search the data provided (tickets.json and users.json), and return the results in a human readable format.

## Usage

### Requirements

- node.js version `>=16.0.0`
- yarn

### Installation

```
yarn install
```

### Running the application

After installing, run:

```
yarn start
```

### Testing

This application uses `Jest` for testing.
To run all tests:

```
yarn test
```

## Approach

### Data storage

Because the application only requires **full value matching**, and **all data can fit into memory**, a hash map of all the json data is generated on initialisation and stored in memory. This gives a consistent lookup time when performing searches and search response times should not increase linearly as the bulk of the processing is done on initialisation.

### Schema & Relationships

All data types and relationships are defined inside files in `src/schemas`. In addition to type definitions for each field, schemas also requires one `primaryKey` defined for a field. Fields that exist in the schema but are not found in the document item will be indexed in a key called `empty_value`.

The relationships file define which field is a `foreignKey` to which entity, allowing joins when performing searches.

## Architecture

### Classes

- **SearchApplication**: Responsible for keeping state, prompts and processing commands.
- **SearchRepository**: Contains the business logic for performing searches against an index.
- **Index**: A generic index with methods to add and update index items.
- **IndexGenerator**: Contains the logic for hydrating an `Index` for search from json data.

### CLI

I used `readline` to stream inputs to `SearchApplication` and display prompts to the user.
