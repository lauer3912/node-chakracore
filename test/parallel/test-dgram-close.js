'use strict';
// Ensure that if a dgram socket is closed before the DNS lookup completes, it
// won't crash.

const assert = require('assert');
const common = require('../common');
const dgram = require('dgram');

var buf = Buffer.alloc(1024, 42);

var socket = dgram.createSocket('udp4');
var handle = socket._handle;
var closeEvents = 0;
var closeCallbacks = 0;
socket.send(buf, 0, buf.length, common.PORT, 'localhost');
assert.strictEqual(socket.close(function() {
  ++closeCallbacks;
}), socket);
socket.on('close', function() {
  assert.equal(closeCallbacks, 1);
  ++closeEvents;
});
socket = null;

// Verify that accessing handle after closure doesn't throw
setImmediate(function() {
  setImmediate(function() {
    console.log('Handle fd is: ', handle.fd);
  });
});

process.on('exit', function() {
  assert.equal(closeEvents, 1);
  assert.equal(closeCallbacks, 1);
});
