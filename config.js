window.CHB_COMMUNITY = {
  // REQUIRED: CSV feed from your Google Sheet (published as CSV)
  FEED_CSV_URL: "https://docs.google.com/spreadsheets/d/1kOQgSQqKZTaC-hWGWnsUn8vwpLy3FBc7dEf407OIUig/edit?usp=sharing",

  // REQUIRED: Your Google Form link for posting to the community
  POST_FORM_URL: "https://docs.google.com/spreadsheets/d/1artXHqFrVUOH6e0IbnhJ9xF-DOR1SmI6y5YzgppdNUk/edit?usp=sharing",

  // OPTIONAL LINKS (tabs)
  SHOP_URL: "PASTE_YOUR_SHOP_URL_HERE",
  EVENTS_URL: "PASTE_YOUR_EVENTS_URL_HERE",
  FILES_URL: "PASTE_YOUR_FILES_URL_HERE",

  // Affiliate Menu links (optional)
  MENU_URLS: {
    start: "PASTE_START_HERE_URL_HERE",
    training: "PASTE_TRAINING_URL_HERE",
    vault: "PASTE_CONTENT_VAULT_URL_HERE",
    mediaAssets: "PASTE_MEDIA_ASSETS_URL_HERE",
    links: "PASTE_IMPORTANT_LINKS_URL_HERE"
  },

  // Form column names (must match the CSV headers coming from Google Forms/Sheets)
  FIELDS: {
    timestamp: "Timestamp",
    name: "Display Name",
    channel: "Channel",
    post: "Post",
    photo: "Photo Link",
    status: "status",
    pinned: "pinned"
  },

  CHANNELS: [
    "Announcements",
    "New Drops",
    "Pup Pics",
    "Questions",
    "Reviews / Wins"
  ]
};
