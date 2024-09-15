const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

const app = express();
const port = 5000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use('/uploads', express.static(uploadsDir));

app.post('/api/generate-video', upload.fields([{ name: 'image1' }, { name: 'image2' }]), (req, res) => {
  const image1Path = path.normalize(req.files['image1'][0].path);
  const image2Path = path.normalize(req.files['image2'][0].path);
  const outputVideoPath = path.join(uploadsDir, `${Date.now()}_interpolation_video.avi`);

  console.log(`Image 1 Path: ${image1Path}`);
  console.log(`Image 2 Path: ${image2Path}`);
  console.log(`Output Video Path: ${outputVideoPath}`);

  const command = `python generate_video.py ${image1Path.replace(/\\/g, '/')} ${image2Path.replace(/\\/g, '/')} ${outputVideoPath.replace(/\\/g, '/')}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error creating video' });
    }
    console.log(`stdout: ${stdout}`);
    res.json({ videoUrl: `http://localhost:${port}/uploads/${path.basename(outputVideoPath)}` });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
