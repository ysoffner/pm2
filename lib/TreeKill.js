'use strict';

// Ideas from https://raw.githubusercontent.com/pkrumins/node-tree-kill/master/index.js
var exec = require('child_process').exec;
var processTree = require('./tools/ProcessTree.js')

module.exports = function (pid, signal, callback) {
  // For windows, we prefer to use taskkill instead of building a process tree with wmic
  if (process.platform === 'win32') {
    exec('taskkill /pid ' + pid + ' /T /F', callback);
    return;
  }

  processTree(pid, function (err, tree) {
    killAll(tree, signal, callback);
  });
};

function killAll (tree, signal, callback) {
  var killed = {};
  try {
    Object.keys(tree).forEach(function (pid) {
      tree[pid].forEach(function (pidpid) {
        if (!killed[pidpid]) {
          killPid(pidpid, signal);
          killed[pidpid] = 1;
        }
      });
      if (!killed[pid]) {
        killPid(pid, signal);
        killed[pid] = 1;
      }
    });
  } catch (err) {
    if (callback) {
      return callback(err, killed);
    } else {
      console.error(err);
    }
  }

  if (callback) {
    return callback(null, killed);
  }
}

function killPid(pid, signal) {
  try {
    process.kill(parseInt(pid, 10), signal);
  }
  catch (err) {
    if (err.code !== 'ESRCH')
      console.error(err);
  }
}
