const express = require('express');
const fs = require('fs');
const { PORT, imgFolder } = require('./config');
const db = require('./entities/Database');
const Img = require('./entities/Image');
const multer = require('multer');
const path = require('path');
const app = express();
const { replaceBackground } = require('backrem');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || 
    file.mimetype === "image/jpg"|| 
    file.mimetype === "image/jpeg") {
      cb(null, true);
  }
  else {
      cb(null, false);
  }
};

app.use(express.json());
app.use(multer({dest: imgFolder, fileFilter: fileFilter}).single("image"));
app.use('/files', express.static(imgFolder));

app.get('/list', (req, res) => {
  try {
    const allImages = db.find().map((image) => image.toPublicJSON());
  
    return res.send({ allImages });
  } catch (err) {
    res.status(404).send(err);
  }
});

app.get('/image/:id', async (req, res) => {
  try {
    const imgId = req.params.id;
    const image = db.findOne(imgId);
    // const file = fs.createReadStream(path.resolve(image.path));

    // return res.json(db.findOne(imgId).toPublicJSON());
    res.sendFile(path.resolve(image.path));
  } catch (err) {
    res.status(404).send(err);
  }
});

app.get('/merge', async (req, res) => {
  try {
    const { front, back, color, threshold } = req.query;
    const frontID = db.findOne(front);
    const backID = db.findOne(back);
    const frontImg = fs.createReadStream(path.resolve(frontID.path));
    const backImg = fs.createReadStream(path.resolve(backID.path));
    
    // await replaceBackground(frontImg, backImg, color.split(','), threshold).then((readableStream) => readableStream.pipe(res));
    // fs.writeFile(path.resolve(`${imgFolder}/result/result.jpeg`, res));
    // return res.json();

    const picture = await replaceBackground(frontImg, backImg, color.split(','), threshold);
    res.header('Content-Type', frontImg.mimeType);
    picture.pipe(res);

  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/upload', async (req, res) => {
  try {
    const file = await req.file;
    const img = new Img(file.filename, file.path, file.mimetype, file.size);

    db.insert(img);

    return res.json(img.toPublicJSON());
  } catch (err) {
    return res.status(500).send(err);
  }
});


app.delete('/image/:id', async (req, res) => {
  try {
    const imgId = req.params.id;
  
    const id = await db.remove(imgId);
  
    return res.json({ id });
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
