'use strict';

const debug = require('debug')('http:storage');
const createError = require('http-errors');
const Toy = require('../model/toy');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});

const storage = module.exports = {};

storage.create = function(item) {
  debug('#create');

  return new Promise((resolve, reject) => {
    if(!item.name) return reject(createError(400,'cannot create; name required'));
    if(!item.desc) return reject(createError(400,'cannot create; desc required'));

    let toy = new Toy(item.name, item.desc);

    return fs.writeFileProm(`${__dirname}/../data/toy/${toy._id}.json`, JSON.stringify(toy))
      .then(() => resolve(toy))
      .catch(reject);
  });

};

storage.fetchOne = function(itemId) {
  debug('#fetchOne');
  return new Promise((resolve, reject) => {
    if(!itemId) return reject(createError(400, 'cannot get item; itemId required'));

    return fs.readFileProm(`${__dirname}/../data/toy/${itemId}.json`)
      .then(buff => {
        try {
          let toy = JSON.parse(buff.toString());
          return resolve(toy);
        } catch(e) {
          return reject(e);
        }
      })
      .catch(reject);
  });
};

storage.fetchAll = function() {
  debug('#fetchAll');
  return new Promise((resolve, reject) => {
    fs.readdirProm(`${__dirname}/../data/toy/`)
      .then(files => {
        let data = [];
        files.forEach(id => {
          let _id = id.split('.')[0].toString();
          data.push(_id);
        });
        return resolve(data);
      })
      .catch(reject);
  });
};

storage.update = function(itemId, item) {
  debug('#update');

  return new Promise((resolve, reject) => {
    if(!itemId) return reject(createError(400, 'cannot update; itemId required'));
    if(!item) return reject(createError(400, 'cannot update; item required'));
    if(item._id !== itemId) return reject(createError(400, 'cannot update; item ids do not match'));

    return fs.writeFileProm(`${__dirname}/../data/toy/${itemId}.json`, JSON.stringify(item))
      .then(resolve)
      .catch(reject);
  });
};

storage.destroy = function(itemId) {
  debug('#destroy');
  return new Promise((resolve, reject) => {
    // if(!schema) return reject(new Error('cannot delete item; schema required'));
    if(!itemId) return reject(new Error('cannot delete item; itemId required'));

    return fs.unlinkProm(`${__dirname}/../data/toy/${itemId}.json`)
      .then(resolve)
      .catch(reject);
  });
};
