module.exports = class extends think.Controller {
  async translateAction() {
    const file = this.file('file');
    if (!file) {
      return this.fail('上传文件错误');
    }
    const java = think.service('java', file, this.post('release'), this.post('options'))
    const res = await java.translateSingle().catch(err => {
      return think.isError(err) ? err : new Error(err)
    });
    if (think.isError(res)) {
      return this.fail(1000, res.message, JSON.parse(java.options));
    } else if (think.isObject(res) || !think.isFile(res.toString())) {
      return this.fail(res);
    }
    this.ctx.download(res);
  }
};
