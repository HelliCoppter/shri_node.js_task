const path = require('path');

const { imgFolder } = require('../config');
const { writeFile, removeFile } = require('../utils/fs');
const { generateId } = require('../utils/generateId');

module.exports = class Image {
  constructor(id, path, mimetype, size) {
    this.id = id || generateId();
    this.path = path || null;
    this.mimeType = mimetype || null;
    this.size = size || null;
    this.createdAt = Date.now();
  }

  async saveOriginal(content) {
    // await writeFile(path.resolve(imgFolder, this.originalFilename), content);
  }

  async removeOriginal() {
    await removeFile(path.resolve(imgFolder, path));
  }

  toPublicJSON() {
    return {
      id: this.id,
      path: this.path,
      mimetype: this.mimeType,
      size: this.size,
      createdAt: this.createdAt,
    };
  }
};
