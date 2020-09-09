
function parseObjectLineIntoTokens(line) {
    const SPLIT_CHAR = ',';
    const ESCAPE_CHAR = '\\';

    let isEscapeMode = false;
    let lastPos = 0;

    const result = {
        tokens: [],
        continuesAsMultiline: false
    }

    for(var i=0; i<line.length; i++) {
        if(isEscapeMode) {
            isEscapeMode = false;
        } else {
            if(line.charAt(i) === ESCAPE_CHAR) {
                isEscapeMode = true;
                if(i === line.length - 1) {
                    // End of line, but multiline
                    result.tokens.push(line.slice(lastPos));
                    result.continuesAsMultiline = true;
                }
            } else if(line.charAt(i) === SPLIT_CHAR) {
                result.tokens.push(line.slice(lastPos, i));
                lastPos = i + 1;
            } else if(i === line.length - 1) {
                // End of line
                result.tokens.push(line.slice(lastPos));
            }
        }
    }
    return result;
}

function parseObjectCoordinates(coordsStr) {
    const DELIMITER = '|';
    const coords = coordsStr.split(DELIMITER);

    if(coords.length === 3) {
        return {
            long: coords[0].length ? parseFloat(coords[0]) : null,
            lat: coords[1].length ? parseFloat(coords[1]) : null,
            alt: coords[2].length ? parseFloat(coords[2]) : null,
        }
    } else if(coords.length === 5) {
        return {
            long: coords[0].length ? parseFloat(coords[0]) : null,
            lat: coords[1].length ? parseFloat(coords[1]) : null,
            alt: coords[2].length ? parseFloat(coords[2]) : null,
            u: coords[3].length ? parseFloat(coords[3]) : null,
            v: coords[4].length ? parseFloat(coords[4]) : null,
        }
    } else if(coords.length === 6) {
        return {
            long: coords[0].length ? parseFloat(coords[0]) : null,
            lat: coords[1].length ? parseFloat(coords[1]) : null,
            alt: coords[2].length ? parseFloat(coords[2]) : null,
            roll: coords[3].length ? parseFloat(coords[3]) : null,
            pitch: coords[4].length ? parseFloat(coords[4]) : null,
            yaw: coords[5].length ? parseFloat(coords[5]) : null,
        }
    } else if(coords.length === 9) {
        return {
            long: coords[0].length ? parseFloat(coords[0]) : null,
            lat: coords[1].length ? parseFloat(coords[1]) : null,
            alt: coords[2].length ? parseFloat(coords[2]) : null,
            roll: coords[3].length ? parseFloat(coords[3]) : null,
            pitch: coords[4].length ? parseFloat(coords[4]) : null,
            yaw: coords[5].length ? parseFloat(coords[5]) : null,
            u: coords[6].length ? parseFloat(coords[6]) : null,
            v: coords[7].length ? parseFloat(coords[7]) : null,
            hdg: coords[8].length ? parseFloat(coords[8]) : null,
        }
    }
}

function parseObjectEvent(str) {
    const eventTokens = str.split('|');
    let linkedObjectIds = eventTokens.length > 2 ? eventTokens.slice(1, eventTokens.length - 2) : [];

    return {
        type: eventTokens[0],
        linkedObjs: linkedObjectIds,
        message: eventTokens[eventTokens.length - 1]
    }
}

function parseObjectProperty(str) {
    const DELIMITER = '=';
    const delimiterPos = str.indexOf(DELIMITER);
    const key = str.slice(0, delimiterPos);
    const value = str.slice(delimiterPos + 1);
    return [key, value];
}


function interpretObjectTokens(tokens) {
    const obj = { id: tokens[0], events: [] };
    for(let i=1; i<tokens.length; i++) {
        const token = tokens[i];
        if(token.startsWith('T=')) {
            obj.coordinates = parseObjectCoordinates(token.slice(2));
        } else if(token.startsWith('Event=')) {
            console.log("TODO: Handle event", token);
            obj.events.push(parseobjectEvent(token.slice(6)));
            console.log("Event!", obj.events);
        } else {
            const objProperty = parseObjectProperty(token);
            // console.log("Obj props are", objProperty);
            obj[objProperty[0]] = objProperty[1];
        }
    }
    return obj;
}

function parseRelativeTimeStamp(line) {
    const timeStamp = line.slice(1);
    return Number(timeStamp);
}

function unescapeString(str) {
    return str.replace('\\,', ',').replace('\\\\', '\\');
}

function createSnapshot(timestamp) {
    return {
        timestamp: timestamp,
        objects: [],
    }
}


export function readAcmi(fileContent) {
    const result = {
        snapshots: []
    };
    let currentSnapshot = createSnapshot(0);
    const lines = fileContent.split('\n');

    let isMultiLineStringMode = false;
    let currentMultilineResult = '';

    for(var i=0; i<lines.length; i++) {
        const line = lines[i];

        if(isMultiLineStringMode) {
            currentMultilineResult += unescapeString(line);

            if(!line.endsWith('\\')) {
                isMultiLineStringMode = false;
                // TODO: Store the result somehow :S
                console.log("Multiline string resulted in", currentMultilineResult);
                currentMultilineResult = '';
            }
        }
        else if(line.startsWith('#')) {
            const relativeTime = parseRelativeTimeStamp(line);
            result.snapshots.push(currentSnapshot);
            currentSnapshot = createSnapshot(relativeTime); // TODO: Maybe add with reference time?
        } else if(line.match(/^[0-9]+,/)) {
            const parsedObject = parseObjectLineIntoTokens(line);
            const objectState = interpretObjectTokens(parsedObject.tokens);
            // console.log("GOt object state", objectState);
            currentSnapshot.objects.push(objectState);

            if(result.continuesAsMultiline) {
                isMultiLineStringMode = true;
            }
        } else if(line.match(/^-[0-9]+,/)) {
            // TODO: Object was removed
            console.log("Object removed", line);
        }
    }

    if(result.snapshots.length === 0) {
        // Never encountered a relative timestamp, so push the first snapshot
        result.snapshots.push(currentSnapshot);
    }

    return result;
}