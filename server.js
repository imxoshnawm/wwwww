const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'your-secret-key-here'; // کلیلی نهێنی بۆ JWT

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // فایلی static بۆ پەڕەکان
app.use('/uploads', express.static('uploads')); // فایلی وێنەکان

// پاشەکەوتکردنی فایلەکان
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync('uploads', { recursive: true });
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'پێویستە چوونەژوورەوە بکەیت' });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).json({ error: 'تۆکنەکەت نادروستە' });
  }
};

// Login Route
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === 'id_xoshnawm12') { // وشەی نهێنی ئەدمین
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'وشەی نهێنی هەڵەیە' });
  }
});

// GET All Projects/Reports
app.get('/:type(projects|reports)', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync('database/db.json'));
    res.json(db[req.params.type]);
  } catch (error) {
    res.status(500).json({ error: 'هەڵە لە خوێندنەوەی داتا' });
  }
});

// GET Single Project/Report by ID
app.get('/:type(projects|reports)/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const db = JSON.parse(fs.readFileSync('database/db.json'));
    const item = db[type].find(item => item.id === parseInt(id));
    
    if (!item) {
      return res.status(404).json({ error: 'بەڵگەنامەکە نەدۆزرایەوە' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'هەڵە لە خوێندنەوەی داتا' });
  }
});

// POST Project/Report
app.post('/:type(projects|reports)', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'files', maxCount: 5 }
]), authenticate, (req, res) => {
  try {
    const { type } = req.params;
    const files = req.files;
    const body = req.body;

    const newItem = {
      id: Date.now(),
      title_ku: body.title_ku,
      shortDescription_ku: body.shortDescription_ku,
      description_ku: body.description_ku,
      title_en: body.title_en,
      shortDescription_en: body.shortDescription_en,
      description_en: body.description_en,
      image: files.image?.[0]?.filename,
      video: files.video?.[0]?.filename,
      files: files.files?.map(f => f.filename) || [],
      date: new Date().toISOString()
    };

    const dbPath = path.join(__dirname, 'database/db.json');
    const db = JSON.parse(fs.readFileSync(dbPath));
    db[type].push(newItem);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ error: 'هەڵە لە پاشەکەوتکردن' });
  }
});

// DELETE Project/Report
app.delete('/:type(projects|reports)/:id', authenticate, (req, res) => {
  try {
    const { type, id } = req.params;
    const dbPath = path.join(__dirname, 'database/db.json');
    const db = JSON.parse(fs.readFileSync(dbPath));
    const index = db[type].findIndex(item => item.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'بەڵگەنامەکە نەدۆزرایەوە' });
    }

    db[type].splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'هەڵە لە سڕینەوە' });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'هەڵەی نێوەخۆیی سێرڤەر' });
});

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`سێرڤەر کاردەکات لە پۆرتی ${PORT} 🚀`);
  fs.mkdirSync('uploads', { recursive: true }); // درووستکردنی فۆڵدەری uploads
});