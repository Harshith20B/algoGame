const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const gameScoreSchema = new mongoose.Schema({
  score: Number,
  timeSpent: Number,
  completionDate: { type: Date, default: Date.now },
  attempts: { type: Number, default: 1 }
});

const algorithmProgressSchema = new mongoose.Schema({
  heapSort: gameScoreSchema,
  nQueens: gameScoreSchema,
  tsp: gameScoreSchema,
  fibonacci: gameScoreSchema,
  factorial: gameScoreSchema,
  towerOfHanoi: gameScoreSchema,
  bubbleSort: gameScoreSchema,
  quickSort: gameScoreSchema,
  mergeSort: gameScoreSchema,
  knapsack: gameScoreSchema,
  dijkstra: gameScoreSchema
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
        validator: function(v) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  algorithmProgress: {
    type: algorithmProgressSchema,
    default: {}
  },
  totalScore: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to validate password
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
