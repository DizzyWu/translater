const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const shell = require('child_process');
module.exports = class extends think.Service {
  constructor(file, release, options) {
    super();
    this.file = file;
    this.release = release;
    this.options = options;
  }
  // 编译单一文件
  async translateSingle () {
    const extName = this.getExtName();
    if (extName !== '.java') {
      return this.fail('文件格式错误')
    }
    const res = await this.uploadFile();
    if (!think.isFile(res)) {
      return this.fail(res);
    }
    try {
      const options = this.options ? JSON.parse(this.options) : {}
      let optionsShell = '';
      for (const key in options) {
        optionsShell += ` ${key} ${options[key]}`;
      }
      await this.shell(`javac --release ${this.release}${optionsShell} ${res}`);
    } catch (e) {
      return this.fail(e);
    }
    return res.replace(extName, '.class');
  }
  // 文件上传
  async uploadFile() {
    const upFile = this.file;
    const fileDir = dayjs() + this.randomNum(3);
    const uploadPath = think.ROOT_PATH + '/fs/' + fileDir;
    think.mkdir(uploadPath);
    const filePath = path.join(uploadPath, upFile.name);
    if (upFile && think.isBuffer(upFile.buffer)) {
      fs.writeFileSync(filePath, upFile.buffer);
      if (!think.isFile(filePath)) {
        return '文件写入失败';
      }
      upFile.size = upFile.buffer.length;
      upFile.path = filePath;
    }
    const upFilePath = upFile.path;
    let url = '';
    if (think.isFile(upFilePath)) {
      try {
        fs.renameSync(upFilePath, filePath);
      } catch (e) {
        try {
          if (think.isFile(filePath)) {
            fs.unlinkSync(filePath);
          }
          fs.createReadStream(upFilePath).pipe(fs.createWriteStream(filePath)).on('finish', () => {
            if (!think.isFile(filePath)) {
              return '文件写入失败';
            }
          });
        } catch (e) {
          think.logger.error(e);
        }
      }
    }
    if (think.isFile(filePath)) {
      url = filePath;
    } else {
      return '文件保存失败';
    }
    return url;
  }
  // 随机N位数
  randomNum(len, toInt = true) {
    let rnd = '';
    for (let i = 0; i < len; i++) {
      rnd += Math.floor(Math.random() * 10);
    }
    return toInt ? parseInt(rnd) : rnd;
  }
  // 执行命令行指令
  async shell(cmd, options) {
    if (cmd) {
      cmd = cmd.split('\n').join(` `);
      think.logger.debug('SHELL: ' + cmd);
      return new Promise((resolve, reject) => {
        shell.exec(cmd, options, (err, stdout, stderr) => {
          if (stderr) {
            return reject(stderr.split('\n')[0].split(':')[1].trim())
          }
          resolve(stdout)
        });
      });
    }
    return null;
  }
  // 获取文件后缀
  getExtName() {
    const path = this.file.name;
    if (path) {
      const last = path.lastIndexOf('.');
      if (last > -1) {
        return path.substring(last);
      }
    }
    return '';
  }
  // 错误信息
  fail(msg) {
    return {
      errno: 1000,
      errmsg: msg,
      data: this.options ? JSON.parse(this.options) : null
    };
  }
};
