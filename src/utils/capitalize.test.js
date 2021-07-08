import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('should capitalize a string', () => {
    expect(capitalize('')).toEqual('');
    expect(capitalize('WORD')).toEqual('Word');
    expect(capitalize('word')).toEqual('Word');
  });

  it('should return input if it is not a string', () => {
    expect(capitalize(null)).toEqual(null);
    expect(capitalize(undefined)).toEqual(undefined);
    expect(capitalize(true)).toEqual(true);
    expect(capitalize(false)).toEqual(false);
    expect(capitalize(1)).toEqual(1);
  });
});
