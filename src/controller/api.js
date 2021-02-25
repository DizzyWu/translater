const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const shell = require('child_process');
module.exports = class extends think.Controller {
  async testAction() {
    const file = this.file('file');
    if (!file) {
      return this.fail('上传文件错误');
    }
    const extName = this.getExtName(file.name);
    if (extName !== '.java') {
      return this.fail('文件格式错误')
    }
    const filePath = await this.uploadFile(file);
    const transferDir = path.dirname(filePath); // 获取文件夹地址
    await this.shell(`javac ${transferDir}/*.java`);
    const transferFile = filePath.replace(extName, '.class');
    this.ctx.download(transferFile);
  }
  // 文件上传
  async uploadFile(upFile) {
    const fileDir = dayjs() + this.randomNum(3);
    const uploadPath = think.ROOT_PATH + '/fs/' + fileDir;
    think.mkdir(uploadPath);
    const filePath = path.join(uploadPath, upFile.name);
    if (upFile && think.isBuffer(upFile.buffer)) {
      fs.writeFileSync(filePath, upFile.buffer);
      if (!think.isFile(filePath)) {
        return {errmsg: '文件写入失败'};
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
              return {errmsg: '文件写入失败'};
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
      return { errmsg: '文件保存失败' };
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
  async shell(cmd) {
    if (cmd) {
      cmd = cmd.split('\n').join(` `);
      think.logger.debug('SHELL: ' + cmd);
      return new Promise((resolve, reject) => {
        shell.exec(cmd, null, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }
    return null;
  }
  // 获取文件后缀
  getExtName(path, extType = '.') {
    if (path) {
      const last = path.lastIndexOf(extType);
      if (last > -1) {
        return path.substring(last);
      }
    }
    return '';
  }
};
