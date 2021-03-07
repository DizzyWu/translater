FROM mhart/alpine-node

ENV JAVA_HOME /usr/java/jdk
ENV PATH ${PATH}:${JAVA_HOME}/bin

WORKDIR /java
COPY package.json /java/package.json
RUN npm i --production --registry=https://registry.npm.taobao.org

COPY production.js /java/production.js
COPY src /java/src

ENV DOCKER=true
EXPOSE 8360
CMD ["node", "/java/production.js"]
