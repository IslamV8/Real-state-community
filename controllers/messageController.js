const Message = require("../models/Message");
const Joi = require("joi");

const messageSchema = Joi.object({
    receiverId: Joi.string().required(),
    content: Joi.string().required()
});


exports.sendMessage = async (req, res) => {
    try {
        const { error } = messageSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const message = new Message({
            sender: req.user.userId,
            receiver: req.body.receiverId,
            content: req.body.content
        });

        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};


exports.getMessagesBetweenUsers = async (req, res) => {
    try {
        const userId = req.user.userId;

        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
            .populate("sender", "username displayName")
            .populate("receiver", "username displayName")
            .sort({ createdAt: -1 });

        const filtered = messages.map(msg => {
            const isSender = msg.sender._id.toString() === userId;
            const deleted = isSender ? msg.isDeletedBySender : msg.isDeletedByReceiver;

            return {
                _id: msg._id,
                fromMe: isSender,
                content: deleted ? "Message deleted" : msg.content,
                sender: msg.sender,
                receiver: msg.receiver,
                createdAt: msg.createdAt
            };
        });

        res.status(200).json(filtered);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};


exports.deleteMessageForUser = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const userId = req.user.userId;
    const deleteType = req.body.type || "me"; 

    if (deleteType === "everyone") {
      
      if (message.sender.toString() !== userId) {
        return res.status(403).json({ error: "Only sender can delete for everyone" });
      }

      message.content = "Message has been deleted";
      message.isDeletedBySender = true;
      message.isDeletedByReceiver = true;

      await message.save();
      return res.status(200).json({ message: "Message deleted for everyone" });
    }

    
    if (message.sender.toString() === userId) {
      message.isDeletedBySender = true;
    } else if (message.receiver.toString() === userId) {
      message.isDeletedByReceiver = true;
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    await message.save();
    res.status(200).json({ message: "Message deleted for you" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
