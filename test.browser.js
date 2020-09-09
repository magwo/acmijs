
import { readAcmi } from './acmi-reader.mjs';
import { createProjector } from './acmi-projector.mjs';

async function start() {
    const response = await fetch('test.txt.acmi');
    const content = await response.text();
    
    console.log('File read from server, length: ', content.length);
    
    const result = readAcmi(content);
    console.log('Got result', result);

    displayResults(result);
}
start();


function displayResults(result) {
    const projector = createProjector(result);

    let allObjectKeys = Object.keys(projector.objects);
    allObjectKeys = allObjectKeys.sort();

    let currentObject = null;
    let currentTime = 0.0;

    function objectOptionHTML(key) {
        return `<option value='${key}'>${key} - ${projector.objects[key].Name} - ${projector.objects[key].Pilot}</option>\n`
    }

    function objectInfoHTML(obj, time) {
        const coordinates = projector.getObjectCoordinatesAtTime(obj, time);
        console.log("obj is", obj);
        return `
            ${Object.keys(obj).filter(key => key !== 'coordinates').map((key) => { return '<p><strong>' + key + '</strong> ' + obj[key] + '</p>' }).join("")}
            <h5>Orientation</h5>
            <p><strong>Longitude</strong> ${coordinates.coordinates.long}</p>
            <p><strong>Latitude</strong> ${coordinates.coordinates.lat}</p>
            <p><strong>Altitude</strong> ${coordinates.coordinates.alt}</p>
            <p><strong>Roll</strong> ${coordinates.coordinates.roll}</p>
            <p><strong>Pitch</strong> ${coordinates.coordinates.pitch}</p>
            <p><strong>Yaw</strong> ${coordinates.coordinates.yaw}</p>
            <p><strong>U</strong> ${coordinates.coordinates.u}</p>
            <p><strong>V</strong> ${coordinates.coordinates.v}</p>
            <p><strong>Hdg</strong> ${coordinates.coordinates.hdg}</p>
        `;
    }

    function updateObjectInfo() {
        document.querySelector('#objectInfo').innerHTML = `
            ${objectInfoHTML(currentObject, currentTime)}
        `;
    }

    document.querySelector('#objectSelector').addEventListener('change', function(event) {
        console.log("Change, value is", event.target.value);
        
        currentObject = projector.objects[event.target.value];
        updateObjectInfo();
    });

    document.querySelector('#timeSelector').addEventListener('change', function(event) {
        currentTime = event.target.value;
        console.log("currentTime", currentTime);
        updateObjectInfo();
    });

    document.querySelector('#objectSelector').innerHTML = `
        ${allObjectKeys.map(objectOptionHTML)}
    `;
}