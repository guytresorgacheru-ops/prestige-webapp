
const currentUser = AuthModule.requireAuth();

if (!currentUser) {
  throw new Error("Authentication required.");
}

const $ = selector => document.querySelector(selector);

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

const itemBy = id => StorageModule.getItemById(id);
const userBy = id => StorageModule.getUserById(id);

let selectedBrowseCategory = null;

const categoryIcons = {
  Electronics: "💻",
  Clothing: "👕",
  Documents: "📄",
  Accessories: "🎒",
  Other: "📦"
};

const statusBadge = status =>
  `<span class="badge ${
    status === "APPROVED" ? "success" :
    status === "REJECTED" ? "danger" :
    status === "MORE PROOF REQUESTED" ? "warn" :
    status === "CLAIMED" ? "warn" : ""
  }">${esc(status)}</span>`;

const schoolElement = $("#sidebarSchoolName");
const userElement = $("#topUserName");
const avatarElement = $("#topAvatar");

if (schoolElement) schoolElement.textContent = currentUser.school;
if (userElement) userElement.textContent = currentUser.name;
if (avatarElement) {
  avatarElement.textContent = currentUser.name.charAt(0).toUpperCase();
}

function render() {
  renderDashboard();
  renderBrowse();
  renderReport();
  renderClaims();
  renderPosted();
  renderNotifications();
  renderProfile();
  updateNotificationCount();
}

function renderDashboard() {
  const items = ItemsModule.getSchoolItems(currentUser.school);

  const claims = StorageModule.getClaims().filter(claim =>
    itemBy(claim.itemId)?.school === currentUser.school
  );

  $("#view-dashboard").innerHTML = `
    <div class="page-title">
      <div>
        <h2>Welcome, ${esc(currentUser.name.split(" ")[0])}</h2>
        <p class="muted">Your ${esc(currentUser.school)} recovery portal.</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <strong>${items.length}</strong>
        <span class="muted">Found Items</span>
      </div>
      <div class="stat">
        <strong>${claims.filter(c => c.status === "UNDER REVIEW").length}</strong>
        <span class="muted">Claims Awaiting Review</span>
      </div>
      <div class="stat">
        <strong>${items.filter(i => i.status === "RETURNED").length}</strong>
        <span class="muted">Returned Items</span>
      </div>
      <div class="stat">
        <strong>${StorageModule.getUsers().filter(u => u.school === currentUser.school).length}</strong>
        <span class="muted">Students</span>
      </div>
    </div>

    <div class="card" style="padding:22px">
      <h3>Quick actions</h3>
      <div class="actions">
        <button class="btn btn-primary" onclick="showView('browse')">Browse Items</button>
        <button class="btn btn-secondary" onclick="showView('report')">Report Found Item</button>
        <button class="btn btn-outline" onclick="showView('claims')">My Claims</button>
      </div>
    </div>
  `;
}

