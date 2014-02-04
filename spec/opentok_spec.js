/*global require, describe, it, expect, waitsFor, runs, Buffer, jasmine */
/*jshint strict:false */
var OpenTok = require('../lib/opentok'),
    nock    = require('nock');

describe('error checking', function() {
  var apiKey, apiSecret, opentok;
  apiKey = '14971292';
  apiSecret = 'ecbe2b25afec7887bd72fe4763b87add8ce02658';
  opentok = new OpenTok.OpenTokSDK(apiKey, apiSecret);
  it('should throw error without valid sessionId', function() {
    expect(function() {
      opentok.generateToken({
        sessionId: '1234'
      });
    }).toThrow(new Error('An invalid session ID was passed'));
  });
  it('should throw error without valid sessionId', function() {
    expect(function() {
      opentok.generateToken({});
    }).toThrow(new Error('Null or empty session ID is not valid'));
  });
  it('should throw error without a valid api key', function() {
    expect(function() {
      opentok.generateToken({
        sessionId: '1_MX4xNdkJustTestingToSee-IfFakeAPIKeyWillThrowError-'
      });
    }).toThrow(new Error('An invalid session ID was passed'));
  });
});

describe('Production Environment', function() {
  var apiKey, apiSecret, opentok;
  apiKey = '14971292';
  apiSecret = 'ecbe2b25afec7887bd72fe4763b87add8ce02658';
  opentok = new OpenTok.OpenTokSDK(apiKey, apiSecret);
  it('should auto set api_url defaults', function() {
    opentok = new OpenTok.OpenTokSDK(apiKey, apiSecret);
    expect(opentok.partnerId).toEqual(apiKey);
    expect(opentok.partnerSecret).toEqual(apiSecret);
    expect(opentok.api_url).toEqual('api.opentok.com');
  });
  it('should create session', function() {
    var queryFinished, sessionId;
    sessionId = null;
    queryFinished = false;
    waitsFor(function() {
      return queryFinished;
    });
    runs(function() {
      expect(sessionId).not.toBeNull();
      expect(sessionId.length).toBeGreaterThan(5);
    });
    opentok.createSession(function(err, result) {
      sessionId = result;
      queryFinished = true;
    });
  });
  it('should create session with IP specified only', function() {
    var queryFinished, sessionId;
    sessionId = null;
    queryFinished = false;
    waitsFor(function() {
      return queryFinished;
    });
    runs(function() {
      expect(sessionId).not.toBeNull();
      expect(sessionId.length).toBeGreaterThan(5);
    });
    opentok.createSession('localhost', function(err, result) {
      sessionId = result;
      queryFinished = true;
    });
  });
  it('should create session with p2p enabled only', function() {
    var queryFinished, sessionId;
    sessionId = null;
    queryFinished = false;
    waitsFor(function() {
      return queryFinished;
    });
    runs(function() {
      expect(sessionId).not.toBeNull();
      expect(sessionId.length).toBeGreaterThan(5);
    });
    opentok.createSession({
      'p2p.preference': 'enabled'
    }, function(err, result) {
      sessionId = result;
      queryFinished = true;
    });
  });
  it('should create session with ip and p2p enabled', function() {
    var queryFinished, sessionId;
    sessionId = null;
    queryFinished = false;
    waitsFor(function() {
      return queryFinished;
    });
    runs(function() {
      expect(sessionId).not.toBeNull();
      expect(sessionId.length).toBeGreaterThan(5);
    });
    opentok.createSession('localhost', {
      'p2p.preference': 'enabled'
    }, function(err, result) {
      sessionId = result;
      queryFinished = true;
    });
  });
  describe('Generating Tokens', function() {
    var sessionId;
    sessionId = '1_MX4xNDk3MTI5Mn5-MjAxMi0wNS0xNiAyMzoyMjozNC44NzQ0ODcrMDA6MDB-MC41MDI4NTI2OTA1MzR-';
    it('should generate a valid input given sessionId', function() {
      var token;
      token = opentok.generateToken({
        sessionId: sessionId
      });
      expect(token).not.toBeNull();
      expect(token.length).toBeGreaterThan(5);
    });
    it('should generate token containing input Data', function() {
      var token, tokenBuffer;
      token = opentok.generateToken({
        sessionId: sessionId,
        role: OpenTok.RoleConstants.PUBLISHER,
        connection_data: 'hello'
      });
      token = token.substr(4, token.length);
      tokenBuffer = new Buffer(token, 'base64').toString('ascii');
      expect(tokenBuffer.split(OpenTok.RoleConstants.PUBLISHER).length).toBeGreaterThan(1);
      expect(tokenBuffer.split('hello').length).toBeGreaterThan(1);
      expect(tokenBuffer.split(sessionId).length).toBeGreaterThan(1);
    });
  });
});

