const { EventEmitter } = require('events');
const { existsSync } = require('fs');
const { dbDumpFile } = require('../config');
const { writeFile, removeFile } = require('../utils/fs');
const { prettifyJsonToString } = require('../utils/prettifyJsonToString');
const Image = require('./Image');

class Database extends EventEmitter {
  constructor() {
    super();

    this.idImage = {};
  }

  initFromDump() {
    if (existsSync(dbDumpFile) === false) {
      return;
    }

    const dump = require(dbDumpFile);

    if (typeof dump.idImage === 'object') {
      this.idImage = {};

      for (let id in dump.idImage) {
        const img = dump.idImage[id];

        this.idImage[id] = new Image(img.id, img.path, img.mimeType, img.size, img.createdAt);
      }
    }

  }

  insert(img) {
    this.idImage[img.id] = img;
    this.emit('changed');
  }

  remove(idImg) {
    if (this.idImage[idImg]) {
      const path = this.idImage[idImg].path;
      delete this.idImage[idImg];
      removeFile(path)
      this.emit('changed');
      return idImg;
      
    } else {
      return 'nothing to delete'
    }
  }

  findOne(id) {
    const imgRaw = this.idImage[id];

    if (!imgRaw) {
      return null;
    } else return imgRaw

    // const img = new Image(imgRaw.id, imgRaw.createdAt);

    // return img;
  }

  find() {
    let allImages = Object.values(this.idImage);

    allImages.sort((a, b) => b.createdAt - a.createdAt);

    return allImages;
  }

  toJSON() {
    return {
      idImage: this.idImage,
    };
  }
}

const db = new Database();

db.initFromDump();

db.on('changed', () => {
  writeFile(dbDumpFile, prettifyJsonToString(db.toJSON()));
});

module.exports = db;
