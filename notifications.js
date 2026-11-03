
const NotificationsModule = {
  createNotification(userId, message, type = "info", itemId = null) {
    const notification = {
      id: uid("notif"),
      userId,
      message,
      type,
      itemId,
      read: false,
      createdAt: new Date().toISOString()
    };
    StorageModule.addNotification(notification);
    return notification;
  },

  getUserNotifications(userId) {
    return StorageModule.getNotifications()
      .filter(n => String(n.userId) === String(userId));
  },

  // Compatibility with app.js
  forUser(userId) {
    return this.getUserNotifications(userId);
  },

  getUnreadCount(userId) {
    return this.getUserNotifications(userId)
      .filter(n => !n.read).length;
  },

  // Compatibility with app.js
  unread(userId) {
    return this.getUnreadCount(userId);
  },

  markAllRead(userId) {
    const notifications = StorageModule.getNotifications().map(n =>
      String(n.userId) === String(userId)
        ? { ...n, read: true }
        : n
    );

    StorageModule.saveNotifications(notifications);
  },

  notifyFounderOfClaim(item, claimant) {
    this.createNotification(
      item.founderId,
      `${claimant.name} submitted a claim for "${item.title}".`,
      "claim",
      item.id
    );
  },

  notifyClaimApproved(userId, itemId) {
    const item = StorageModule.getItemById(itemId);

    this.createNotification(
      userId,
      `Your claim for "${item?.title || "an item"}" was approved.`,
      "success",
      itemId
    );
  },

  notifyClaimRejected(userId, itemId) {
    const item = StorageModule.getItemById(itemId);

    this.createNotification(
      userId,
      `Your claim for "${item?.title || "an item"}" was rejected.`,
      "claim",
      itemId
    );
  },

  notifyMoreProof(userId, itemId) {
    const item = StorageModule.getItemById(itemId);

    this.createNotification(
      userId,
      `More proof was requested for "${item?.title || "an item"}".`,
      "claim",
      itemId
    );
  }
};
