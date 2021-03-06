var test = require('tap').test;
var parsley = require('../');
var chunky = require('chunky');
var Stream = require('net').Stream;

test('get', function (t) {
    var pending = 50;
    t.plan(50 * 2);
    
    Array(50+1).join('x').split('').forEach(function () {
        var stream = new Stream;
        stream.readable = true;
        
        parsley(stream, function (req) {
            req.on('headers', function (headers) {
                t.equal(req.url, '/');
                
                t.deepEqual(headers, {
                    host : 'beep.boop',
                    connection : 'close',
                });
            });
            
            req.on('end', function () {
                if (--pending === 0) {
                    t.end();
                }
            });
        });
        
        var msg = new Buffer([
            'GET / HTTP/1.1',
            'Host: beep.boop',
            'Connection: close',
            '',
            ''
        ].join('\r\n'));
        
        var chunks = chunky(msg);
        var iv = setInterval(function () {
            stream.emit('data', chunks.shift());
            if (chunks.length === 0) {
                stream.emit('end');
                clearInterval(iv);
            }
        }, 10);
    });
});
