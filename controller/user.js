const admin = require("firebase-admin");
const db = admin.firestore();
const auth = admin.auth();

exports.register = async (req, res) => {
    const { email, password, name, age, birth } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // ✅ check email ซ้ำใน Firestore
        const snapshot = await db.collection("User").where("email", "==", email).get();

        if (!snapshot.empty) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // ✅ สร้าง user ใน Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name || null,
        });

        // ✅ เก็บข้อมูล user เพิ่มเติมลง Firestore
        await db.collection("User").doc(userRecord.uid).set({
            email: userRecord.email,
            name: name || null,
            age: age || null,
            birth: birth || null,
            createdAt: new Date(),
            achievement: [
                {
                    "Basic Words (คำพื้นฐาน)": {
                        score: 0,
                        maxScore: 10
                    },
                    "Feelings & Health (อาการ,ความรู้สึก)": {
                        score: 0,
                        maxScore: 10
                    },
                    "Directions & Transport (ทิศทางและการเดินทาง)": {
                        score: 0,
                        maxScore: 10
                    },
                    "Time & Days (เวลาและวัน)": {
                        score: 0,
                        maxScore: 10
                    }
                }
            ]
        });

        return res.status(201).json({
            message: "User created successfully",
            uid: userRecord.uid,
            email: userRecord.email,
        });
    } catch (error) {
        console.log("Register Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.getUser = async (req, res) => {
    try {
        const { email } = req.body; // ใช้ email จาก body
        console.log("Fetching user with email:", email);
        const snapshot = await db.collection("User").where("email", "==", email).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "User not found" });
        }

        // ดึงข้อมูลทั้งหมด พร้อม docId
        const users = snapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({ users });
    } catch (error) {
        console.error("Error getting user:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};