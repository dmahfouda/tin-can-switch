## install

### install on mac

`docker-machine start` will start the default machine
`eval $(docker-machine env default)` will set environment variables to point docker client at docker machine
`docker stack deploy -c docker-compose.yaml ***` will start the server and database containers
