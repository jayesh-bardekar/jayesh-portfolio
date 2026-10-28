const Contact = require("../models/Contact");
const transporter = require("../config/email");

// Submit contact form and send email
const createContact = async (req, res) => {
try {
const { name, email, subject, message } = req.body;

// Validate fields
if (
  typeof name !== "string" ||
  typeof email !== "string" ||
  typeof subject !== "string" ||
  typeof message !== "string"
) {
  return res.status(400).json({
    success: false,
    message: "Please fill in all fields.",
  });
}

const cleanName = name.trim();
const cleanEmail = email.trim().toLowerCase();
const cleanSubject = subject.trim();
const cleanMessage = message.trim();

if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
  return res.status(400).json({
    success: false,
    message: "All fields are required.",
  });
}

if (
  cleanName.length > 100 ||
  cleanEmail.length > 150 ||
  cleanSubject.length > 200 ||
  cleanMessage.length > 3000
) {
  return res.status(400).json({
    success: false,
    message: "One or more fields exceed the allowed length.",
  });
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(cleanEmail)) {
  return res.status(400).json({
    success: false,
    message: "Please enter a valid email address.",
  });
}

// Save message to MongoDB
const contact = await Contact.create({
  name: cleanName,
  email: cleanEmail,
  subject: cleanSubject,
  message: cleanMessage,
});

try {
  // Send email notification
  await transporter.sendMail({
    from: {
      name: "Portfolio Contact Form",
      address: process.env.EMAIL_USER,
    },
    to: process.env.CONTACT_RECEIVER,
    replyTo: cleanEmail,
    subject: `Portfolio Contact: ${cleanSubject}`,
    text: `


You have received a new message through your portfolio.

Name: ${cleanName}
Email: ${cleanEmail}
Subject: ${cleanSubject}

Message:
${cleanMessage}
`,
});
} catch (emailError) {
console.error("Email sending failed:", emailError.message);

  return res.status(502).json({
    success: false,
    message:
      "Your message could not be emailed. Please try again later.",
    saved: true,
    contactId: contact._id,
  });
}

return res.status(201).json({
  success: true,
  message: "Your message has been sent successfully!",
});

} catch (error) {
console.error("Contact submission failed:", error.message);

return res.status(500).json({
  success: false,
  message: "Unable to send your message. Please try again later.",
});

}
};

// Get messages (admin only)
const getContacts = async (req, res) => {
try {
const contacts = await Contact.find().sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  count: contacts.length,
  contacts,
});

} catch (error) {
console.error("Fetching messages failed:", error.message);

return res.status(500).json({
  success: false,
  message: "Unable to fetch contact messages.",
});

}
};

// Mark message as read (admin only)
const markContactRead = async (req, res) => {
try {
const contact = await Contact.findByIdAndUpdate(
req.params.id,
{ isRead: true },
{ new: true, runValidators: true }
);

if (!contact) {
  return res.status(404).json({
    success: false,
    message: "Contact message not found.",
  });
}

return res.status(200).json({
  success: true,
  contact,
});


} catch (error) {
console.error("Updating message failed:", error.message);

return res.status(500).json({
  success: false,
  message: "Unable to update contact message.",
});

}
};

module.exports = {
createContact,
getContacts,
markContactRead,
};
