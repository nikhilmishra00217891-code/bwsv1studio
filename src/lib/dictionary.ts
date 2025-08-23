
let dictionary: Set<string>;

export const loadDictionary = async (): Promise<Set<string>> => {
  if (dictionary) {
    return dictionary;
  }

  try {
    const response = await fetch('/words.txt');
    if (!response.ok) {
        throw new Error('Failed to fetch dictionary');
    }
    const text = await response.text();
    const words = text.split('\n').map(word => word.trim().toLowerCase());
    dictionary = new Set(words);
    return dictionary;
  } catch (error) {
    console.error('Could not load dictionary:', error);
    // Return an empty set on error to prevent crashes
    return new Set();
  }
};

export const isWordValid = (word: string): boolean => {
  if (!dictionary) {
    console.warn("Dictionary not loaded yet. Call loadDictionary() first.");
    return false;
  }
  return dictionary.has(word.toLowerCase());
};
