## install

### install on mac

`docker-machine start` will start the default machine
`eval $(docker-machine env default)` will set environment variables to point docker client at docker machine
`docker stack deploy -c docker-compose.yaml ***` will start the server and database containers

### server printlns

`docker attach [Container ID]` get output from docker container
`docker ps` this is how you get the list of docker Containers and docker Container IDs

### restarting docker processes
`docker stack rm ***` kill whole stack
`docker container rm [Container ID]` kill container
