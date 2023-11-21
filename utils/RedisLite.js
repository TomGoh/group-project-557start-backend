const redisLite = {
  dataStore: new Map(),

  set(key, value) {
    this.dataStore.set(key, value);
  },

  get(key) {
    return this.dataStore.get(key);
  },

  delete(key) {
    this.dataStore.delete(key);
  },

  exists(key) {
    return this.dataStore.has(key);
  },

  clear() {
    this.dataStore.clear();
  },

  flushAll() {
    this.dataStore.clear();
  },

  keys() {
    return this.dataStore.keys();
  },

  expire(key, seconds) {
    setTimeout(() => {
      this.delete(key);
    }, seconds * 1000);
  },
};

module.exports = { redisLite };
