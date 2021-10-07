const { dbDumpFile } = require('./routes');
const path = require('path');
const fs = require('fs');
const util = require('util');

const writeFileAsync = util.promisify(fs.writeFile);

class Storage {
  constructor() {
    this.db = {};
  }

  initFromDump() {
    if (fs.existsSync(dbDumpFile) === false) {
      return;
    }

    const dump = require(dbDumpFile);

    if (typeof dump === 'object') {
      for (const [key, value] of Object.entries(dump)) {
        this.db[key] = value;
      }
    }
  }

  insert(id ,obj) {
    this.db[id] = obj;
    this._save(this.db);
    return
  }

  delete(id) {
    if (this.db[id]) {
      const path = this.db[id].path;
      delete this.db[id];
      this._save(this.db);
    } else {
      return 'nothing to delete'
    }
  }

  _save = async (content = {}) => {
    await writeFileAsync(path.resolve(dbDumpFile), JSON.stringify(content, null, '\t'));
  }

  _read = async (file) => {
    await fs.readFile(dbDumpFile, 'utf-8');
  }
}

const dataBase = new Storage();
dataBase.initFromDump();

module.exports = dataBase;