/**
 * PermissionLens - Bundled Offline Permissions Database
 * Replicates the public.permissions catalog from Supabase for instant local availability.
 */

const PERMISSIONS_DATA = [
  {
    id: "camera",
    name: "Camera Access",
    category: "Camera",
    short_description: "Allows the app or website to use the device camera to take photos and record video.",
    plain_english: "Camera permission may allow an application or site to capture images or video under applicable browser and operating-system restrictions. On modern devices, visual indicators (such as green dots or camera lights) signal when the camera hardware is actively engaged.",
    legitimate_use_cases: [
      "Taking photos or videos directly within the application",
      "Scanning QR codes, barcodes, or payment slips",
      "Live video calling and conferencing",
      "Augmented reality (AR) previews or filters"
    ],
    accessible_data: [
      "Real-time visual feed from front and rear cameras",
      "Captured photos and video recordings",
      "Embedded metadata such as timestamps and hardware details"
    ],
    privacy_questions: [
      "Does this application fundamentally require photos or video to fulfill its primary purpose?",
      "Could the application function by letting me select photos from my gallery instead of accessing the camera directly?",
      "Does the app need continuous camera access or only when I take a specific photo?"
    ],
    considerations: [
      "Visual data may capture your personal surroundings, family members, location clues, or sensitive documents.",
      "Camera access without clear user initiation could present significant privacy exposure if misused."
    ],
    suggested_controls: [
      "Select 'Only while using the app' or 'Ask every time' instead of permanent access.",
      "Look for the operating system / browser camera privacy indicator (green dot or icon) during active use.",
      "Revoke permission when you are no longer actively taking photos or videos."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "Direct visual sensor access that can record the user and their immediate physical environment in real time.",
    risk_score: 3,
    chrome_permission_name: "camera"
  },
  {
    id: "microphone",
    name: "Microphone Access",
    category: "Microphone",
    short_description: "Allows the app or website to record sound and capture audio from device microphones.",
    plain_english: "Microphone permission allows an application or site to capture audio when permitted by the operating system and browser. This enables voice recording, audio messaging, and calling capabilities.",
    legitimate_use_cases: [
      "Voice and video calls",
      "Recording voice notes and voice messages",
      "Speech-to-text transcription and voice search",
      "Audio tuning or sound analysis in music utilities"
    ],
    accessible_data: [
      "Real-time ambient sound and spoken conversations within acoustic range",
      "Audio recordings and voice samples",
      "Acoustic environment patterns (e.g., background noise, speech cadence)"
    ],
    privacy_questions: [
      "Does this application have an audio feature that I personally use?",
      "Is audio recording initiated strictly by an explicit button press?",
      "Could private conversations around my desk or room be recorded if the app is open?"
    ],
    considerations: [
      "Microphones can pick up sensitive conversations, phone calls, background whispers, and ambient audio cues without visual warnings.",
      "Continuous audio listening consumes battery and poses serious confidentiality risks if unmonitored."
    ],
    suggested_controls: [
      "Grant permission strictly as 'While using the app' or 'Ask every time'.",
      "Check that your browser/OS displays an audio recording dot/indicator when active.",
      "Mute microphone permissions for apps whose voice features you never use."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "Acoustic sensor access capable of capturing private human speech and environmental sounds.",
    risk_score: 3,
    chrome_permission_name: "microphone"
  },
  {
    id: "location",
    name: "Location Access",
    category: "Location",
    short_description: "Allows the app or website to determine the geographic position of the device.",
    plain_english: "Location access allows an application to obtain approximate or precise geographical coordinates. Precise location uses GPS and Wi-Fi networks to pinpoint position down to several meters, whereas approximate location only provides a general neighborhood or city radius.",
    legitimate_use_cases: [
      "Turn-by-turn road navigation and route guidance",
      "Locating nearby local stores, restaurants, or services",
      "Localized weather forecasts and emergency weather alerts",
      "Tracking outdoor running or cycling workout routes"
    ],
    accessible_data: [
      "Precise or approximate geographical coordinates (latitude and longitude)",
      "Speed, heading, altitude, and timestamps",
      "Movement history over time when logged by the application"
    ],
    privacy_questions: [
      "Does this app need my exact street address, or would a general city/zip code suffice?",
      "Why does a utility, calculator, or basic game request my location?",
      "Is location tracked when the app is minimized in the background?"
    ],
    considerations: [
      "Location records can reveal home addresses, workplaces, medical facilities, places of worship, and daily routines.",
      "Continuous tracking provides a comprehensive chronicle of real-world movements and habits."
    ],
    suggested_controls: [
      "Choose 'Approximate location' instead of 'Precise location' whenever pinpoint accuracy is not essential.",
      "Set permission to 'While using app' and disable background location access.",
      "Review location history settings in your mobile/browser settings periodically."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "Spatial tracking data reveals sensitive personal routines, residences, workplaces, and physical associations.",
    risk_score: 3,
    chrome_permission_name: "geolocation"
  },
  {
    id: "location_background",
    name: "Background Location Access",
    category: "Location",
    short_description: "Allows the app to access device location even when the app is not actively open.",
    plain_english: "Background location access allows an application to periodically or continuously collect device coordinates while running in the background. Modern mobile operating systems restrict this permission heavily and require explicit user consent.",
    legitimate_use_cases: [
      "Emergency SOS and roadside assistance tracking",
      "Geofenced home automation triggers (e.g., turning on lights when arriving)",
      "Hands-free navigation continuing when screen is locked",
      "Family safety and designated location sharing"
    ],
    accessible_data: [
      "Continuous 24/7 travel patterns, timestamps, and route breadcrumbs",
      "Frequent stay points (home, office, schools, clinics)"
    ],
    privacy_questions: [
      "Is continuous background tracking essential for this app to provide value?",
      "Does the app offer a way to track location only during an active trip or session?"
    ],
    considerations: [
      "Background tracking allows persistent surveillance of all physical movement without ongoing visual prompts."
    ],
    suggested_controls: [
      "Restrict to 'Only while using app' unless the background service is fundamentally indispensable to you.",
      "Check OS location reminders indicating an app has accessed your location in the background."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "Enables persistent passive tracking of physical coordinates without the app being active on screen.",
    risk_score: 3,
    chrome_permission_name: null
  },
  {
    id: "contacts",
    name: "Contacts & Address Book",
    category: "Contacts",
    short_description: "Allows the app to read or manage contacts stored on the device.",
    plain_english: "Contacts access may expose information from a user's address book. This typically includes names, phone numbers, email addresses, mailing addresses, and notes stored for family, colleagues, and acquaintances.",
    legitimate_use_cases: [
      "Finding friends or invitees who are already using a messaging network",
      "Auto-completing recipient details when sending money, emails, or invitations",
      "Backing up and restoring address book entries"
    ],
    accessible_data: [
      "Names, telephone numbers, and email addresses of all saved contacts",
      "Job titles, company names, physical addresses, and personal contact notes",
      "Relationship labels and birthday records stored within contact cards"
    ],
    privacy_questions: [
      "Am I comfortable sharing my friends' and colleagues' private phone numbers with this app?",
      "Can I add a contact manually instead of uploading my entire phonebook?",
      "Does the app upload my contacts to external servers or keep them strictly on my device?"
    ],
    considerations: [
      "Contacts access does not just expose your own data; it shares third parties' private contact details who never consented to the app's terms.",
      "Some applications use address book uploads to build social graphs and advertising identity databases."
    ],
    suggested_controls: [
      "Use manual friend search or one-by-one contact picker when supported by the OS.",
      "Deny contacts permission if you can easily type in or paste phone numbers manually.",
      "Periodically audit which apps hold address book access."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "Exposes personal data of third parties (family, friends, coworkers) stored inside the device address book.",
    risk_score: 3,
    chrome_permission_name: null
  },
  {
    id: "photos_media",
    name: "Photos & Media Library",
    category: "Photos and media",
    short_description: "Allows the app to read images, videos, and media files stored on the device.",
    plain_english: "Photos and media access allows an application to browse and read images and videos saved in your photo gallery. Modern operating systems support a photo picker that lets you choose specific individual photos without granting permission to view your entire photo library.",
    legitimate_use_cases: [
      "Selecting photos to edit, crop, or apply artistic filters to",
      "Attaching images to messages, emails, or marketplace listings",
      "Backing up camera roll items to a secure cloud drive"
    ],
    accessible_data: [
      "Photographs, screenshots, downloaded images, and video clips",
      "EXIF metadata including embedded capture dates, camera models, and GPS coordinates",
      "Visual information containing faces, receipts, IDs, and personal documents"
    ],
    privacy_questions: [
      "Does this application really need to see every photo I've ever taken, or just the one I want to upload?",
      "Can I use the operating system's Limited Photos picker instead of granting full access?",
      "Do my photos contain sensitive content like credit cards or government identification?"
    ],
    considerations: [
      "Photo libraries often contain deeply intimate moments, sensitive work documents, and location-rich EXIF coordinates.",
      "Full library access grants the ability to read all images, not merely the intended selection."
    ],
    suggested_controls: [
      "Select 'Select Photos...' (Limited Access) so the app can only view the photos you explicitly pick.",
      "Strip location metadata from photos before sharing if your phone supports it.",
      "Deny access if an app has no legitimate image editing or uploading features."
    ],
    consideration_level: "Moderate consideration",
    consideration_rationale: "Contains personal photos, visual memories, and embedded geotags, but modern OS photo pickers can isolate access.",
    risk_score: 2,
    chrome_permission_name: null
  },
  {
    id: "storage_files",
    name: "Files & Storage Access",
    category: "Files and storage",
    short_description: "Allows the app to read and write files on internal or shared device storage.",
    plain_english: "Files and storage permission allows an application to read, modify, or create files within device storage folders. On modern systems, scoped storage restricts apps to their own folders unless broader document access is explicitly granted.",
    legitimate_use_cases: [
      "File manager utilities organizing downloads and archives",
      "Document editors opening PDFs, spreadsheets, or text files",
      "Offline cache storage for media streaming apps"
    ],
    accessible_data: [
      "Downloaded files, documents, archives, and offline caches",
      "Storage space availability and file structure details",
      "Files saved by other apps in shared public storage folders"
    ],
    privacy_questions: [
      "Why does this application need broad file access rather than its own private sandbox folder?",
      "Are there sensitive documents stored in my Downloads or Documents folder?"
    ],
    considerations: [
      "Broad storage access may allow reading exported bank statements, tax forms, or confidential documents stored in shared folders.",
      "Improper write access could potentially modify or delete existing files."
    ],
    suggested_controls: [
      "Prefer apps utilizing scoped storage or the system file picker dialog.",
      "Avoid granting 'All files access' unless using an authentic file management tool.",
      "Move highly sensitive documents to encrypted or secure folder vaults."
    ],
    consideration_level: "Moderate consideration",
    consideration_rationale: "Can access documents and downloads, but scoped storage models in modern OS versions mitigate broad exposure.",
    risk_score: 2,
    chrome_permission_name: null
  },
  {
    id: "notifications",
    name: "Notifications",
    category: "Notifications",
    short_description: "Allows the app or website to post push notifications, alerts, and badges on the device.",
    plain_english: "Notifications permission allows an application or website to display alerts, badges, sounds, and banners. It is fundamentally distinct from permissions that read private information; it allows an app to communicate outward to you rather than reading personal device data.",
    legitimate_use_cases: [
      "Alerting you to incoming messages, phone calls, or calendar reminders",
      "Breaking news, weather alerts, or emergency notifications",
      "Order status updates, rideshare arrival alerts, and delivery tracking"
    ],
    accessible_data: [
      "Does not provide access to your private device sensors, contacts, or stored files",
      "Allows the app to transmit status alerts, badge counts, and promotional messages to your display"
    ],
    privacy_questions: [
      "Will this app send me useful alerts, or will it flood my screen with marketing and engagement spam?",
      "Do I want notifications from this app appearing on my lock screen where others might read them?"
    ],
    considerations: [
      "While notifications do not read your private files, sensitive information (e.g., OTP codes, message previews) might be visible to bystanders on lock screens.",
      "Frequent notification prompts can be used for behavioral nudge tactics or attention-hijacking."
    ],
    suggested_controls: [
      "Hide sensitive notification content from your lock screen in device settings.",
      "Use notification channels or categories to turn off promotional alerts while keeping critical updates.",
      "Mute notifications or use 'Do Not Disturb' focus modes."
    ],
    consideration_level: "Lower consideration",
    consideration_rationale: "Outward communication channel to display alerts; does not read private sensors, files, or personal databases.",
    risk_score: 1,
    chrome_permission_name: "notifications"
  },
  {
    id: "clipboard",
    name: "Clipboard Access",
    category: "Clipboard",
    short_description: "Allows the website or app to read text or images copied to your clipboard.",
    plain_english: "Clipboard read access allows a website or app to inspect what you recently copied (like passwords, credit card numbers, addresses, or private messages). Browsers require explicit user gestures or permission before reading clipboard content.",
    legitimate_use_cases: [
      "Pasting text, links, or images directly into an online editor or chat window",
      "Quickly importing coupon codes or wallet addresses with a single click",
      "Formatting or converting text in web-based developer tools"
    ],
    accessible_data: [
      "Any copied text, URLs, cryptographic keys, passwords, or image data present in the clipboard buffer"
    ],
    privacy_questions: [
      "Did I recently copy a password or credit card number that might still be in my clipboard?",
      "Does the site ask for clipboard access without me clicking a 'Paste' button?"
    ],
    considerations: [
      "Clipboard contents frequently hold unencrypted passwords, two-factor authentication codes, or confidential snippets.",
      "Unrestricted clipboard reading could expose sensitive data immediately after copying."
    ],
    suggested_controls: [
      "Grant clipboard read access only when actively using a paste shortcut or button.",
      "Clear clipboard history after copying passwords or financial details.",
      "Block sites that demand background clipboard read access."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "The clipboard transiently holds highly sensitive data such as passwords, OTPs, and personal text.",
    risk_score: 3,
    chrome_permission_name: "clipboard-read"
  },
  {
    id: "calendar",
    name: "Calendar Access",
    category: "Calendar",
    short_description: "Allows the app to read, create, or modify events in your device calendar.",
    plain_english: "Calendar access allows an application to view your scheduled events, appointments, meeting descriptions, attendees, and reminders stored in your calendar accounts.",
    legitimate_use_cases: [
      "Productivity and scheduling assistants synchronizing appointments",
      "Travel booking apps automatically adding flight or hotel reservations",
      "Conference tools scheduling meetings and generating calendar invites"
    ],
    accessible_data: [
      "Event titles, meeting dates, times, durations, and locations",
      "Participant email addresses and attendee response statuses",
      "Notes and attachments associated with calendar invitations"
    ],
    privacy_questions: [
      "Does this application need access to my entire schedule or just the ability to create a single event?",
      "Does my calendar contain confidential client meetings, doctor appointments, or personal commitments?"
    ],
    considerations: [
      "Calendar data outlines your upcoming whereabouts, travel plans, who you meet with, and confidential subjects.",
      "Malicious calendar spam or modifications could inject misleading events or phishing links."
    ],
    suggested_controls: [
      "Use 'Add event only' permissions if your operating system supports it.",
      "Separate work calendars and personal calendars using different user profiles.",
      "Audit calendar permissions periodically."
    ],
    consideration_level: "Moderate consideration",
    consideration_rationale: "Reveals detailed schedule, attendee lists, and personal commitments, though usually structured around time management.",
    risk_score: 2,
    chrome_permission_name: null
  },
  {
    id: "nearby_devices",
    name: "Nearby Devices",
    category: "Nearby devices",
    short_description: "Allows the app to discover and connect to nearby Wi-Fi or local devices.",
    plain_english: "Nearby devices permission allows an application to scan for, pair with, and communicate with local devices on the local network, Wi-Fi Direct, or ultra-wideband without requiring general location access on newer operating systems.",
    legitimate_use_cases: [
      "Casting media to smart TVs and speakers",
      "Direct file transfer between peer devices (e.g., Quick Share, AirDrop)",
      "Smart home setup and local IoT device provisioning"
    ],
    accessible_data: [
      "Identities and names of smart devices, TVs, and appliances on the local network",
      "Local IP addresses and hardware broadcast signatures",
      "Signal strength indicators indicating proximity to nearby hardware"
    ],
    privacy_questions: [
      "Does this app need to scan my home network, or is it a standalone tool?",
      "Could local network scanning be used to profile other household devices?"
    ],
    considerations: [
      "Scanning local networks can create an inventory of connected hardware present in your home.",
      "Proximity to fixed local beacons can occasionally be correlated with physical location."
    ],
    suggested_controls: [
      "Grant only to streaming, casting, or smart device manager applications.",
      "Turn off local network access for simple games and utility apps.",
      "Disconnect from public Wi-Fi networks when local scanning is not required."
    ],
    consideration_level: "Moderate consideration",
    consideration_rationale: "Discloses local network infrastructure and household device topology, though distinct from raw location tracking.",
    risk_score: 2,
    chrome_permission_name: null
  },
  {
    id: "bluetooth",
    name: "Bluetooth Access",
    category: "Bluetooth",
    short_description: "Allows the app or website to scan for and connect to Bluetooth peripherals and beacons.",
    plain_english: "Bluetooth permission allows an application or site to communicate with wireless accessories such as headphones, fitness bands, heart rate monitors, and smart home gadgets.",
    legitimate_use_cases: [
      "Pairing with wireless headphones, hearing aids, and speakers",
      "Syncing health data from smartwatches and fitness bands",
      "Controlling Bluetooth-enabled smart lighting and IoT gear"
    ],
    accessible_data: [
      "Bluetooth hardware identifiers (MAC addresses and broadcast names) of nearby devices",
      "Biometric or sensor telemetry streamed from paired health accessories",
      "Relative signal strength (RSSI) to estimate distance from physical beacons"
    ],
    privacy_questions: [
      "Does this application connect to external hardware, or is it purely software-based?",
      "Is the app scanning for commercial retail beacons to track my physical store visits?"
    ],
    considerations: [
      "Bluetooth beacon monitoring has historically been leveraged by advertising networks to detect shoppers walking into retail locations.",
      "Accessory data streams may contain sensitive telemetry like pulse rates or sleep statistics."
    ],
    suggested_controls: [
      "Use modern OS/browser permission settings that decouple Bluetooth peripheral access from location scanning.",
      "Turn off Bluetooth when not in use in crowded public areas.",
      "Revoke Bluetooth permission for apps that do not communicate with external accessories."
    ],
    consideration_level: "Moderate consideration",
    consideration_rationale: "Connects to physical accessories and can detect nearby beacon signals, potentially correlating proximity.",
    risk_score: 2,
    chrome_permission_name: null
  },
  {
    id: "phone_state",
    name: "Phone State & Calls",
    category: "Phone-related access",
    short_description: "Allows the app to read phone status, carrier network, and ongoing call states.",
    plain_english: "Phone-related access allows an application to know whether a phone call is active, read the cellular carrier network information, and on older platforms access cellular hardware identifiers.",
    legitimate_use_cases: [
      "Pausing audio or video playback automatically when an incoming phone call arrives",
      "Dialer and VoIP replacement applications placing cellular phone calls",
      "Carrier network verification for SMS billing or SIM services"
    ],
    accessible_data: [
      "Call state (ringing, off-the-hook, call ended)",
      "Cellular network operator, country code, and SIM status",
      "Phone numbers on supported devices and carrier configurations"
    ],
    privacy_questions: [
      "Why does a game or media player need phone state access instead of standard audio focus listeners?",
      "Could this permission allow an app to read my mobile phone number or cellular provider details?"
    ],
    considerations: [
      "Accessing phone state may expose network identity data and call status transitions.",
      "Unnecessary phone permissions are frequently requested by outdated or legacy advertising libraries."
    ],
    suggested_controls: [
      "Deny phone permissions to games, wallpaper apps, and general utilities.",
      "Check if the app offers functionality without needing phone call permissions.",
      "Verify whether the app requests phone state simply for audio management."
    ],
    consideration_level: "Higher consideration",
    consideration_rationale: "Interacts with telephony hardware, call state, and cellular identifier metadata.",
    risk_score: 3,
    chrome_permission_name: null
  },
  {
    id: "sensors",
    name: "Body & Motion Sensors",
    category: "Sensors",
    short_description: "Allows the app or website to access data from accelerometers, gyroscopes, and heart-rate sensors.",
    plain_english: "Sensors permission allows an application or site to read continuous measurements from device hardware such as the step counter, accelerometer, gyroscope, barometer, and on-body health sensors.",
    legitimate_use_cases: [
      "Pedometer step counting and physical activity tracking",
      "Screen orientation changes and game tilt controls",
      "Monitoring heart rate, skin temperature, or vitals during workouts"
    ],
    accessible_data: [
      "Physical step counts, cadence, and movement velocity",
      "Device tilt, rotation, acceleration, and orientation angles",
      "Biometric readings from wearable heart rate or health sensors"
    ],
    privacy_questions: [
      "Does this application offer genuine fitness, navigation, or motion features?",
      "Can high-frequency motion data reveal when I am walking, driving, or typing?"
    ],
    considerations: [
      "Micro-vibrations and motion sensor feeds can theoretically reveal keystroke patterns, gait, and mode of transit.",
      "Continuous sensor polling can also impact device battery life."
    ],
    suggested_controls: [
      "Grant physical activity permissions exclusively to recognized health and fitness trackers.",
      "Revoke body sensor access when fitness tracking sessions are completed.",
      "Review sensor permissions in device privacy settings."
    ],
    consideration_level: "Moderate consideration",
    consideration_rationale: "Measures physical movements, biometric vitals, and device orientation; valuable for fitness, but reveals physical activity patterns.",
    risk_score: 2,
    chrome_permission_name: null
  }
];

// Helper functions for easy consumption across components
function getAllPermissions() {
  return PERMISSIONS_DATA;
}

function getPermissionById(id) {
  if (!id) return null;
  return PERMISSIONS_DATA.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
}

function getPermissionByChromeName(name) {
  if (!name) return null;
  return PERMISSIONS_DATA.find(p => p.chrome_permission_name === name) || null;
}

// Support both ES Module, CommonJS, and Browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PERMISSIONS_DATA, getAllPermissions, getPermissionById, getPermissionByChromeName };
}
if (typeof window !== 'undefined') {
  window.PermissionsDB = { data: PERMISSIONS_DATA, getAll: getAllPermissions, getById: getPermissionById, getByChromeName: getPermissionByChromeName };
}
