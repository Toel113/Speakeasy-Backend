const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

let db, auth, bucket;

const connectDB = async () => {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: "miss-wellness-d516d.appspot.com", // ✅ ตรวจสอบชื่อ bucket
            });
        }

        db = admin.firestore();
        auth = admin.auth();
        bucket = admin.storage().bucket();

        console.log("Firebase Admin SDK initialized.");
    } catch (error) {
        console.error("Error initializing Firebase Admin SDK:", error);
        throw error;
    }
};

module.exports = { connectDB, admin, db, auth, bucket };
