
const ClaimsModule = {
  getClaimsForItem(itemId) {
    return StorageModule.getClaims().filter(
      c => String(c.itemId) === String(itemId)
    );
  },

  getClaimsByUser(userId) {
    return StorageModule.getClaims().filter(
      c => String(c.userId) === String(userId)
    );
  },

  getClaimById(claimId) {
    return StorageModule.getClaims().find(
      c => String(c.id) === String(claimId)
    ) || null;
  },

  // Compatibility with the existing app.js
  forItem(itemId) {
    return this.getClaimsForItem(itemId);
  },

  forUser(userId) {
    return this.getClaimsByUser(userId);
  },

  hasUserClaimed(itemId, userId) {
    return this.getClaimsForItem(itemId).some(
      c =>
        String(c.userId) === String(userId) &&
        c.status !== "REJECTED"
    );
  },

  createClaim(itemId, currentUser, data = {}) {
    if (!currentUser || !currentUser.id) {
      throw new Error("Please log in before submitting a claim.");
    }

    const item = StorageModule.getItemById(itemId);

    if (!item) {
      throw new Error("Item not found.");
    }

    if (String(item.founderId) === String(currentUser.id)) {
      throw new Error("You cannot claim an item you posted.");
    }

    if (!["FOUND", "CLAIMED"].includes(item.status)) {
      throw new Error("This item is no longer available for claiming.");
    }

    if (this.hasUserClaimed(itemId, currentUser.id)) {
      throw new Error("You already have an active claim for this item.");
    }

    const proof = (data.proof || "").trim();

    if (proof.length < 20) {
      throw new Error("Ownership proof must be at least 20 characters.");
    }

    const claim = {
      id: uid("claim"),
      itemId: item.id,
      userId: currentUser.id,
      proof,
      hiddenFeatures: (data.hiddenFeatures || "").trim(),
      images: Array.isArray(data.images) ? data.images : [],
      contact: (data.contact || "").trim(),
      status: "UNDER REVIEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageModule.addClaim(claim);

    const existingClaims = Array.isArray(item.claims)
      ? item.claims
      : [];

    StorageModule.updateItem(item.id, {
      claims: [...new Set([...existingClaims, claim.id])]
    });

    NotificationsModule.notifyFounderOfClaim(item, currentUser);

    return claim;
  },

  // Compatibility with the existing app.js
  create(itemId, currentUser, data) {
    return this.createClaim(itemId, currentUser, data);
  },

  verifyFounder(claim, currentUser) {
    if (!currentUser || !currentUser.id) {
      throw new Error("Please log in to continue.");
    }

    const item = StorageModule.getItemById(claim.itemId);

    if (!item) {
      throw new Error("Item not found.");
    }

    if (String(item.founderId) !== String(currentUser.id)) {
      throw new Error("Only the person who posted this item can manage its claims.");
    }

    return item;
  },

  rejectClaim(claimId, currentUser) {
    const claim = this.getClaimById(claimId);

    if (!claim) throw new Error("Claim not found.");

    this.verifyFounder(claim, currentUser);

    if (["APPROVED", "REJECTED"].includes(claim.status)) {
      throw new Error("This claim has already been decided.");
    }

    const updated = StorageModule.updateClaim(claimId, {
      status: "REJECTED",
      updatedAt: new Date().toISOString()
    });

    NotificationsModule.notifyClaimRejected(
      claim.userId,
      claim.itemId
    );

    return updated;
  },

  reject(claimId, currentUser) {
    return this.rejectClaim(claimId, currentUser);
  },

  approveClaim(claimId, currentUser) {
    const claim = this.getClaimById(claimId);

    if (!claim) throw new Error("Claim not found.");

    const item = this.verifyFounder(claim, currentUser);

    if (["APPROVED", "REJECTED"].includes(claim.status)) {
      throw new Error("This claim has already been decided.");
    }

    if (!["FOUND", "CLAIMED"].includes(item.status)) {
      throw new Error("This item is no longer available.");
    }

    const updated = StorageModule.updateClaim(claimId, {
      status: "APPROVED",
      updatedAt: new Date().toISOString()
    });

    // Other active claims are automatically rejected.
    this.getClaimsForItem(item.id).forEach(other => {
      if (
        String(other.id) !== String(claimId) &&
        !["APPROVED", "REJECTED"].includes(other.status)
      ) {
        StorageModule.updateClaim(other.id, {
          status: "REJECTED",
          updatedAt: new Date().toISOString()
        });

        NotificationsModule.notifyClaimRejected(
          other.userId,
          item.id
        );
      }
    });

    // The item is marked CLAIMED, not RETURNED.
    // Actual collection can be handled separately.
    StorageModule.updateItem(item.id, {
      status: "CLAIMED"
    });

    NotificationsModule.notifyClaimApproved(
      claim.userId,
      item.id
    );

    return updated;
  },

  approve(claimId, currentUser) {
    return this.approveClaim(claimId, currentUser);
  },

  requestMoreProof(claimId, currentUser) {
    const claim = this.getClaimById(claimId);

    if (!claim) throw new Error("Claim not found.");

    this.verifyFounder(claim, currentUser);

    if (["APPROVED", "REJECTED"].includes(claim.status)) {
      throw new Error("This claim has already been decided.");
    }

    const updated = StorageModule.updateClaim(claimId, {
      status: "MORE PROOF REQUESTED",
      updatedAt: new Date().toISOString()
    });

    NotificationsModule.notifyMoreProof(
      claim.userId,
      claim.itemId
    );

    return updated;
  },

  moreProof(claimId, currentUser) {
    return this.requestMoreProof(claimId, currentUser);
  },

  submitAdditionalProof(claimId, currentUser, data = {}) {
    const claim = this.getClaimById(claimId);

    if (!claim) throw new Error("Claim not found.");

    if (String(claim.userId) !== String(currentUser.id)) {
      throw new Error("You cannot update another student's claim.");
    }

    if (claim.status !== "MORE PROOF REQUESTED") {
      throw new Error("Additional proof has not been requested.");
    }

    const proof = (data.proof || "").trim();

    if (proof.length < 20) {
      throw new Error("Additional proof must be at least 20 characters.");
    }

    return StorageModule.updateClaim(claimId, {
      proof: `${claim.proof}\n\nAdditional proof:\n${proof}`,
      images: [
        ...(Array.isArray(claim.images) ? claim.images : []),
        ...(Array.isArray(data.images) ? data.images : [])
      ],
      status: "UNDER REVIEW",
      updatedAt: new Date().toISOString()
    });
  },

  confidenceLevel(claim) {
    const length = (claim.proof || "").trim().length;

    if (length > 120) return "high";
    if (length > 60) return "medium";

    return "low";
  }
};
