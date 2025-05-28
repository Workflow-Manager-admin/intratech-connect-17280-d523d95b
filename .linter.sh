ha#!/bin/bash
cd /home/kavia/workspace/code-generation/intratech-connect-17280-d523d95b/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

