/**
 * PermissionLens - Bundled Catalog Profiles
 * Replicates the public.profiles catalog from Supabase for offline and local use.
 */

const PROFILES_DATA = [
  {
    id: "profile_messaging",
    name: "Messaging Application",
    category: "Communication",
    description: "Standard chat, audio messaging, and social connection software.",
    permission_ids: ["contacts", "camera", "microphone", "photos_media", "notifications"],
    sample_data_notice: "Illustrative sample data for educational purposes only. Not an official or verified inventory of any specific commercial application.",
    icon: "💬"
  },
  {
    id: "profile_photo_editor",
    name: "Photo-Editing Application",
    category: "Photography & Design",
    description: "Image retouching, artistic filters, and image collage generation tool.",
    permission_ids: ["camera", "photos_media", "storage_files"],
    sample_data_notice: "Illustrative sample data for educational purposes only. Not an official or verified inventory of any specific commercial application.",
    icon: "🎨"
  },
  {
    id: "profile_navigation",
    name: "Navigation & Maps Application",
    category: "Travel & Navigation",
    description: "Turn-by-turn road guidance, real-time traffic updates, and local search.",
    permission_ids: ["location", "location_background", "notifications"],
    sample_data_notice: "Illustrative sample data for educational purposes only. Not an official or verified inventory of any specific commercial application.",
    icon: "🗺️"
  },
  {
    id: "profile_video_conferencing",
    name: "Video-Conferencing Application",
    category: "Productivity & Meetings",
    description: "Virtual team meetings, webinar hosting, and screen-sharing client.",
    permission_ids: ["camera", "microphone", "calendar", "notifications", "bluetooth"],
    sample_data_notice: "Illustrative sample data for educational purposes only. Not an official or verified inventory of any specific commercial application.",
    icon: "📹"
  },
  {
    id: "profile_shopping",
    name: "Shopping & E-Commerce Application",
    category: "Shopping & Retail",
    description: "Online marketplace, order tracking, and localized delivery updates.",
    permission_ids: ["camera", "location", "notifications"],
    sample_data_notice: "Illustrative sample data for educational purposes only. Not an official or verified inventory of any specific commercial application.",
    icon: "🛍️"
  },
  {
    id: "profile_fitness",
    name: "Fitness & Health Application",
    category: "Health & Fitness",
    description: "Activity tracking, step counting, heart rate syncing, and workout routines.",
    permission_ids: ["sensors", "location", "bluetooth", "notifications"],
    sample_data_notice: "Illustrative sample data for educational purposes only. Not an official or verified inventory of any specific commercial application.",
    icon: "🏃"
  }
];

function getAllProfiles() {
  return PROFILES_DATA;
}

function getProfileById(id) {
  if (!id) return null;
  return PROFILES_DATA.find(p => p.id === id) || null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROFILES_DATA, getAllProfiles, getProfileById };
}
if (typeof window !== 'undefined') {
  window.ProfilesDB = { data: PROFILES_DATA, getAll: getAllProfiles, getById: getProfileById };
}
