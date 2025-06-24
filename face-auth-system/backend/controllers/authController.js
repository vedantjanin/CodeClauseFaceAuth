const User = require('../models/User');

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, faceData } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered with this email" });
    }

    // Save new user
    const user = new User({ name, email, faceData });
    await user.save();

    res.status(201).json({ message: "User registered with face data" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { faceData } = req.body;

  try {
    const users = await User.find();

    // Convert stringified faceData to array
    const incomingFace = JSON.parse(faceData);

    let matchedUser = null;

    for (const user of users) {
      const storedFace = JSON.parse(user.faceData);

      const distance = euclideanDistance(storedFace, incomingFace);

      // ✅ Face match threshold (you can tune this)
      if (distance < 0.45) {
        matchedUser = user;
        break;
      }
    }

    if (matchedUser) {
      res.status(200).json({
        message: "Login successful",
        user: {
          id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email
        }
      });
    } else {
      res.status(401).json({ message: "Face not recognized" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Helper: Euclidean Distance for 128D face descriptor
function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
