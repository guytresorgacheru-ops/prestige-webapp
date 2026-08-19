const ClaimsModule = {
  getClaimsForItem(itemId) {
    return StorageModule.getClaims().filter(claim => claim.itemId === itemId);
  },

  getClaimsByUser(userId) {
    return StorageModule.getClaims().filter(claim => claim.userId === userId);
  },

  hasUserClaimed(itemId, userId) {
    return this.getClaimsForItem(itemId).some(claim => claim.userId === userId);
  },

  createClaim(itemId, currentUser, data) {
    if (this.hasUserClaimed(itemId, currentUser.id)) {
      throw new Error("You have already claimed this item.");
    }

    if (!data.proof || data.proof.trim().length < 20) {
      throw new Error("Proof must be at least 20 characters.");
    }

    const claim = {
      id: uid("claim"),
      itemId,
      userId: currentUser.id,
      proof: data.proof,
      hiddenFeatures: data.hiddenFeatures || "",
      images: data.images || [],
      contact: data.contact || "",
      status: "UNDER REVIEW",
      createdAt: new Date().toISOString()
    };

    StorageModule.addClaim(claim);

    const item = StorageModule.getItemById(itemId);
    const updatedClaims = [...item.claims, claim.id];
    StorageModule.updateItem(itemId, {
      claims: updatedClaims,
      status: "CLAIMED"
    });

    NotificationsModule.notifyFounderOfClaim(item, currentUser);
    return claim;
  },

  rejectClaim(claimId) {
    const claim = StorageModule.updateClaim(claimId, { status: "REJECTED" });
    NotificationsModule.notifyClaimRejected(claim.userId, claim.itemId);
    return claim;
  },

  approveClaim(claimId) {
    const claim = StorageModule.updateClaim(claimId, { status: "APPROVED" });
    const item = StorageModule.getItemById(claim.itemId);

    StorageModule.updateItem(item.id, { status: "RETURNED" });

    const allClaims = this.getClaimsForItem(item.id);
    allClaims.forEach(c => {
      if (c.id !== claimId && c.status !== "REJECTED") {
        StorageModule.updateClaim(c.id, { status: "REJECTED" });
        NotificationsModule.notifyClaimRejected(c.userId, item.id);
      }
    });

    NotificationsModule.notifyClaimApproved(claim.userId, item.id);
    return claim;
  },

  requestMoreProof(claimId) {
    const claim = StorageModule.updateClaim(claimId, { status: "MORE PROOF REQUESTED" });
    NotificationsModule.notifyMoreProof(claim.userId, claim.itemId);
    return claim;
  },

  confidenceLevel(claim) {
    const len = (claim.proof || "").length;
    if (len > 120) return "high";
    if (len > 60) return "medium";
    return "low";
  }
};