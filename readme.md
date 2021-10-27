# Distributed Chat Apllication

## Pre requisits
Docker
Docker compose

## How to run it
```docker-compose up -d```

## Changing configs
*config.txt* contains the list of containers and seperate by lines. Each line contains server name, address, client port and coorination port seperated by tabs.
To add a new container, add a line to *config.txt* and add a container to *docker-compose.yml* file.