//Just a mock payemnt gateway
const mockPaymentGateway = async (amount) => {
    /*return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, transactionId: `TXN${Date.now()}`, amount });
      }, 2000); // delay
    });*/
    return true;
  };

module.exports = {mockPaymentGateway};