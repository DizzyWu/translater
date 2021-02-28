FROM ubuntu:20.04
RUN  sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN  sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN  apt-get clean
RUN rm -rf /var/lib/apt/lists/* \
  && apt-get update --fix-missing -o Acquire::http::No-Cache=True
  && apt-get -y install openjdk && apt-get install -y nodejs npm && ln -s /usr/bin/nodejs /usr/bin/node

WORKDIR /java
COPY package.json /java/package.json
RUN npm i --production -- registry=https://registry.npm.taobao.org

COPY src /java/src
COPY production.js /java/production.js

ENV DOCKER=true
EXPOSE 8360
CMD ["node", "/java/production.js"]
