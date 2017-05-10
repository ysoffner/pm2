'use strict';
var spawn = require('child_process').spawn;
var ISWIN = process.platform === 'win32'
var os = require('os')
var async = require('async')

module.exports = function (pid, callback) {
  var spawner
  var memory = {
    tree: {},
    checkedPids: {}
  };

  memory.tree[pid] = [];
  memory.checkedPids[pid] = 1;

  switch (process.platform) {
    case 'win32':
      spawner = function spawnWmic (parentPid) {
        return spawn('wmic', ['PROCESS', 'WHERE', 'ParentProcessId='+parentPid, 'get', 'ProcessId']);
      }
      break;
    case 'darwin':
      spawner = function spawnPgrep (parentPid) {
        return spawn('pgrep', ['-P', parentPid]);
      }
      break;
    default: // Linux
      spawner = function spawnPs (parentPid) {
        return spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid]);
      }
      break;
  }

  var queue = async.queue(function(task, callback) {
    var parentPid = task.parentPid
    var ps = spawner(parentPid)

    var buf = '';

    ps.on('error', function(err) {
      console.error(err);
    });

    if (ps.stdout) {
      ps.stdout.on('data', function (data) {
        data = data.toString('ascii');
        buf += data;
      });
    }

    var onClose = function (code) {
      delete memory.checkedPids[parentPid];

      if (code !== 0) {
        callback();
        return;
      }

      var pids = buf.match(/\d+/gm) || [];

      pids = pids.filter(function(pid) {
        return pid;
      });

      var l = pids.length;

      if (l === 0) {
        callback();
        return;
      }

      for (var i = 0; i < l; i++) {
        var pid = pids[i];
        memory.tree[parentPid].push(pid);
        memory.tree[pid] = [];
        memory.checkedPids[pid] = 1;
        queue.push({parentPid: pid})
      }

      callback()
    };

    ps.on('close', onClose);

    if (ISWIN) {
      ps.stdin.end()
    }
  })

  queue.drain = function() {
    callback(null, memory.tree)
  }

  queue.push({parentPid: pid})
}
