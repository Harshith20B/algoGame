const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update game score
router.post('/score/:algorithm', auth, async (req, res) => {
  try {
    const { score, timeSpent } = req.body;
    const { algorithm } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize algorithm progress if it doesn't exist
    if (!user.algorithmProgress[algorithm]) {
      user.algorithmProgress[algorithm] = {
        score: 0,
        timeSpent: 0,
        attempts: 0
      };
    }

    // Update only if new score is better
    const currentProgress = user.algorithmProgress[algorithm];
    if (!currentProgress.score || score > currentProgress.score) {
      currentProgress.score = score;
      currentProgress.timeSpent = timeSpent;
      currentProgress.completionDate = new Date();
    }
    currentProgress.attempts += 1;

    // Update total score (sum of best scores from each algorithm)
    user.totalScore = Object.values(user.algorithmProgress).reduce(
      (total, algo) => total + (algo.score || 0),
      0
    );

    await user.save();

    // Update ranks for all users
    await User.find({})
      .sort('-totalScore')
      .exec()
      .then(async (users) => {
        const updates = users.map((user, index) => ({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { rank: index + 1 } }
          }
        }));
        await User.bulkWrite(updates);
      });

    res.json({
      algorithmProgress: user.algorithmProgress[algorithm],
      totalScore: user.totalScore,
      rank: user.rank
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating score' });
  }
});

// Get leaderboard
router.get('/leaderboard/:algorithm?', async (req, res) => {
  try {
    const { algorithm } = req.params;
    let query = {};
    let sort = {};

    if (algorithm) {
      sort[`algorithmProgress.${algorithm}.score`] = -1;
    } else {
      sort = { totalScore: -1 };
    }

    const leaderboard = await User.find(query)
      .select('username totalScore rank algorithmProgress')
      .sort(sort)
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

module.exports = router;