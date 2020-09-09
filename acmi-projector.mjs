// Goal: be able to give a complete situation description at a specific timestamp

export function createProjector(acmiData) {
    const objs = {};

    for(let snapshot of acmiData.snapshots) {

        for(let snapshotObj of snapshot.objects) {
            objs[snapshotObj.id] = objs[snapshotObj.id] || {};

            if(snapshotObj.coordinates) {
                const coordsHistory = objs[snapshotObj.id].coordinates;
                let newCoordinates;
                if(coordsHistory) {
                    const latestCoordinates = coordsHistory[coordsHistory.length - 1].coordinates;
                    newCoordinates = {...latestCoordinates};
                } else {
                    objs[snapshotObj.id].coordinates = [];
                    newCoordinates = {};
                }
                for(let key of Object.keys(snapshotObj.coordinates)) {
                    if(snapshotObj.coordinates[key] !== null) {
                        newCoordinates[key] = snapshotObj.coordinates[key];
                    }
                }
                objs[snapshotObj.id].coordinates.push({timestamp: snapshot.timestamp, coordinates: newCoordinates});
            }

            for(let key of Object.keys(snapshotObj)) {
                if(key !== 'coordinates') {
                    objs[snapshotObj.id][key] = snapshotObj[key];
                }
            }
        }
    }
    console.log(objs);
    
    return {
        objects: objs,
        getSnapShot: (time) => {},

        getObjectCoordinatesAtTime: (obj, time) => {
            let previousCoords = obj.coordinates[0]
            for(let coordinates of obj.coordinates) {
                if(coordinates.timestamp > time) {
                    break;
                }
                previousCoords = coordinates;
            }
            return previousCoords;
        }
    }
}