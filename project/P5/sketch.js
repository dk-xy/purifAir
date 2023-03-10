console.log("sketch");

let serial = 'ws://localhost:8081'; // variable to hold an instance of the serialport library
let portName = "COM4"; // fill in your serial port name here

let hoverBubble;
let showInfo = false;



//COLORS////////////////////////////////////////

const C_LG = "#292929"; // LIGHT gray
const C_MG = "#ffffff" //MEDIUM gray
const C_DG = "#C7996F" //DARK gray
const C_AG = "#2a2a2ae8" //ACCENT gray

//////////////////////////////////////////////


// let width = window.innerWidth;
// let height = window.innerHeight;

function setup() {
    console.log("Setup sketch");
    let width = 800;
    let height = 755
    img = loadImage('LogoWhite.png'); // Load the image
    const dashBoard = createCanvas(width, height);
    dashBoard.parent('canvasDiv');
    // serial
    serial = new p5.SerialPort(); // make a new instance of the serialport library
    serial.on("list", printList); // set a callback function for the serialport list event
    serial.on("connected", serverConnected); // callback for connecting to the server
    serial.on("open", portOpen); // callback for the port opening
    serial.on("data", serialEvent); // callback for when new data arrives
    serial.on("error", serialError); // callback for errors
    serial.on("close", portClose); // callback for the port closing

    serial.list(); // list the serial ports
    serial.open(portName); // open a serial port
}

// get the list of ports:
function printList(portList) {
    // portList is an array of serial port names
    for (let i = 0; i < portList.length; i++) {
        console.log(i + ": " + portList[i]);
    }
}

function serverConnected() {
    console.log("connected to server.");
}

function portOpen() {
    console.log("the serial port is opened.");
}

function serialError(err) {
    console.log("Something went wrong with the serial port. " + err);
}

function portClose() {
    console.log("The serial port is closed.");
}


//Datas of the sensor
let dataAQI = 0;
let dataCO2 = 0;
let dataVOC = 0;

function draw() {
    background(C_DG)
    // image(img, 600, 0);
    image(img, 634, 5, img.width / 1.4, img.height / 1.4);

    getContainer(dataAQI, "Air Quality Index", 1, 5, 50, 50, "red", "orange", "green", "")
    getContainer(dataCO2, "CO2 Concentration", 400, 2000, 50, 400, "green", "orange", "red", "ppm")
    getContainer(dataVOC, "Volatile Organic \n Compounds", 0, 2000, 450, 400, "green", "orange", "red", "ppb")
    makeBtn()
    makePwBtn()
}

function serialEvent() {
    //Get data from arduino
    let tempData = serial.readLine();
    let delimA = tempData.indexOf("a");
    let delimB = tempData.indexOf("b");
    let delimC = tempData.indexOf("c");
    let tempdataAQI = tempData.substring(delimA + 2, delimB)
    let tempdataCO2 = tempData.substring(delimB + 2, delimC)
    let tempdataVOC = tempData.substring(delimC + 2)
    //Sets the values for the AQI, CO2 and VOC
    if (!tempdataAQI == "") dataAQI = parseInt(tempdataAQI)
    if (!tempdataCO2 == "") dataCO2 = parseInt(tempdataCO2)
    if (!tempdataVOC == "") dataVOC = parseInt(tempdataVOC)

    console.log(tempData)
}

let xBtnContainer = 550
let yBtnContainer = 200
let xBtn = 550
let yBtn = 200
let color = "red"
let state = "deactivated"
///////////////////////////////////////////////////////////// Trigger button
function makeBtn() {
    push()
    //The button container
    stroke("#cacaca")
    fill(color)
    rect(xBtnContainer, yBtnContainer, 100, 50, 15, 15, 15, 15);
    //The button switch
    fill("white")
    stroke("white")
    strokeWeight(4)
    rect(xBtn, yBtn, 50, 50, 15, 15, 15, 15)
    pop()
    push()
    //The text of activeness of the button
    fill("black")
    textAlign(CENTER)
    textSize(14)
    text("SMART Filter: ", xBtnContainer, yBtnContainer + 75)

    fill(color)
    textAlign(CENTER)
    textSize(14)
    text(state, xBtnContainer + 90, yBtnContainer + 75)
    pop()
}

