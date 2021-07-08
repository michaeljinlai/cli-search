import { makeFileReader } from './fileReader';

const readSourceMock = jest.fn();
const validateSourceMock = jest.fn();
const logMock = jest.fn();
const errorMock = jest.fn();

const logger = {
  log: logMock,
  error: errorMock,
};

const fileReader = makeFileReader({
  readSource: readSourceMock,
  validateSource: validateSourceMock,
  logger,
});

describe('fileReader', () => {
  it('should return null when path is not valid', () => {
    validateSourceMock.mockReturnValue(false);

    const path = 'some/path';

    expect(fileReader(path)).toEqual(null);
    expect(errorMock).toHaveBeenCalledWith('Source from some/path is invalid.');
  });

  it('should return readSource when path is valid', () => {
    validateSourceMock.mockReturnValue(true);
    readSourceMock.mockReturnValue([{ a: 1 }]);

    const path = 'some/path';

    expect(fileReader(path)).toEqual([{ a: 1 }]);
  });
});
