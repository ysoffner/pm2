var processTree = require('../../lib/tools/ProcessTree.js');
var treeKill = require('../../lib/TreeKill.js');
var assert = require('assert');
var spawn = require('child_process').spawn;
var fixtures = __dirname + '/../fixtures/process-tree';
var ISWIN = process.platform === 'win32'

describe('process tree tools/ProcessTree.js', function() {
  this.timeout(10000);

  it('should get process tree', function(cb) {
    processTree(process.pid, function(err, tree) {
      assert.equal(tree[process.pid].length, 1, 'should have tree length');
      cb()
    })
  })

  it('should get process tree with children', function(cb) {
    var p = spawn('node', [fixtures+'/sleep.js']);

    processTree(process.pid, function(err, tree) {
      assert.equal(tree[process.pid].length, 2, 'Process should have child process');
      assert.equal(Object.keys(tree).length, 3, 'Should have tree length');
      p.kill();
      cb();
    })
  })

  it('should kill process tree', function(cb) {
    var p = spawn('node', [fixtures+'/multiple-child.js', '3']);

    setTimeout(function() {
      processTree(p.pid, function(err, tree) {
        if (!ISWIN) {
          assert.equal(Object.keys(tree).length, 8, 'Should have tree length');
        }

        treeKill(p.pid, 'SIGKILL', function(err, killed) {
          if (!ISWIN) {
            assert.equal(Object.keys(killed).length, 8, 'Should have tree length');
          }

          processTree(p.pid, function(err, tree) {
            assert.equal(tree[p.pid].length, 0, 'Should have no more child process');
            cb();
          })
        })
      })
    }, 1000) //wait some time spawning is slow
  })
})
