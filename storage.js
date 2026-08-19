const StorageModule = {
  get(key, fallback = []) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getUsers() {
    return this.get(APP_CONFIG.storageKeys.users, []);
  },

  saveUsers(users) {
    this.set(APP_CONFIG.storageKeys.users, users);
  },

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    return user;
  },

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  },

  updateUser(id, updates) {
    const users = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    this.saveUsers(users);
    return users.find(u => u.id === id);
  },

  getItems() {
    return this.get(APP_CONFIG.storageKeys.items, []);
  },

  saveItems(items) {
    this.set(APP_CONFIG.storageKeys.items, items);
  },

  addItem(item) {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
    return item;
  },

  getItemById(id) {
    return this.getItems().find(i => i.id === id);
  },

  updateItem(id, updates) {
    const items = this.getItems().map(i => i.id === id ? { ...i, ...updates } : i);
    this.saveItems(items);
    return items.find(i => i.id === id);
  },

  getClaims() {
    return this.get(APP_CONFIG.storageKeys.claims, []);
  },

  saveClaims(claims) {
    this.set(APP_CONFIG.storageKeys.claims, claims);
  },

  addClaim(claim) {
    const claims = this.getClaims();
    claims.push(claim);
    this.saveClaims(claims);
    return claim;
  },

  updateClaim(id, updates) {
    const claims = this.getClaims().map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveClaims(claims);
    return claims.find(c => c.id === id);
  },

  getNotifications() {
    return this.get(APP_CONFIG.storageKeys.notifications, []);
  },

  saveNotifications(notifications) {
    this.set(APP_CONFIG.storageKeys.notifications, notifications);
  },

  addNotification(notification) {
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    this.saveNotifications(notifications);
    return notification;
  },

  getCurrentUser() {
    return this.get(APP_CONFIG.storageKeys.currentUser, null);
  },

  setCurrentUser(user) {
    this.set(APP_CONFIG.storageKeys.currentUser, user);
  },

  clearCurrentUser() {
    localStorage.removeItem(APP_CONFIG.storageKeys.currentUser);
  }
};