function renderBrowse() {
  const container = $("#view-browse");
  if (!container) return;

  const search = ($("#globalSearch")?.value || "").trim();
  const allItems = ItemsModule.getSchoolItems(currentUser.school);

  if (!selectedBrowseCategory && !search) {
    container.innerHTML = `
      <div class="page-title">
        <div>
          <p class="eyebrow">CAMPUS MARKETPLACE</p>
          <h2>Browse Found Items</h2>
          <p class="muted">Choose a category to explore items reported at your school.</p>
        </div>
      </div>

      <div class="browse-intro">
        <div>
          <h3>What are you looking for?</h3>
          <p class="muted">Select a category below to get started.</p>
        </div>
        <span class="browse-total">${allItems.length} item${allItems.length === 1 ? "" : "s"} listed</span>
      </div>

      <div class="category-grid">
        ${APP_CONFIG.categories.map(category => {
          const count = allItems.filter(item => item.category === category).length;

          return `
            <button
              type="button"
              class="category-card"
              onclick="selectBrowseCategory('${esc(category)}')"
            >
              <span class="category-icon">${categoryIcons[category] || "📦"}</span>
              <span class="category-name">${esc(category)}</span>
              <span class="category-count">${count} item${count === 1 ? "" : "s"}</span>
              <span class="category-arrow" aria-hidden="true">→</span>
            </button>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const searchingAllCategories = !selectedBrowseCategory && Boolean(search);

  const items = ItemsModule.searchSchoolItems(
    currentUser.school,
    search,
    selectedBrowseCategory ? { category: selectedBrowseCategory } : {}
  );

  container.innerHTML = `
    <div class="page-title browse-results-heading">
      <div>
        <button
          type="button"
          class="back-link"
          onclick="backToCategories()"
        >
          ← Back to Categories
        </button>

        <p class="eyebrow">BROWSE ITEMS</p>

        <h2>
          ${searchingAllCategories ? "Search Results" : esc(selectedBrowseCategory)}
        </h2>

        <p class="muted">
          ${
            searchingAllCategories
              ? "Matching items from all categories."
              : "Items reported in this category at your school."
          }
        </p>
      </div>

      <span class="browse-total">
        ${items.length} result${items.length === 1 ? "" : "s"}
      </span>
    </div>

    <div class="grid item-grid">
      ${
        items.length
          ? items.map(itemCard).join("")
          : `
            <div class="empty">
              <div class="empty-icon">🔎</div>
              <h3>No items found</h3>
              <p class="muted">Try another search or return to the categories.</p>
              <button class="btn btn-outline" onclick="backToCategories()">
                View Categories
              </button>
            </div>
          `
      }
    </div>
  `;
}

function selectBrowseCategory(category) {
  selectedBrowseCategory = category;

  if ($("#globalSearch")) {
    $("#globalSearch").value = "";
  }

  renderBrowse();
}

function backToCategories() {
  selectedBrowseCategory = null;

  if ($("#globalSearch")) {
    $("#globalSearch").value = "";
  }

  renderBrowse();
}

function itemCard(item) {
  const own = String(item.founderId) === String(currentUser.id);

  return `
    <article class="card item-card">

      ${
        item.image
          ? `
            <img
              src="${esc(item.image)}"
              alt="${esc(item.title)}"
              style="width:100%;height:180px;object-fit:cover;border-radius:12px;"
            >
          `
          : ""
      }

      <span class="badge">${esc(item.category)}</span>

      <h3>${esc(item.title)}</h3>

      <div class="item-meta">
        <span>📍 ${esc(item.locationFound)}</span>
        <span>📅 ${esc(item.dateFound)}</span>
        <span>${statusBadge(item.status)}</span>
        <p>${esc(item.description)}</p>
      </div>

      <div class="actions">
        ${
          own
            ? `
              <button class="btn btn-outline" onclick="showView('posted')">
                Manage Item
              </button>
            `
            : item.status === "FOUND"
              ? `
                <button
                  class="btn btn-primary"
                  onclick="openClaim('${esc(item.id)}')"
                >
                  Claim Item
                </button>
              `
              : `
                <button class="btn btn-outline" disabled>
                  Not Available
                </button>
              `
        }
      </div>
    </article>
  `;
}

function renderReport() {
  $("#view-report").innerHTML = `
    <div class="page-title">
      <div>
        <h2>Report Found Item</h2>
        <p class="muted">Provide enough detail for the owner to identify it.</p>
      </div>
    </div>

    <div class="card" style="padding:22px">
      <form id="reportForm" class="form">

        <div class="field">
          <label>Item Title</label>
          <input id="rt" required placeholder="e.g. Black HP Laptop">
        </div>

        <div class="field">
          <label>Category</label>
          <select id="rc" required>
            <option value="">Select category</option>
            ${APP_CONFIG.categories.map(c =>
              `<option value="${esc(c)}">${esc(c)}</option>`
            ).join("")}
          </select>
        </div>

        <div class="field">
          <label>Description</label>
          <textarea id="rd" required></textarea>
        </div>

        <div class="field">
          <label>Location Found</label>
          <input id="rl" required>
        </div>

        <div class="field">
          <label>Date Found</label>
          <input
            id="rdate"
            type="date"
            required
            value="${new Date().toISOString().slice(0, 10)}"
          >
        </div>

        <div class="field">
          <label>Private Verification Detail</label>
          <textarea id="rh"></textarea>
        </div>

        <button class="btn btn-primary" type="submit">
          Publish Found Item
        </button>
      </form>
    </div>
  `;

  $("#reportForm").onsubmit = event => {
    event.preventDefault();

    try {
      ItemsModule.createItem({
        title: $("#rt").value,
        category: $("#rc").value,
        description: $("#rd").value,
        locationFound: $("#rl").value,
        dateFound: $("#rdate").value,
        hiddenDetails: $("#rh").value
      }, StorageModule.getCurrentUser());

      alert("Found item reported successfully.");

      render();
      showView("posted");

    } catch (error) {
      alert(error.message);
    }
  };
}

function renderClaims() {
  const claims = ClaimsModule.forUser(currentUser.id);

  $("#view-claims").innerHTML = `
    <div class="page-title">
      <div>
        <h2>My Claims</h2>
        <p class="muted">Track items you have claimed.</p>
      </div>
    </div>

    ${
      claims.length
        ? claims.map(claim => {
            const item = itemBy(claim.itemId);

            return `
              <div class="card item-card" style="margin-bottom:14px">

                <span>${statusBadge(claim.status)}</span>

                <h3>${esc(item?.title || "Item unavailable")}</h3>

                <p class="muted">
                  Submitted: ${new Date(claim.createdAt).toLocaleDateString()}
                </p>

                <strong>Your ownership explanation</strong>
                <p>${esc(claim.proof)}</p>

                ${
                  claim.hiddenFeatures
                    ? `<p><strong>Additional details:</strong> ${esc(claim.hiddenFeatures)}</p>`
                    : ""
                }

                ${
                  claim.status === "MORE PROOF REQUESTED"
                    ? `
                      <p class="muted">
                        The finder has requested additional ownership evidence.
                      </p>

                      <button
                        class="btn btn-primary"
                        onclick="openAdditionalProof('${esc(claim.id)}')"
                      >
                        Submit Additional Proof
                      </button>
                    `
                    : ""
                }

                ${
                  claim.status === "APPROVED"
                    ? `<p class="muted">Your claim has been approved. Contact the finder to arrange collection.</p>`
                    : ""
                }

                ${
                  claim.status === "REJECTED"
                    ? `<p class="muted">Your claim was not approved.</p>`
                    : ""
                }

              </div>
            `;
          }).join("")
        : `
          <div class="empty">
            You haven't submitted any claims yet. Browse found items to make one.
          </div>
        `
    }
  `;
}


function renderPosted() {
  const items = ItemsModule.getUserPostedItems(currentUser.id);

  $("#view-posted").innerHTML = `
    <div class="page-title">
      <div>
        <h2>My Posted Items</h2>
        <p class="muted">
          Manage items you have reported and review incoming claims.
        </p>
      </div>
    </div>

    ${
      items.length
        ? items.map(item => `
          <div class="card item-card" style="margin-bottom:14px">

            <h3>${esc(item.title)}</h3>
            <p>${esc(item.description)}</p>
            ${statusBadge(item.status)}

            <div class="actions" style="margin-top:14px">
              <button
                class="btn btn-danger"
                onclick="deletePostedItem('${esc(item.id)}')"
              >
                Delete Item
              </button>
            </div>

            <h4 style="margin-top:18px">Incoming Claims</h4>

            ${
              ClaimsModule.forItem(item.id).length
                ? ClaimsModule.forItem(item.id).map(claim => {
                    const claimant = userBy(claim.userId);

                    return `
                      <div
                        class="claim"
                        style="padding:15px;margin-top:12px;border:1px solid var(--border-color);border-radius:12px"
                      >

                        <strong>${esc(claimant?.name || "Student")}</strong>

                        <p class="muted">
                          Submitted:
                          ${new Date(claim.createdAt).toLocaleDateString()}
                        </p>

                        <p><strong>Ownership explanation:</strong></p>
                        <p>${esc(claim.proof)}</p>

                        ${
                          claim.hiddenFeatures
                            ? `<p><strong>Additional details:</strong> ${esc(claim.hiddenFeatures)}</p>`
                            : ""
                        }

                        <p>${statusBadge(claim.status)}</p>

                        ${
                          ["UNDER REVIEW", "MORE PROOF REQUESTED"].includes(claim.status)
                            ? `
                              <div class="actions">

                                <button
                                  class="btn btn-success"
                                  onclick="reviewClaim('${esc(claim.id)}','approve')"
                                >
                                  Approve
                                </button>

                                <button
                                  class="btn btn-secondary"
                                  onclick="reviewClaim('${esc(claim.id)}','more')"
                                >
                                  Request More Proof
                                </button>

                                <button
                                  class="btn btn-danger"
                                  onclick="reviewClaim('${esc(claim.id)}','reject')"
                                >
                                  Reject
                                </button>

                              </div>
                            `
                            : ""
                        }

                      </div>
                    `;
                  }).join("")
                : `<p class="muted">No claims have been submitted for this item.</p>`
            }

          </div>
        `).join("")
        : `<div class="empty">You haven't reported any found items.</div>`
    }
  `;
}

function deletePostedItem(itemId) {
  const item = StorageModule.getItemById(itemId);

  if (!item) {
    alert("This item could not be found.");
    return;
  }

  if (String(item.founderId) !== String(currentUser.id)) {
    alert("You are not allowed to delete this item.");
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to permanently delete "${item.title}"?\n\nAssociated claims will also be deleted. This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    ItemsModule.deleteItem(itemId, currentUser);

    alert("Item deleted successfully.");

    render();
    showView("posted");

  } catch (error) {
    alert(error.message);
  }
}

function openClaim(itemId) {
  $("#modalRoot").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">

        <div class="modal-head">
          <h2>Claim Item</h2>
          <button class="close" onclick="closeModal()">✕</button>
        </div>

        <p class="muted">
          Provide information that proves ownership.
          Do not include passwords or other sensitive information.
        </p>

        <form id="claimForm" class="form">

          <div class="field">
            <label>Ownership Proof</label>
            <textarea
              id="cp"
              required
              minlength="20"
              placeholder="Describe unique details, contents, markings or identifying information."
            ></textarea>
          </div>

          <div class="field">
            <label>Additional Private Features</label>
            <textarea
              id="ch"
              placeholder="Details only the true owner would know."
            ></textarea>
          </div>

          <div class="field">
            <label>Contact Information (optional)</label>
            <input id="cc" placeholder="Your preferred contact information">
          </div>

          <button class="btn btn-primary" type="submit">
            Submit Claim
          </button>

        </form>
      </div>
    </div>
  `;

  $("#claimForm").onsubmit = event => {
    event.preventDefault();

    try {
      ClaimsModule.create(itemId, StorageModule.getCurrentUser(), {
        proof: $("#cp").value,
        hiddenFeatures: $("#ch").value,
        contact: $("#cc").value
      });

      alert("Your claim has been submitted for review.");

      closeModal();
      render();
      showView("claims");

    } catch (error) {
      alert(error.message);
    }
  };
}

