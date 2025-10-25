const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Section = require('../models/Section');
const File = require('../models/File');
const News = require('../models/News');
const KnowledgeBase = require('../models/KnowledgeBase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ========== SECTION MANAGEMENT ==========

// Get all sections
router.get('/sections', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const sections = await Section.find();
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new section
router.post('/sections', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name || !icon) {
      return res.status(400).json({ message: 'Name and icon are required' });
    }

    const section = new Section({ name, icon, description });
    await section.save();

    // Emit real-time update to all connected clients
    const io = require('../..').app.locals.io;
    io.emit('section-added', section);

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete section
router.delete('/sections/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('section-deleted', req.params.id);

    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== STUDENT MANAGEMENT ==========

// Get all students
router.get('/students', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new student
router.post('/students', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { fullName, universityId, password } = req.body;

    if (!fullName || !universityId || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ universityId });
    if (existingUser) {
      return res.status(400).json({ message: 'University ID already exists' });
    }

    const user = new User({
      fullName,
      universityId,
      password,
      role: 'student',
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      universityId: user.universityId,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete student
router.delete('/students/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FILE MANAGEMENT ==========

// Get all files
router.get('/files', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const files = await File.find().populate('section');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload file
router.post('/files', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { fileName, section } = req.body;

    if (!fileName || !section || !req.file) {
      return res.status(400).json({ message: 'File name, section, and file are required' });
    }

    const file = new File({
      fileName,
      section,
      filePath: req.file.path,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
    });

    await file.save();
    await file.populate('section');

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('file-uploaded', file);

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete file
router.delete('/files/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('file-deleted', req.params.id);

    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== NEWS AND ANNOUNCEMENTS ==========

// Get all news
router.get('/news', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Publish news
router.post('/news', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const news = new News({ title, content });
    await news.save();

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('news-published', news);

    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete news
router.delete('/news/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('news-deleted', req.params.id);

    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== HMAS ASSISTANT (KNOWLEDGE BASE) ==========

// Get all knowledge base entries
router.get('/knowledge-base', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const entries = await KnowledgeBase.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add knowledge base entry
router.post('/knowledge-base', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const entry = new KnowledgeBase({ question, answer });
    await entry.save();

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('knowledge-added', entry);

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete knowledge base entry
router.delete('/knowledge-base/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const entry = await KnowledgeBase.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Knowledge base entry not found' });
    }

    // Emit real-time update
    const io = require('../..').app.locals.io;
    io.emit('knowledge-deleted', req.params.id);

    res.json({ message: 'Knowledge base entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

