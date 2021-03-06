'use strict';

const common = require('../common');
const assert = require('assert');
const spawn = require('child_process').spawn;

if (common.isChakraEngine) {
  console.log('1..0 # Skipped: This test is disabled for chakra engine ' +
  'because debugger support is not implemented yet.');
  return;
}

let run = () => {};
function test(args, re) {
  const next = run;
  run = () => {
    const options = {encoding: 'utf8'};
    const proc = spawn(process.execPath, args.concat(['-e', '0']), options);
    let stderr = '';
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (data) => {
      stderr += data;
      if (re.test(stderr)) proc.kill();
    });
    proc.on('exit', common.mustCall(() => {
      assert(re.test(stderr));
      next();
    }));
  };
}

test(['--debug-brk'], /Debugger listening on (\[::\]|0\.0\.0\.0):5858/);
test(['--debug-brk=1234'], /Debugger listening on (\[::\]|0\.0\.0\.0):1234/);
test(['--debug-brk=127.0.0.1'], /Debugger listening on 127\.0\.0\.1:5858/);
test(['--debug-brk=127.0.0.1:1234'], /Debugger listening on 127\.0\.0\.1:1234/);
test(['--debug-brk=localhost'],
     /Debugger listening on (\[::\]|127\.0\.0\.1):5858/);
test(['--debug-brk=localhost:1234'],
     /Debugger listening on (\[::\]|127\.0\.0\.1):1234/);

if (common.hasIPv6) {
  test(['--debug-brk=::'], /Debug port must be in range 1024 to 65535/);
  test(['--debug-brk=::0'], /Debug port must be in range 1024 to 65535/);
  test(['--debug-brk=::1'], /Debug port must be in range 1024 to 65535/);
  test(['--debug-brk=[::]'], /Debugger listening on \[::\]:5858/);
  test(['--debug-brk=[::0]'], /Debugger listening on \[::\]:5858/);
  test(['--debug-brk=[::]:1234'], /Debugger listening on \[::\]:1234/);
  test(['--debug-brk=[::0]:1234'], /Debugger listening on \[::\]:1234/);
  test(['--debug-brk=[::ffff:127.0.0.1]:1234'],
       /Debugger listening on \[::ffff:127\.0\.0\.1\]:1234/);
}

run();  // Runs tests in reverse order.
