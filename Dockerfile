FROM mhart/alpine-node

ENV JAVA_HOME="/home/softwares/jdk"
ENV PATH="${PATH}:${JAVA_HOME}/bin:${JAVA_HOME}/sbin"

WORKDIR /java
COPY package.json /java/
RUN npm i --production --registry=https://registry.npm.taobao.org
COPY production.js /java/
COPY src /java/
ENV DOCKER=true
EXPOSE 8360
CMD ["node", "/java/production.js"]
