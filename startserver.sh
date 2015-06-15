# starts a web server on the current dir
twistd -no web --path=. --port=8080 >& /dev/null &
