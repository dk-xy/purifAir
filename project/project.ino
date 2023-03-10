#include <SPI.h>
#include "SparkFun_ENS160.h"
SparkFun_ENS160_SPI myENS;
int chipSelect = 10;
int ensStatus = 0;

const int fans[2] = { 5, 6 };  //Pins of the two fans
const int ledPin = 4;

void setup() {
  Serial.begin(9600);
  //Initiate the pins to output and input
  for (int i = 0; i < 2; i++) {
    pinMode(fans[i], OUTPUT);
  }
  pinMode(ledPin, OUTPUT);
  pinMode(chipSelect, OUTPUT);
  digitalWrite(chipSelect, HIGH);

  SPI.begin();
  if (!myENS.begin(chipSelect)) {
    Serial.println("Did not begin.");
    while (1)
      ;
  }

  // Reset the indoor air quality sensor's settings.
  if (myENS.setOperatingMode(SFE_ENS160_RESET))
    Serial.println("Ready.");
  delay(100);

  // Set to standard operation
  // Others include SFE_ENS160_DEEP_SLEEP and SFE_ENS160_IDLE
  myENS.setOperatingMode(SFE_ENS160_STANDARD);
  Serial.print("Operating Mode: ");
  Serial.println(myENS.getOperatingMode());

  ensStatus = myENS.getFlags();
  Serial.print("Gas Sensor Status Flag: ");
  Serial.println(ensStatus);
}

//To manage power with webinterface buttons
String s = "";
bool smart = false;
bool power = false;
void checkPower() {
  if (Serial.available() > 0) {
    s = Serial.readString();
    //Check if a button is pressed on the webinterface (SMART: activated / deactivated, POWER: on / off)
    if (s == "on" || s == "off") {
      power = !power;
    }
    if (s == "activated" || s == "deactivated") {
      smart = !smart;
    }
    delay(50);
  }
}

void loop() {
  SPI.begin();
  // Reset the indoor air quality sensor's settings.
  myENS.setOperatingMode(SFE_ENS160_RESET);
  delay(100);
  // Set to standard operation
  // Others include SFE_ENS160_DEEP_SLEEP and SFE_ENS160_IDLE
  myENS.setOperatingMode(SFE_ENS160_STANDARD);
  checkPower();
  while (power) {
    int AQI = 6 - myENS.getAQI();
    int CO2 = myENS.getECO2();
    int VOC = myENS.getTVOC();
    //Send the values of the sensor (in %) for the web interface
    Serial.println((String) "a:" + AQI + "b:" + CO2 + "c:" + VOC);
    delay(50);
    //Allumage grâce au SMART sensor
    if (smart) {
      //If the sensor sends more than 50% of its range, turn the fans on, else turn them off
      if (AQI <= 3) {
        enableFans();
      } else {
        disableFans();
      }
    } else {  //SMART system deactivated
      enableFans();
    }
    checkPower();
  }
  disableFans();
}

void enableFans() {
  //turns the two fans on
  for (int i = 0; i < 2; i++) {
    digitalWrite(fans[i], HIGH);
  }
  digitalWrite(ledPin, HIGH);
}

void disableFans() {
  //turns the two fans off
  for (int i = 0; i < 2; i++) {
    digitalWrite(fans[i], LOW);
  }
  digitalWrite(ledPin, LOW);
}
