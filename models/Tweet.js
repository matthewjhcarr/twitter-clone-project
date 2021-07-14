const mongoose = require('mongoose')

const TweetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    }
  ],
  repliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tweet'
  },
  replies: [
    {
      reply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tweet'
      }
    }
  ],
  datePosted: {
    type: Date,
    default: Date.now
  },
  dateUpdated: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('tweet', TweetSchema)
