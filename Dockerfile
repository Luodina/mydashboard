FROM registry.new.dataos.io/chaizs/auraui-base:latest

COPY Basic/app /prod/app
COPY Basic/server /prod/server
COPY Basic/template /prod/template
COPY Basic/gulpfile.babel.js /prod/gulpfile.babel.js
RUN mv /prod/bower_components /prod/app/bower_components
# RUN npm install -just in case bower.json has been updated recently
COPY Basic/bower.json /prod/app/bower.json
WORKDIR /prod/app
RUN bower install
WORKDIR /prod
# RUN npm install -just in case package.json has been updated recently
COPY Basic/package.json /prod/package.json
RUN npm install
RUN npm install --global gulp-cli 
RUN gulp build
EXPOSE 9000

CMD ["gulp", "serve"]


