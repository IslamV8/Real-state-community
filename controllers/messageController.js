const Message = require("../models/Message");
const User    = require("../models/User");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    const rec = await User.findById(receiverId);
    if (!rec) return res.status(404).json({ error: "Receiver not found" });

    const msg = await new Message({
      sender:   req.user.userId,
      receiver: receiverId,
      content
    }).save();
    res.status(201).json(msg);
  } catch (err) {
    console.error("🚨 sendMessage Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const otherId = req.params.withUserId || req.query.with;
    
    const msgs = await Message.find({
      $or: [
        { sender: req.user.userId,   receiver: otherId },
        { sender: otherId,           receiver: req.user.userId }
      ]
    })
    .sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteMessageForUser = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    
    if (
      req.user.userId !== msg.sender.toString() &&
      req.user.userId !== msg.receiver.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    
    if (req.user.userId === msg.sender.toString()) {
      msg.deletedBySender = true;
    }
    if (req.user.userId === msg.receiver.toString()) {
      msg.deletedByReceiver = true;
    }
    await msg.save();
    res.json({ message: "Message deletion recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};