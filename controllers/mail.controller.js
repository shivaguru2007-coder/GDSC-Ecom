const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_USERNAME,
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
  },
});
  
async function mailSender(to, subject, content){
    transporter.sendMail({
        from: 'SG',
        to: to,
        subject: subject,
        html: content
    })
}


const sendOTP =async (to,otp)=>{
    html = `<center>
      <div class="card" style="background-color: white">
        <h1>Email Verification</h1>
        <p>
          Here is the verificaiton code. Please copy it and verify your email
        </p>
        <div
          class="code"
          style="
            background-color: rgba(0, 0, 0, 0.05);
            margin: 0 10%;
            padding: 2px;
          "
        >
          <h2>Code: ${otp}</h2>
        </div>
        <p>
          If this email is not entended to you please ignore and delete it.
          Thank you.
        </p>
      </div>
    </center>`
    mailSender(to,"Email Verification",html)
}
const orderConfirm =async (to,userName,orderID)=>{
  html = `<center>
  <div class="card" style="background-color: white">
    <h1>Order Confirmation</h1>
    <p>
      This email is for the confirmation of the order.
    </p>
    <p>Name: ${userName}
    OrderID: ${orderID}
    </p>

    <div
      class="code"
      style="
        background-color: rgba(0, 0, 0, 0.05);
        margin: 0 10%;
        padding: 2px;
      "
    >
    </div>
    <p>
      If this email is not entended to you please ignore and delete it.
      Thank you.
    </p>
  </div>
</center>`
mailSender(to,"Email Verification",html)
}
module.exports={
  sendOTP,
  orderConfirm

}