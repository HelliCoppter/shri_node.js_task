const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { replaceBackground } = require('backrem');
const { PORT, imgFolder } = require('./modules/routes');
const dataBase = require('./modules/Database');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpg"|| 
    file.mimetype === "image/jpeg") {
      cb(null, true);
  }
  else {
      cb(null, false);
  }
};

const app = express();
app.use(multer({dest: imgFolder, fileFilter: fileFilter}).single("image"));

app.get("/list", (req, res) => {
  res.json(
    Object.values(dataBase.db).map((item) => ({ id: item.id, createdAt: item.createdAt, size: item.size, }))
  );
});

app.get("/image/:id", (req, res) => {
  try {
    const id = req.params.id;
    res.setHeader("Content-Type", dataBase.db[id].mimetype);
    const image = fs.createReadStream(path.resolve(__dirname, dataBase.db[id].path));
    image.pipe(res);
  } catch (err) {
    res.status(404).send();
  }
});

app.post("/upload", async (req, res) => {
  try {
    const id = req.file.filename;
    await dataBase.insert(id,{ id, createdAt: Date.now(), ...req.file });
    return res.send(id);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/image/:id", (req, res) => {
  const id = req.params.id;
  try {
    fs.unlink(path.resolve(dataBase.db[id].path), (err) => {
      if (err) {
      } else {
        dataBase.delete(id);
        res.status(200).send(id);
      }
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

app.get("/merge", (req, res) => {
  try {
    const { front, back, color, threshold } = req.query;
    const frontID = dataBase.db[front];
    const backID = dataBase.db[back];
    const frontImg = fs.createReadStream(path.resolve(frontID.path));
    const backImg = fs.createReadStream(path.resolve(backID.path));

    if (!(front && back)) {
      return res.status(404).send('image not found');
    }

    let colorArr;
    // console.log(color);
    try {
      colorArr = color.split(',').map((item) => parseInt(item, 16));
    } catch {
      return res.status(400).send("invalid color");
    }

    res.header('Content-Type', "image/jpeg");
    replaceBackground(frontImg, backImg, colorArr, threshold).then((readableStream) => readableStream.pipe(res));
    
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});