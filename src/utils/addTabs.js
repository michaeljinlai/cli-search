export const addTabs = (string) => {
  const maxTabs = 3;
  const tabsToRemove = Math.floor(string.length / 7);
  const numTabs = Math.max(1, maxTabs - tabsToRemove);
  return new Array(numTabs).fill('\t').join('');
};
