const db = require("../model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = db.user;
const config = require("../config/environment");
const PROVIDERS = require("../constants/providers");
const {
  validateTelegramAuth,
  isValidTelegramAuthDate,
} = require("../utils/telegram");

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).send({ message: "All fields are required." });
    }
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      provider: PROVIDERS.PASSWORD, // Assign password provider
    });
    await newUser.save();
    res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password"); // Select password for comparison
    if (!user) {
      return res.status(404).json({ message: "This user not found." });
    }
    // Check if the user is a password provider
    if (user.provider && user.provider !== PROVIDERS.PASSWORD) {
      return res.status(400).json({
        message: `Please log in using your ${user.provider} account.`,
      });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(400).json({ message: "Incorrect password." });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret, // Use JWT secret from environment config
      { expiresIn: "5h" },
    );
    // Remove password from the user object before sending response
    user.password = undefined;
    res.status(200).json({
      message: "User login succesfully.",
      user: {
        username: user.username,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.telegramLogin = async (req, res) => {
  try {
    const {
      id: provider_id,
      username,
      first_name,
      last_name,
      auth_date,
      hash,
      photo_url,
    } = req.body;

    console.log("[Auth Controller] Received Telegram Login Request:", req.body);

    // 1. Validate required Telegram auth data
    if (!auth_date || !hash || !provider_id) {
      return res
        .status(400)
        .json({ message: "Missing Telegram authentication data." });
    }

    // 2. Validate auth_date freshness
    if (!isValidTelegramAuthDate(Number(auth_date))) {
      return res
        .status(400)
        .json({ message: "Telegram authentication data expired." });
    }

    // 3. Validate Telegram hash
    if (!validateTelegramAuth(req.body)) {
      return res
        .status(401)
        .json({ message: "Invalid Telegram authentication hash." });
    }

    let user = await User.findOne({
      provider: PROVIDERS.TELEGRAM,
      provider_id,
    });

    if (!user) {
      // User does not exist, create a new one
      const newUsername =
        username ||
        `${first_name || "telegram"}${last_name ? `_${last_name}` : ""}_${provider_id}`;
      user = new User({
        username: newUsername,
        provider: PROVIDERS.TELEGRAM,
        provider_id: provider_id,
        photo_url: photo_url || undefined,
        role: "Admin", // Default role for new Telegram users
        email: `${newUsername}@telegram.com`, // A dummy email if none provided by Telegram
      });
      await user.save();
    } else {
      // User exists, update timestamps (if configured in schema)
      await user.save();
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret, // Use JWT secret from environment config
      { expiresIn: "5h" },
    );

    res.status(200).json({
      message: "Telegram login successful.",
      user: {
        username: user.username,
        role: user.role,
        photo_url: user.photo_url,
        token: token,
      },
    });
  } catch (error) {
    console.error("Error during Telegram login:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Telegram Mini App login — verify initData and auto-login
exports.telegramWebAppLogin = async (req, res) => {
  try {
    const { initData, phone_number } = req.body;

    if (!initData) {
      return res.status(400).json({ message: "Missing initData." });
    }

    // Parse initData (URL encoded string)
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    params.delete("hash");

    // Sort and create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Verify using HMAC-SHA256
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(config.telegram.botToken)
      .digest();

    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== hash) {
      return res.status(401).json({ message: "Invalid Mini App data." });
    }

    // Extract user data
    const userData = JSON.parse(params.get("user"));
    const provider_id = userData.id.toString();

    // Find or create user
    let user = await User.findOne({
      provider: PROVIDERS.TELEGRAM,
      provider_id,
    });

    if (!user) {
      const newUsername =
        userData.username ||
        `${userData.first_name || "telegram"}${userData.last_name ? `_${userData.last_name}` : ""}_${provider_id}`;
      user = new User({
        username: newUsername,
        provider: PROVIDERS.TELEGRAM,
        provider_id,
        photo_url: userData.photo_url || undefined,
        role: "Admin",
        email: `${newUsername}@telegram.com`,
        phone_number: phone_number || undefined,
      });
      await user.save();
    } else {
      // Update phone number if provided
      if (phone_number) {
        user.phone_number = phone_number;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: "5h" },
    );

    res.status(200).json({
      message: "Mini App login successful.",
      user: {
        username: user.username,
        role: user.role,
        photo_url: user.photo_url,
        phone_number: user.phone_number,
        token,
      },
    });
  } catch (error) {
    console.error("Error during Mini App login:", error.message);
    res.status(500).json({ message: error.message });
  }
};
