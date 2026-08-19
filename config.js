const APP_CONFIG = {
  appName: "Campus Lost & Found",
  storageKeys: {
    users: "clf_users",
    items: "clf_items",
    claims: "clf_claims",
    notifications: "clf_notifications",
    currentUser: "clf_current_user",
  },
  schools: [
    "Strathmore University",
    "Kenyatta University",
    "University Of Nairobi",
    "Riara University",
    "Catholic university of East Africa",
    "United States International University",
    "Moi University",
    "Jomo Kenyatta University of Agriculture and Technology"
  ],
  categories: ["Electronics", "Clothing", "Documents", "Accessories", "Other"],
  statuses: ["FOUND", "CLAIMED", "RETURNED", "CLOSED"]
};

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}