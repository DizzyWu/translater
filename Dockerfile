FROM ubuntu
RUN sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list \
 && sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && apt-get update --fix-missing -o Acquire::http::No-Cache=True \
 && apt-get -y install default-jdk \
 && apt-get install -y nodejs \
 && apt-get install -y npm

ENV JAVA_HOME="/home/softwares/jdk"
ENV PATH="${PATH}:${JAVA_HOME}/bin:${JAVA_HOME}/sbin"

WORKDIR /java
COPY package.json /java/package.json
RUN npm i --production

COPY src /java/src
COPY production.js /java/production.js

ENV DOCKER=true
EXPOSE 8360
CMD ["node", "/java/production.js"]
