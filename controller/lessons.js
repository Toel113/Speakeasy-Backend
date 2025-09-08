
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

        // ได้ docRef ของ user
        const userDoc = snapshot.docs[0].ref;

        // update achievement ตาม category
        await userDoc.update(
            {
                achievement: {
                    [category]: {
                        score: score,
                        updatedAt: new Date(),
                    },
                },
            },
            { merge: true } // จะไม่ทับทั้ง document แต่ merge เข้าไป
        );

        return res.status(200).json({ message: "Score updated successfully" });
    } catch (error) {
        console.error("Error setting exam score", error);
        return res.status(500).json({ error: error.message });
    }
};