function openAdditionalProof(claimId) {
  $("#modalRoot").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">

        <div class="modal-head">
          <h2>Submit Additional Proof</h2>
          <button class="close" onclick="closeModal()">✕</button>
        </div>

        <p class="muted">
          Provide the additional information requested by the finder.
        </p>

        <form id="additionalProofForm" class="form">

          <div class="field">
            <label>Additional Ownership Proof</label>
            <textarea id="additionalProof" required minlength="20"></textarea>
          </div>

          <button class="btn btn-primary" type="submit">
            Submit Additional Proof
          </button>

        </form>
      </div>
    </div>
  `;

  $("#additionalProofForm").onsubmit = event => {
    event.preventDefault();

    try {
      ClaimsModule.submitAdditionalProof(
        claimId,
        StorageModule.getCurrentUser(),
        { proof: $("#additionalProof").value }
      );

      alert("Additional proof submitted successfully.");

      closeModal();
      render();
      showView("claims");

    } catch (error) {
      alert(error.message);
    }
  };
}

function reviewClaim(id, action) {
  try {
    if (action === "approve") {
      ClaimsModule.approve(id, currentUser);
      alert("Claim approved successfully.");

    } else if (action === "reject") {
      ClaimsModule.reject(id, currentUser);
      alert("Claim rejected.");

    } else if (action === "more") {
      ClaimsModule.moreProof(id, currentUser);
      alert("Additional proof has been requested.");
    }

    render();
    showView("posted");

  } catch (error) {
    alert(error.message);
  }
}

function renderNotifications() {
  const notifications = NotificationsModule.forUser(currentUser.id);

  $("#view-notifications").innerHTML = `
    <div class="page-title">
      <div>
        <h2>Notifications</h2>
        <p class="muted">${NotificationsModule.unread(currentUser.id)} unread</p>
      </div>

      <button class="btn btn-outline" onclick="markRead()">
        Mark All Read
      </button>
    </div>

    ${
      notifications.length
        ? notifications.map(notification => `
          <div class="notification ${notification.read ? "" : "unread"}">
            <strong>${esc(notification.type)}</strong>
            <p>${esc(notification.message)}</p>
            <small class="muted">
              ${new Date(notification.createdAt).toLocaleString()}
            </small>
          </div>
        `).join("")
        : `<div class="empty">No notifications yet.</div>`
    }
  `;

  updateNotificationCount();
}

function updateNotificationCount() {
  const count = NotificationsModule.unread(currentUser.id);
  const element = $("#notificationCount");

  if (element) element.textContent = count;
}

function markRead() {
  NotificationsModule.markAllRead(currentUser.id);
  render();
  showView("notifications");
}

function renderProfile() {
  const user = StorageModule.getUserById(currentUser.id) || currentUser;

  $("#view-profile").innerHTML = `
    <div class="page-title">
      <div>
        <h2>Profile</h2>
        <p class="muted">Your campus account information.</p>
      </div>
    </div>

    <div class="card" style="padding:22px">
      <div class="grid">
        <div><strong>Name</strong><p>${esc(user.name)}</p></div>
        <div><strong>Student ID</strong><p>${esc(user.studentId)}</p></div>
        <div><strong>Email</strong><p>${esc(user.email)}</p></div>
        <div><strong>School</strong><p>${esc(user.school)}</p></div>
        <div><strong>Items Posted</strong><p>${user.itemsPosted || 0}</p></div>
        <div><strong>Items Returned</strong><p>${user.itemsReturned || 0}</p></div>
      </div>
    </div>
  `;
}

function closeModal() {
  $("#modalRoot").innerHTML = "";
}

function showView(name) {
  const activeView = document.querySelector(".view.active");
  const currentViewName = activeView?.id?.replace("view-", "");

  if (name === "browse" && currentViewName !== "browse") {
    selectedBrowseCategory = null;

    if ($("#globalSearch")) {
      $("#globalSearch").value = "";
    }

    renderBrowse();
  }

  document.querySelectorAll(".view").forEach(view =>
    view.classList.remove("active")
  );

  const selected = $("#view-" + name);

  if (selected) {
    selected.classList.add("active");
  }

  document.querySelectorAll(".side-link").forEach(button =>
    button.classList.toggle("active", button.dataset.view === name)
  );

  if (name === "claims") renderClaims();
  if (name === "posted") renderPosted();
  if (name === "notifications") renderNotifications();
}

document.querySelectorAll(".side-link[data-view]").forEach(button => {
  button.onclick = () => showView(button.dataset.view);
});

$("#logoutBtn").onclick = () => AuthModule.logout();

$("#globalSearch").oninput = renderBrowse;

$("#notificationBell").onclick = () => {
  showView("notifications");
};

const darkModeButton = $("#darkModeToggle");
const savedDarkMode = localStorage.getItem("clf_dark_mode") === "true";

document.body.classList.toggle("dark", savedDarkMode);

if (darkModeButton) {
  darkModeButton.textContent = savedDarkMode ? "Light Mode" : "Dark Mode";

  darkModeButton.onclick = () => {
    const enabled = document.body.classList.toggle("dark");

    localStorage.setItem("clf_dark_mode", String(enabled));

    darkModeButton.textContent = enabled ? "Light Mode" : "Dark Mode";
  };
}

render();
