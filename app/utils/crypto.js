// utils/crypto.js
import CryptoJS from "crypto-js";

// const SECRET_KEY = process.env.SECURITY_KEY; // store this securely (e.g., .env)
const SECRET_KEY = "xyzAcM@12"; // store this securely (e.g., .env)

export const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

export const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
