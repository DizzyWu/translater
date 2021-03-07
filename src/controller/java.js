module.exports = class extends think.Controller {
  async translateAction() {
    const file = this.file('file');
    if (!file) {
      return this.fail('上传文件错误');
    }
    const java = think.service('java', file, this.post('release'), this.post('options'));
    return java.downloadExecFile(this);
  }
};
