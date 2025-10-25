const express = require('express');
const Section = require('../models/Section');
const File = require('../models/File');
const News = require('../models/News');
const KnowledgeBase = require('../models/KnowledgeBase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all sections
router.get('/sections', authMiddleware, async (req, res) => {
  try {
    const sections = await Section.find();
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get files for a specific section
router.get('/files/:sectionId', authMiddleware, async (req, res) => {
  try {
    const files = await File.find({ section: req.params.sectionId }).populate('section');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all news
router.get('/news', authMiddleware, async (req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search knowledge base
router.post('/assistant/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const results = await KnowledgeBase.find({
      $or: [
        { question: { $regex: query, $options: 'i' } },
        { answer: { $regex: query, $options: 'i' } },
      ],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

