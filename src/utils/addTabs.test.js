import { addTabs } from './addTabs';

describe('addTabs', () => {
  it('should return 3 tabs if the string is less than 7 characters', () => {
    expect(addTabs('abcdef')).toEqual('\t\t\t');
  });

  it('should return 2 tabs if the string is less than 15 characters', () => {
    expect(addTabs('abcdefg')).toEqual('\t\t');
    expect(addTabs('abcdefghijklm')).toEqual('\t\t');
  });

  it('should return 1 tabs if the string is 15 or more characters', () => {
    expect(addTabs('abcdefghijklmn')).toEqual('\t');
    expect(addTabs('abcdefghijklmnopqrs')).toEqual('\t');
  });
});
