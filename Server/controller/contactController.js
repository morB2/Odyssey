import ContactRequest from "../models/contactModel.js";

// Public: Submit a contact form
export const submitContactForm = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newContact = new ContactRequest({
            firstName,
            lastName,
            email,
            subject,
            message,
        });

        await newContact.save();

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};

// Admin: Get all contact messages
export const getContactMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const messages = await ContactRequest.find()
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit);

        const total = await ContactRequest.countDocuments();

        res.status(200).json({
            messages,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// Admin: Mark message as read
export const markMessageRead = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ContactRequest.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json(message);
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ message: "Failed to update message" });
    }
};

// Admin: Delete a message
export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ContactRequest.findByIdAndDelete(id);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact message:", error);
        res.status(500).json({ message: "Failed to delete message" });
    }
};
