# Tin Can Switch

A switching server for tin can phones!

## Install

```
cd src/
npm install
```

## Deploy

### Mac

```
docker-machine start                             # creates a virtual machine for running the docker daemon (named 'default')
eval $(docker-machine env default)               # sets environment variables to point docker client at docker daemon in virtual machine

export TIN_CAN_SWITCH_ROOT=/path/to/switch/root  # set root of tin can switch directory
docker stack deploy -c docker-stack.yaml <name>  # creates containers, volumes, networks, etc. described in 'docker-stack.yaml'
```

### Linux

```
export TIN_CAN_SWITCH_ROOT=/path/to/switch/root  # set root of tin can switch directory
docker stack deploy -c docker-stack.yaml <name>  # creates containers, volumes, networks, etc. described in 'docker-stack.yaml'
```

## Monitor

```
docker stack ps <name>        # list docker containers associated with the given stack
docker attach <container-id>  # show stdout from the given container
```

## Restart

```
docker stack rm <name>                # shutdown all services and containers in stack
docker container stop <container-id>  # stop container
docker container rm <container-id>    # remove container
docker container kill <container-id>  # stop and remove container (ungracefully)
```
