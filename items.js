const ItemsModule = {
  getSchoolItems(school) {
    return StorageModule.getItems().filter(item => item.school === school);
  },

  getUserPostedItems(userId) {
    return StorageModule.getItems().filter(item => item.founderId === userId);
  },

  searchSchoolItems(school, query = "", filters = {}) {
    let items = this.getSchoolItems(school);

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.locationFound.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }

    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }

    if (filters.date) {
      items = items.filter(item => item.dateFound === filters.date);
    }

    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createItem(formData, currentUser) {
    const item = {
      id: uid("item"),
      founderId: currentUser.id,
      title: formData.title,
      description: formData.description,
      school: currentUser.school,
      image: formData.image || "",
      dateFound: formData.dateFound,
      locationFound: formData.locationFound,
      category: formData.category,
      hiddenDetails: formData.hiddenDetails || "",
      status: "FOUND",
      claims: [],
      createdAt: new Date().toISOString()
    };

    StorageModule.addItem(item);

    StorageModule.updateUser(currentUser.id, {
      itemsPosted: (currentUser.itemsPosted || 0) + 1
    });

    return item;
  },

  updateItemStatus(itemId, status) {
    return StorageModule.updateItem(itemId, { status });
  },

  getDashboardStats(school) {
    const items = this.getSchoolItems(school);
    const claims = StorageModule.getClaims().filter(claim => {
      const item = StorageModule.getItemById(claim.itemId);
      return item && item.school === school;
    });

    return {
      totalItems: items.length,
      openClaims: claims.filter(c => c.status === "UNDER REVIEW").length,
      returnedItems: items.filter(i => i.status === "RETURNED").length,
      activeUsers: StorageModule.getUsers().filter(u => u.school === school).length
    };
  }
};