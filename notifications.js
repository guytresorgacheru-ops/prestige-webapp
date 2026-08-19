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
    return StorageModule.getNotifications().filter(n => n.userId === userId);
  },

  getUnreadCount(userId) {
    return this.getUserNotifications(userId).filter(n => !n.read).length;
  },

  markAllRead(userId) {
    const notifications = StorageModule.getNotifications().map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    StorageModule.saveNotifications(notifications);
  },

  notifyFounderOfClaim(item, claimant) {
    const founderId = item.founderId;
    this.createNotification(
      founderId,
      `${claimant.name} submitted a claim for "${item.title}".`,
      "claim",
      item.id
    );
  },

  notifyClaimApproved(userId, itemId) {
    const item = StorageModule.getItemById(itemId);
    this.createNotification(
      userId,
      `Your claim for "${item.title}" was approved.`,
      "success",
      itemId
    );
  },

  notifyClaimRejected(userId, itemId) {
    const item = StorageModule.getItemById(itemId);
    this.createNotification(
      userId,
      `Your claim for "${item.title}" was rejected.`,
      itemId
    );
  },

  notifyMoreProof(userId, itemId) {
    const item = StorageModule.getItemById(itemId);
    this.createNotification(
      userId,
      `More proof was requested for "${item.title}".`,
      itemId
    );
  }
};