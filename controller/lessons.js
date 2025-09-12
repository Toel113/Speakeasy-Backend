
const admin = require("firebase-admin");
const db = admin.firestore();

exports.getAllCategory = (req, res) => {
    db.collection("Lessons").doc("category")
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "No categories found" });
            }

            const data = doc.data();
            const categories = Object.entries(data).map(([id, name]) => ({
                id,
                name
            }));

            res.status(200).json(categories);
        })
        .catch((error) => {
            console.error("Error fetching categories:", error);
            res.status(500).json({ error: "Internal server error" });
        });
};

exports.setVocabulary = async (req, res) => {
    try {
        const { docname, word, roman, meaning, audio } = req.body;

        const docRef = db.collection("Lessons").doc(docname);

        await docRef.update({
            Vocabulary: admin.firestore.FieldValue.arrayUnion({
                word,
                roman,
                meaning,
                audio: ""
            }),
        });

        res.status(200).json({ message: "Vocabulary added successfully" });
    } catch (error) {
        console.error("Error setting vocabulary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.setSentences = async (req, res) => {
    try {
        const { docname, sentence, roman, meaning, audio } = req.body;

        const docRef = db.collection("Lessons").doc(docname);

        await docRef.update({
            Sentences: admin.firestore.FieldValue.arrayUnion({
                sentence,
                roman,
                meaning,
                audio: ""
            }),
        });


        res.status(200).json({ message: "Sentence added successfully" });
    } catch (error) {
        console.error("Error setting sentence:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.setListening = (req, res) => {
    const { docname, dialogue, questions, Answer } = req.body;

    const docRef = db.collection("Lessons").doc(docname);

    docRef.update({
        Listening: admin.firestore.FieldValue.arrayUnion({
            dialogue, questions, Answer: ""
        }),
    })
        .then(() => {
            res.status(200).json({ message: "Listening added successfully" });
        })
        .catch((error) => {
            console.error("Error setting listening:", error);
            res.status(500).json({ error: "Internal server error" });
        });
};

exports.getDataCategory = async (req, res) => {
    try {
        const { category } = req.body;

        const docRef = db.collection("Lessons").doc(category);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        console.error("Error getting category", error);
        return res.status(500).json({ error: error.message });
    }
};

exports.setExamScore = async (req, res) => {
    try {
        const { email, category, score } = req.body;

        // หา user ด้วย email
        const snapshot = await db.collection("User").where("email", "==", email).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "User not found" });
        }

        const userDoc = snapshot.docs[0].ref;

        // ดึงข้อมูลเดิม
        const data = (await userDoc.get()).data();

        let achievement = data.achievement || [{}]; // ถ้าไม่มี ให้สร้าง array กับ object เปล่า
        achievement[0] = achievement[0] || {};

        // อัปเดตเฉพาะ category ที่ต้องการ
        achievement[0][category] = {
            ...achievement[0][category], // เก็บข้อมูลเดิมของ category นี้
            score: score,
            updatedAt: new Date()
        };

        // อัปเดตกลับไป
        await userDoc.update({ achievement });

        return res.status(200).json({
            message: "Score updated successfully",
            email,
            category,
            score
        });
    } catch (error) {
        console.error("Error setting exam score", error);
        return res.status(500).json({ error: error.message });
    }
};


exports.setExam = async (req, res) => {
    try {
        const { docname, Question, Choices, Answer } = req.body;

        // ตรวจสอบว่ามีค่าครบหรือไม่
        if (!docname || !Question || !Choices || !Answer) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const docRef = db.collection("Lessons").doc(docname);

        await docRef.update({
            Exam: admin.firestore.FieldValue.arrayUnion({
                Question,
                Choices,
                Answer
            }),
        });

        res.status(200).json({ message: "Exam added successfully" });
    } catch (error) {
        console.error("Error setting exam:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