function mousePressed() {
    //if the mouse is over the rectangle (button)
    if ((mouseX > xBtnContainer) && (mouseX < xBtnContainer + 100) &&
        (mouseY > yBtnContainer) && (mouseY < yBtnContainer + 50)) { //Button of SMART
        serial.write(state)
        if (color == "red") {
            xBtn += 50
            color = "green"
            state = "activated"
        } else {
            xBtn -= 50
            color = "red"
            state = "deactivated"
        }
    }
    if ((mouseX > xPwBtnContainer) && (mouseX < xPwBtnContainer + 100) &&
        (mouseY > yPwBtnContainer) && (mouseY < yPwBtnContainer + 50)) { //Button of power
        serial.write(Pwstate)
        if (Pwcolor == "red") {
            xPwBtn += 50
            Pwcolor = "green"
            Pwstate = "on"
        } else {
            xPwBtn -= 50
            Pwcolor = "red"
            Pwstate = "off"
            dataAQI = 0
            dataCO2 = 0
            dataVOC = 0
        }
    }
}


let xPwBtnContainer = 550
let yPwBtnContainer = 100
let xPwBtn = 550
let yPwBtn = 100
let Pwcolor = "red"
let Pwstate = "off"
///////////////////////////////////////////////////////////// Trigger button
function makePwBtn() {
    push()
    //The button container
    stroke("#cacaca")
    fill(Pwcolor)
    rect(xPwBtnContainer, yPwBtnContainer, 100, 50, 15, 15, 15, 15);
    //The button switch
    stroke("#ffffff")
    strokeWeight(4)
    fill("#ffffff")
    rect(xPwBtn, yPwBtn, 50, 50, 15, 15, 15, 15)

    //The text of activeness of the button
    fill("black")
    textAlign(CENTER)
    textSize(14)
    //The text of activeness of the button
    strokeWeight(0)
    textAlign(CENTER)
    textSize(14)
    text("Power " + Pwstate, xPwBtnContainer + 50, yPwBtnContainer + 75)
    pop()
}



//Function to call the container for each value of data of the air (air quality, CO2, VOC)
function getContainer(data, name, min, max, posX, posY, colorFirst, colorMiddle, colorEnd, unit) {
    push();
    translate(posX, posY)

    //MAIN RECT-----------------------------------
    noStroke()
    fill(255)
    square(0, 0, 300, 5, 5, 5, 5)
    //Title
    fill("black")
    textStyle(BOLD);
    // fill(255)
    textAlign(CENTER)
    textSize(20)
    text(name, 150, 50)
    getDataVis(data, min, max, colorFirst, colorMiddle, colorEnd, unit)
    //MINI INFO SQUARE///////////////////////////
    fill("#292929")
    pop();
}

//Function to call the data visualisation on an arc meter
function getDataVis(data, min, max, colorFirst, colorMiddle, colorEnd, unit) { //to create the visualisation of the data
    let angle = map(data, min, max, 0, 180)
    //If the value is 0, then adapt the cursor of the meter to stay in the semi-circle
    if(data <= min){
        angle = map(min, min, max, 0, 180)
    }
    //Center of the arc
    let x = 150;
    let y = 175;
    //Set the point where the cursor points to
    let xCursor = x + (-cos(radians(angle)) * 50);
    let yCursor = y + (-sin(radians(angle)) * 50);

    //Create arc of the meter
    let gradient = drawingContext.createConicGradient(0, x, y)
    gradient.addColorStop(0.5, colorFirst)
    gradient.addColorStop(0.75, colorMiddle)
    gradient.addColorStop(1, colorEnd)
    drawingContext.fillStyle = gradient
    arc(x, y, 150, 150, PI, TWO_PI, CHORD);

    //The cursor of the meter
    stroke(C_MG)
    strokeWeight(3)
    line(x, y, xCursor, yCursor)
    stroke("white")
    strokeWeight(1)

    //Value in real time of the index
    //NOTE pourrait etre red si mauvais
    let dataInt = Math.round(data * 10) / 10;
    fill("black")
    textAlign(CENTER)
    textSize(15)
    if (unit != "") unit = " " + unit
    if ((dataInt >= max) && (unit != "")) unit = "+ " + unit, dataInt = max
    text(dataInt + unit, 150, 215)
}
