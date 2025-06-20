const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  sendMessage,
  getMessagesBetweenUsers,
  deleteMessageForUser
} = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/:withUserId', protect, getMessagesBetweenUsers);
router.delete('/:id', protect, deleteMessageForUser);

module.exports = router;