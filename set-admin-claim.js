/**
 * set-admin-claim.js
 *
 * Run this ONCE locally with Node.js to grant a user the "admin" role
 * via a Firebase Custom Claim. The claim lives in the token on Google's
 * servers — it cannot be faked by a client, unlike an email string check.
 *
 * Prerequisites:
 *   npm install firebase-admin
 *
 * Usage:
 *   node set-admin-claim.js <USER_UID>
 *
 * How to find the UID:
 *   Firebase console → Authentication → Users → copy the UID column.
 *
 * IMPORTANT: Never commit your serviceAccountKey.json to git.
 * Add it to .gitignore immediately.
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // download from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: node set-admin-claim.js <USER_UID>");
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log(`✅ Admin claim set for UID: ${uid}`);
    console.log("The user must sign out and sign back in for the claim to take effect.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting claim:", err);
    process.exit(1);
  });
