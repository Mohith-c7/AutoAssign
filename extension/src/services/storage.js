async function get(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

async function set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

async function clear() {
  await chrome.storage.local.clear();
}

async function remove(keys) {
  await chrome.storage.local.remove(keys);
}

async function getAll() {
  return chrome.storage.local.get(null);
}

export const storage = {
  get,
  set,
  clear,
  remove,
  getAll
};
