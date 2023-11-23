# !/bin/bash

mongod --port 27018 --bind_ip 127.0.0.1 --dbpath "/data/db" --replSet rs0 &
mongod --port 27019 --bind_ip 127.0.0.1 --dbpath "/data/db2" --replSet rs0 &
declare -a pidArray=(
    [0]=
    [1]=
    [3]=
)

count=0
A=$(pgrep mongod)
for pids in $A; do
    pidArray[count]=$pids
    ((count=count+1))
done


onexit(){
    kill ${pidArray[1]}
    kill ${pidArray[2]}
}

trap onexit INT TERM
read var
onexit