'use strict';

require('dotenv').config();

let should = require('should'),
  CurrentsAPI = require('../dist/index');

if (!process.env.API_KEY) throw new Error('No API Key specified. Please create an environment variable named API_KEY');
let currentsAPI = new CurrentsAPI(process.env.API_KEY);

describe('CurrentsAPI', function () {
  describe('v1', function () {
    describe('Latest News', function () {
      it('should return "ok" and a list of sources', function (done) {
        currentsAPI.latestNews().then(res => {
          res.status.should.equal('ok');
          should.exist(res.news);
          done();
        }).catch(done);
      });
  
      it('should return "ok" and a list of sources using a callback', function (done) {
        currentsAPI.latestNews((err, res) => {
          if (err) {
            return done(err);
          }
          res.status.should.equal('ok');
          should.exist(res.news);
          done();
        });
      });

      it('should have news article with title and published date', function (done) {
        currentsAPI.latestNews((err, res) => {
          if (err) {
            return done(err);
          }
          res.status.should.equal('ok');
          should(res.news[0]).have.property('title');
          should(res.news[0]).have.property('published');
          should(res.news[0]).have.property('description');
          should(res.news[0]).have.property('image');
          done();
        });
      });
    });

    describe('Search News', function () {
        it('should return "ok" and with list of news', function (done) {
            currentsAPI.search().then(res => {
            res.status.should.equal('ok');
            should.exist(res.news);
            done();
          }).catch(done);
        });
    
        it('should return "ok" and a list of sources using a callback', function (done) {
            currentsAPI.search((err, res) => {
            if (err) {
              return done(err);
            }
            res.status.should.equal('ok');
            should.exist(res.news);
            done();
          });
        });
  
        it('should have news article with title and published date', function (done) {
            currentsAPI.search({}, (err, res) => {
            if (err) {
              return done(err);
            }
            res.status.should.equal('ok');
            should.exist(res.news[0].title);
            should.exist(res.news[0].published);
            should.exist(res.news[0].description);
            done();
          });
        });

        it('should news return with Trump name', function (done) {
            currentsAPI.search({keywords: "Trump"}, (err, res) => {
            if (err) {
              return done(err);
            }
            res.status.should.equal('ok');
            should(res.news[0].title.toLowerCase().includes('trump')).be.exactly(true);
            done();
          });
        });

        it('should news return about politics', function (done) {
          currentsAPI.search({category: "politics"}, (err, res) => {
          if (err) {
            return done(err);
          }
          res.status.should.equal('ok');
          should(res.news[0].category.includes('politics')).be.exactly(true);
          done();
        });
      });

    });
  });
});