describe('Archiving', function() {
  var opentok = new OpenTok.OpenTokSDK('APIKEY', 'APISECRET');

  describe('startArchive', function() {
    var session = '1_MX4xMDB-MTI3LjAuMC4xflR1ZSBKYW4gMjggMTU6NDg6NDAgUFNUIDIwMTR-MC43NjAyOTYyfg';

    it('should return an Archive', function(done) {
      // nock.recorder.rec();

      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive', {'action':'start','sessionId':'1_MX4xMDB-MTI3LjAuMC4xflR1ZSBKYW4gMjggMTU6NDg6NDAgUFNUIDIwMTR-MC43NjAyOTYyfg','name':'Bob'})
        .reply(200, '{\n  \"createdAt\" : 1391149936527,\n  \"duration\" : 0,\n  \"id\" : \"4072fe0f-d499-4f2f-8237-64f5a9d936f5\",\n  \"name\" : \"Bob\",\n  \"partnerId\" : \"APIKEY\",\n  \"reason\" : \"\",\n  \"sessionId\" : \"1_MX4xMDB-MTI3LjAuMC4xflR1ZSBKYW4gMjggMTU6NDg6NDAgUFNUIDIwMTR-MC43NjAyOTYyfg\",\n  \"size\" : 0,\n  \"status\" : \"started\",\n  \"url\" : null\n}', { server: 'nginx',
        date: 'Fri, 31 Jan 2014 06:32:16 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.startArchive(session, { name: 'Bob' }, function(err, archive) {
        expect(err).toBeNull();
        expect(archive).not.toBeNull();
        if(archive) {
          expect(archive.name).toBe('Bob');
          expect(archive.status).toBe('started');
          expect(archive.stop).not.toBeNull();
          expect(archive.delete).not.toBeNull();
        }
        done();
      });

    });

    it('should return an error if session is null', function(done) {
      opentok.startArchive(null, {}, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('No session ID given');
        done();
      });
    });

    it('should return an error if session ID is invalid', function(done) {

      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive', {'action':'start','sessionId':'invalidSessionIDIam'})
        .reply(404, '{ \"message\" : \"responseString\" }', { server: 'nginx',
        date: 'Fri, 31 Jan 2014 06:37:25 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.startArchive('invalidSessionIDIam', {}, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Session not found');
        done();
      });

    });

    it('should return an error if session is p2p or has no connections', function(done) {

      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive', {'action':'start','sessionId':'1_MX4xMDB-MTI3LjAuMC4xflR1ZSBKYW4gMjggMTU6NDg6NDAgUFNUIDIwMTR-MC43NjAyOTYyfg'})
        .reply(404, '{ \"message\" : \"responseString\" }', { server: 'nginx',
        date: 'Fri, 31 Jan 2014 06:46:22 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.startArchive(session, {}, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Session not found');
        done();
      });

    });

    it('should return an error if any other HTTP status is returned', function(done) {

      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive', {'action':'start','sessionId':'1_MX4xMDB-MTI3LjAuMC4xflR1ZSBKYW4gMjggMTU6NDg6NDAgUFNUIDIwMTR-MC43NjAyOTYyfg'})
        .reply(500, '{ \"message\" : \"responseString\" }', { server: 'nginx',
        date: 'Fri, 31 Jan 2014 06:46:22 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.startArchive(session, {}, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Unexpected response from OpenTok');
        done();
      });

    });

  });

  describe('getArchive', function() {
    var archiveID = 'd4c27726-d965-4456-8b07-0cca1a4f4802';

    it('should return an archive', function(done) {
      nock('https://api.opentok.com:443')
        .get('/v2/partner/APIKEY/archive/d4c27726-d965-4456-8b07-0cca1a4f4802')
        .reply(200, '{\n  \"createdAt\" : 1389986091000,\n  \"duration\" : 300,\n  \"id\" : \"d4c27726-d965-4456-8b07-0cca1a4f4802\",\n  \"name\" : \"Bob\",\n  \"partnerId\" : \"APIKEY\",\n  \"reason\" : \"\",\n  \"sessionId\" : \"1_MX4xMDB-fkZyaSBKYW4gMTcgMTE6MTQ6NTAgUFNUIDIwMTR-MC4xNTM4NDExNH4\",\n  \"size\" : 331266,\n  \"status\" : \"available\",\n  \"url\" : \"http://tokbox.com.archive2.s3.amazonaws.com/APIKEY%2Fd4c27726-d965-4456-8b07-0cca1a4f4802%2Farchive.mp4?Expires=1391151552&AWSAccessKeyId=AKIAI6LQCPIXYVWCQV6Q&Signature=IiFhiMDUyvP6Q6EChXioePxvp6g%3D\"\n}', { server: 'nginx',
        date: 'Fri, 31 Jan 2014 06:49:12 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.getArchive(archiveID, function(err, archive) {
        expect(err).toBeNull();
        expect(archive).not.toBeNull();
        if(archive) {
          expect(archive.name).toBe('Bob');
          expect(archive.status).toBe('available');
          expect(archive.stop).not.toBeNull();
          expect(archive.delete).not.toBeNull();
        }
        done();
      });

    });

    it('should return an error if archive ID is null', function(done) {

      opentok.getArchive(null, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('No archive ID given');
        done();
      });

    });

    it('should return an error if archive ID is invalid', function(done) {

      nock('https://api.opentok.com:443')
        .get('/v2/partner/APIKEY/archive/01614A9B-6BB3-4691-846E-F8A59555AD21')
        .reply(404, '{ \"message\" : \"null\" }', { server: 'nginx',
        date: 'Mon, 03 Feb 2014 23:30:54 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.getArchive('01614A9B-6BB3-4691-846E-F8A59555AD21', function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Archive not found');
        done();
      });

    });

    it('should return an error if any other HTTP status is returned', function(done) {
      // nock.recorder.rec();

      nock('https://api.opentok.com:443')
        .get('/v2/partner/APIKEY/archive/01614A9B-6BB3-4691-846E-F8A59555AD21')
        .reply(500, '{ \"message\" : \"Something went wrong\" }', { server: 'nginx',
        date: 'Mon, 03 Feb 2014 23:30:54 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.getArchive('01614A9B-6BB3-4691-846E-F8A59555AD21', function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Unexpected response from OpenTok');
        done();
      });

    });

  });

  describe('listArchives', function() {

    it('should return an array of archives and a total count', function(done) {

      nock('https://api.opentok.com:443')
        .get('/v2/partner/APIKEY/archive?count=5')
        .reply(200, '{\n  "count" : 149,\n  "items" : [ {\n    "createdAt" : 1391457926000,\n    "duration" : 3,\n    "id" : "16231874-7ce7-4f5e-a30a-4513c4df480d",\n    "name" : "",\n    "partnerId" : "APIKEY",\n    "reason" : "",\n    "sessionId" : "SESSION_ID",\n    "size" : 6590,\n    "status" : "available",\n    "url" : "http://some/video1.mp4"\n  }, {\n    "createdAt" : 1391218315000,\n    "duration" : 0,\n    "id" : "0931d1d7-4198-4db2-bf8a-097924421eb2",\n    "name" : "Archive 3",\n    "partnerId" : "APIKEY",\n    "reason" : "",\n    "sessionId" : "SESSION_ID",\n    "size" : 3150,\n    "status" : "available",\n    "url" : "http://some/video2.mp4"\n  }, {\n    "createdAt" : 1391218274000,\n    "duration" : 9,\n    "id" : "e7198f93-d8fa-448d-b134-ac3355ce2eb7",\n    "name" : "Archive 4",\n    "partnerId" : "APIKEY",\n    "reason" : "",\n    "sessionId" : "SESSION_ID",\n    "size" : 12691,\n    "status" : "available",\n    "url" : "http://some/video3.mp4"\n  }, {\n    "createdAt" : 1391218252000,\n    "duration" : 17,\n    "id" : "ae531f74-218c-4abd-bbe4-1f6bd92e9449",\n    "name" : null,\n    "partnerId" : "APIKEY",\n    "reason" : "",\n    "sessionId" : "SESSION_ID",\n    "size" : 21566,\n    "status" : "available",\n    "url" : "http://some/video4.mp4"\n  }, {\n    "createdAt" : 1391218139000,\n    "duration" : 73,\n    "id" : "cf2fd890-7ea0-4f43-a6a7-432ea9dc4c51",\n    "name" : "Archive 5",\n    "partnerId" : "APIKEY",\n    "reason" : "",\n    "sessionId" : "SESSION_ID",\n    "size" : 83158,\n    "status" : "available",\n    "url" : "http://some/video5.mp4"\n  } ]\n}', { server: 'nginx',
        date: 'Mon, 03 Feb 2014 23:38:53 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.listArchives({ count: 5 }, function(err, archives, total) {
        expect(err).toBeNull();
        expect(total).toBe(149);
        expect(archives).toEqual(jasmine.any(Array));
        expect(archives.length).toBe(5);
        expect(archives[0].duration).toBe(3);
        expect(archives[0].id).toBe('16231874-7ce7-4f5e-a30a-4513c4df480d');
        expect(archives[0].name).toBe('');
        expect(archives[0].reason).toBe('');
        expect(archives[0].sessionId).toBe('SESSION_ID');
        expect(archives[0].size).toBe(6590);
        expect(archives[0].status).toBe('available');
        expect(archives[0].url).toBe('http://some/video1.mp4');
        done();
      });

    });

    it('should return an error if any other HTTP status is returned', function(done) {
      nock('https://api.opentok.com:443')
        .get('/v2/partner/APIKEY/archive?count=5')
        .reply(500, '{\"message\":\"Some error\"}', { server: 'nginx',
        date: 'Mon, 03 Feb 2014 23:38:53 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.listArchives({ count: 5 }, function(err, archives, total) {
        expect(archives).toBeUndefined();
        expect(total).toBeUndefined();
        expect(err).not.toBeNull();
        expect(err.message).toBe('Unexpected response from OpenTok');
        done();
      });
    });

  });

  describe('stopArchive', function() {

    it('should return an archive', function(done) {
      var archiveId = 'ca138a6c-380f-4de9-b2b2-bc78b3a117e2';
            
      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive/ca138a6c-380f-4de9-b2b2-bc78b3a117e2', {'action':'stop'})
        .reply(200, '{\n  \"createdAt\" : 1391471703000,\n  \"duration\" : 0,\n  \"id\" : \"ca138a6c-380f-4de9-b2b2-bc78b3a117e2\",\n  \"name\" : \"PHP Archiving Sample App\",\n  \"partnerId\" : \"APIKEY\",\n  \"reason\" : \"\",\n  \"sessionId\" : \"1_MX4xMDB-MTI3LjAuMC4xflR1ZSBKYW4gMjggMTU6NDg6NDAgUFNUIDIwMTR-MC43NjAyOTYyfg\",\n  \"size\" : 0,\n  \"status\" : \"stopped\",\n  \"url\" : null\n}', { server: 'nginx',
        date: 'Mon, 03 Feb 2014 23:56:29 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.stopArchive(archiveId, function(err, archive) {
        expect(err).toBeNull();
        expect(archive).not.toBeNull();
        expect(archive.status).toBe('stopped');
        done();
      });
    });

    it('should return an error if archive ID is null', function(done) {
      opentok.stopArchive(null, function(err, archive) {
        expect(archive).toBeUndefined();
        expect(err).not.toBeNull();
        expect(err.message).toBe('No archive ID given');
        done();
      });

    });

    it('should return an error if archive ID is invalid', function(done) {
      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive/AN-INVALID-ARCHIVE-ID', {'action':'stop'})
        .reply(404, '{ \"message\" : \"Not found. You passed in an invalid archive ID.\" }', { server: 'nginx',
        date: 'Tue, 04 Feb 2014 00:51:02 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.stopArchive('AN-INVALID-ARCHIVE-ID', function(err, archive) {
        expect(archive).toBeUndefined();
        expect(err).not.toBeNull();
        expect(err.message).toBe('Archive not found');
        done();
      });
    });

    it('should return an error if the archive is not currently started', function(done) {
      
      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive/ca138a6c-380f-4de9-b2b2-bc78b3a117e2', {'action':'stop'})
        .reply(409, '{ \"message\" : \"Conflict. You are trying to stop an archive that is not recording.\" }', { server: 'nginx',
        date: 'Tue, 04 Feb 2014 00:52:38 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      var archiveId = 'ca138a6c-380f-4de9-b2b2-bc78b3a117e2';
      opentok.stopArchive(archiveId, function(err, archive) {
        expect(archive).toBeUndefined();
        expect(err).not.toBeNull();
        expect(err.message).toBe('Conflict. You are trying to stop an archive that is not recording.');
        done();
      });

    });

    it('should return an error if any other HTTP status is returned', function(done) {

      nock('https://api.opentok.com:443')
        .post('/v2/partner/APIKEY/archive/ca138a6c-380f-4de9-b2b2-bc78b3a117e2', {'action':'stop'})
        .reply(500, '{ \"message\" : \"Some other error.\" }', { server: 'nginx',
        date: 'Tue, 04 Feb 2014 00:52:38 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      var archiveId = 'ca138a6c-380f-4de9-b2b2-bc78b3a117e2';
      opentok.stopArchive(archiveId, function(err, archive) {
        expect(archive).toBeUndefined();
        expect(err).not.toBeNull();
        expect(err.message).toBe('Unexpected response from OpenTok');
        done();
      });

    });

  });

  describe('deleteArchive', function() {

    it('should return no error on success', function(done) {

      nock('https://api.opentok.com:443')
        .delete('/v2/partner/APIKEY/archive/ca138a6c-380f-4de9-b2b2-bc78b3a117e2')
        .reply(204, '', { server: 'nginx',
        date: 'Tue, 04 Feb 2014 01:05:40 GMT',
        connection: 'keep-alive' });

      var archiveId = 'ca138a6c-380f-4de9-b2b2-bc78b3a117e2';
      opentok.deleteArchive(archiveId, function(err) {
        expect(err).toBeNull();
        done();
      });

    });

    it('should return an error if archive ID is null', function(done) {
      opentok.deleteArchive(null, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('No archive ID given');
        done();
      });
    });

    it('should return an error if archive ID is invalid', function(done) {

      nock('https://api.opentok.com:443')
        .delete('/v2/partner/APIKEY/archive/AN-INVALID-ARCHIVE-ID')
        .reply(404, '{ \"message\" : \"Not found. You passed in an invalid archive ID.\" }', { server: 'nginx',
        date: 'Tue, 04 Feb 2014 01:10:39 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      opentok.deleteArchive('AN-INVALID-ARCHIVE-ID', function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Archive not found');
        done();
      });

    });

    it('should return an error if any other HTTP status is returned', function(done) {

      nock('https://api.opentok.com:443')
        .delete('/v2/partner/APIKEY/archive/ca138a6c-380f-4de9-b2b2-bc78b3a117e2')
        .reply(500, '{ \"message\" : \"Some other error.\" }', { server: 'nginx',
        date: 'Tue, 04 Feb 2014 00:52:38 GMT',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive' });

      var archiveId = 'ca138a6c-380f-4de9-b2b2-bc78b3a117e2';
      opentok.deleteArchive(archiveId, function(err) {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Unexpected response from OpenTok');
        done();
      });

    });

  });

});
  
