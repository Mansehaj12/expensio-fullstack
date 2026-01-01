const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Family = require("../models/Family");

const router = express.Router();

function generateFamilyCode() {
  return "FAM" + Math.floor(1000 + Math.random() * 9000);
}

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, option, familyName, familyCode } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    let family;

    if (option === "create") {
      family = new Family({
        familyName,
        familyCode: generateFamilyCode(),
        members: [],
      });
      await family.save();
    } else {
      family = await Family.findOne({ familyCode });
      if (!family)
        return res.status(400).json({ msg: "Invalid family code" });
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      familyId: family._id,
    });

    await user.save();
    family.members.push(user._id);
    await family.save();

    res.json({ msg: "Signup successful", familyCode: family.familyCode });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, familyId: user.familyId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, username });
  } catch {
    res.status(500).json({ msg: "Login failed" });
  }
});

module.exports = router;
