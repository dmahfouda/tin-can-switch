# Tin Can Switch

A switching server for tin can phones!

## Install

```
cd src/
npm install
```

## Deploy

To deploy a tin can switch server, one should first some environment variables.

- `TIN_CAN_SWITCH_ROOT` - the full path to the root of this repository on the host machine
- `TIN_CAN_SWITCH_STACK_NAME` - an identifier to be used for deploying the tin can switch stack

This can be accomplished by executing the following commands.

```
export TIN_CAN_SWITCH_ROOT=/path/to/root
export TIN_CAN_SWITCH_STACK_NAME=stack-name
```

Once these variables have been set, one can deploy the stack of services required for running
a tin can switch server by executing the following command.

```
docker stack deploy -c stack.yaml ${TIN_CAN_SWITCH_STACK_NAME}
```

**Note**: _if you are running Docker on MacOS, you'll first have to provision a virtual machine
for running the Docker daemon. The commands below will have to be executed before those mentioned 
above this note._

```
# provision virtual machine for running docker daemon
docker-machine start

# set environment variables to point docker client
# at docker daemon in virtual machine 
eval $(docker-machine env default)
```

## Monitor

```
# list docker containers associated with the given stack
docker stack ps ${TIN_CAN_SWITCH_STACK_NAME}

# show (and follow) logs from the given container
docker logs -f <container-name>
```

## Restart

The `src` directory is mounted onto the containers running the tin can switch server. 
This means changes to files in this directory on the host machine will propogate to the 
container. However, in order for those changes to be reflected, the server has to be
restarted. This can be accomplished by restarting the container with the following
command.

```
docker container restart <container-name>
```

However, this is a burdensome way to restart the container because the container name 
is not fixed. Instead one can force an update to the entire service of which the 
container is a part.

```
docker service update --force ${TIN_CAN_SWITCH_STACK_NAME}_node
```

This takes a bit longer to execute, but it is uses a fixed naming scheme and so is
less burdensome to type.

## Troublshooting

To look at a container try

```
docker ps
```

insted of 

```
docker stack ps <container-name>
```

List stacks like this

```
docker stack ls
```

Remove stacks like this

```
docer stack rm
```
