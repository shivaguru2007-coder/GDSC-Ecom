const axios = require("axios");

const sendWebhookNotification = async (webhookUrl, data) => {
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, data, { headers: { "Content-Type": "application/json" } });
    console.log("Webhook sent successfully");
  } catch (error) {
    console.error("Failed to send webhook:", error.message);
  }
};

module.exports = sendWebhookNotification;
