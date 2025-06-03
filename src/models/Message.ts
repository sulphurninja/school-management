import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  senderId: { type: String, required: true }, // Can be Student, Teacher, or Admin ID
  recipientId: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  attachments: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  parentMessageId: { type: Number, ref: 'Message' }, // For replies
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
