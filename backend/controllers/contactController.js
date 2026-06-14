import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  const contact = new Contact(req.body);
  const created = await contact.save();
  res.status(201).json(created);
};

export const getContacts = async (req, res) => {
  const contacts = await Contact.find({}).sort("-createdAt");
  res.json(contacts);
};

export const replyToContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact) {
      contact.reply = req.body.reply;
      contact.status = "replied";
      contact.repliedBy = req.user._id;
      const updated = await contact.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: "Contact request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    contact.status = "resolved";
    const updated = await contact.save();
    res.json({ message: "Contact marked as resolved", contact: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate(
      "repliedBy",
      "name email",
    );

    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: "Contact request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
