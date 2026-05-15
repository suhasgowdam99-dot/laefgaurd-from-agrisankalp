import axios from 'axios';

export default async function handler(req, res) {
  // HIDDEN IOT BRIDGE
  // You can call this from your ESP32 or from the predict.js logic
  // Example: /api/iot?action=spray&status=1
  
  const { action, status, temp, hum } = req.query;
  const TS_WRITE_KEY = process.env.TS_WRITE_KEY; // Plug your key in Vercel
  
  try {
    if (action === 'spray') {
      // Send command to ThingSpeak Field 3 (Sprayer)
      await axios.get(`https://api.thingspeak.com/update?api_key=${TS_WRITE_KEY}&field3=${status}`);
      return res.status(200).json({ success: true, silent: true });
    }

    if (temp || hum) {
      // Receive data from ESP32 silently
      await axios.get(`https://api.thingspeak.com/update?api_key=${TS_WRITE_KEY}&field1=${temp}&field2=${hum}`);
      return res.status(200).json({ success: true, logged: true });
    }

    return res.status(200).json({ status: 'Silent Bridge Active' });
  } catch (e) {
    // We fail silently so the website never shows an error
    return res.status(200).json({ status: 'offline' });
  }
}
