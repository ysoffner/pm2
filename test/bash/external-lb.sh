
#!/usr/bin/env bash

SRC=$(cd $(dirname "$0"); pwd)
source "${SRC}/include.sh"
cd $file_path

echo -e "\033[1mRunning tests for external load balancing :\033[0m"

# Start 10 applications and make them listen on port from 10000 to 100010
# Retrieve listening port and re configure external LB to redirect to 10000 to 10010
$pm2 start http.js --lb 10 --lb-mode sticky

# Should choice of listening port made on CLI side or Daemon side?
# What happen when a process restart? (port change?)
# Should communication made on CLI side?
