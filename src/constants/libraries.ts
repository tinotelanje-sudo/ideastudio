export interface LibraryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export const SAMPLE_LIBRARIES: LibraryItem[] = [
  {
    id: 'wifi-extender',
    name: 'WiFi Extender',
    category: 'Networking',
    description: 'Simple WiFi Range Extender for ESP32/ESP8266.',
    code: `/* WiFi Extender Sample */
#include <WiFi.h>
#include <WiFiAP.h>
#include <WiFiSTA.h>

const char* ssid = "Your_SSID";
const char* password = "Your_Password";

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
  WiFi.softAP("Nexus_Extender", "12345678");
}

void loop() {
  // Routing logic here
}`
  },
  {
    id: 'wifi-server-switch',
    name: 'WiFi Server Switch',
    category: 'Networking',
    description: 'Control a relay or LED via a web interface.',
    code: `/* WiFi Server Switch */
#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);
const int relayPin = 5;

void handleRoot() {
  server.send(200, "text/html", "<h1>Nexus Switch</h1><a href='/on'>ON</a> | <a href='/off'>OFF</a>");
}

void setup() {
  pinMode(relayPin, OUTPUT);
  WiFi.begin("SSID", "PASS");
  server.on("/", handleRoot);
  server.on("/on", []() { digitalWrite(relayPin, HIGH); server.send(200, "text/plain", "ON"); });
  server.on("/off", []() { digitalWrite(relayPin, LOW); server.send(200, "text/plain", "OFF"); });
  server.begin();
}

void loop() {
  server.handleClient();
}`
  },
  {
    id: 'http-web-server',
    name: 'HTTP/HTTPS Web Server',
    category: 'Networking',
    description: 'Advanced Web Server with JSON support.',
    code: `/* HTTP Web Server */
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASS");
}

void loop() {
  // Server implementation
}`
  },
  {
    id: 'multisensor-monitor',
    name: 'Multi-sensor Monitor',
    category: 'Sensors',
    description: 'Read DHT22, BMP280, and LDR sensors.',
    code: `/* Multi-sensor Monitor */
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

void setup() {
  Serial.begin(115200);
  // Initialize sensors
}

void loop() {
  // Read and print sensor data
}`
  },
  {
    id: 'lora-comm',
    name: 'LoRa Communication',
    category: 'Wireless',
    description: 'Long range communication using LoRa modules.',
    code: `/* LoRa Communication */
#include <SPI.h>
#include <LoRa.h>

void setup() {
  Serial.begin(115200);
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
}

void loop() {
  LoRa.beginPacket();
  LoRa.print("Nexus LoRa");
  LoRa.endPacket();
  delay(5000);
}`
  },
  {
    id: 'ir-remote',
    name: 'IR Remote',
    category: 'Control',
    description: 'Receive and send Infrared signals.',
    code: `/* IR Remote Control */
#include <IRremote.h>

int RECV_PIN = 11;
IRrecv irrecv(RECV_PIN);
decode_results results;

void setup() {
  Serial.begin(9600);
  irrecv.enableIRIn();
}

void loop() {
  if (irrecv.decode(&results)) {
    Serial.println(results.value, HEX);
    irrecv.resume();
  }
}`
  },
  {
    id: 'ai-camera',
    name: 'AI Camera',
    category: 'Vision',
    description: 'Object detection using ESP32-CAM.',
    code: `/* AI Camera - ESP32-CAM */
#include "esp_camera.h"

void setup() {
  // Camera configuration
}

void loop() {
  // Capture frame and run inference
}`
  },
  {
    id: 'multimedia-player',
    name: 'Multimedia Player',
    category: 'Media',
    description: 'Play MP3/WAV from SD card.',
    code: `/* Multimedia Player */
#include "Audio.h"
#include "SD.h"

void setup() {
  // Audio setup
}

void loop() {
  // Playback logic
}`
  },
  {
    id: 'walkie-talkie',
    name: 'Walkie Talkie',
    category: 'Wireless',
    description: 'Voice communication over ESP-NOW or LoRa.',
    code: `/* Walkie Talkie */
#include <esp_now.h>

void setup() {
  // Audio I2S setup
}

void loop() {
  // Transmit/Receive audio
}`
  },
  {
    id: 'messenger-mqtt',
    name: 'Messenger & MQTT',
    category: 'Wireless',
    description: 'Secure messaging over MQTT protocol.',
    code: `/* Messenger & MQTT */
#include <PubSubClient.h>

void setup() {
  // MQTT setup
}

void loop() {
  // Publish/Subscribe
}`
  },
  {
    id: 'gsm-gps-ble',
    name: 'GSM/GPS/BLE Combo',
    category: 'Wireless',
    description: 'Integrated tracking and communication.',
    code: `/* GSM/GPS/BLE Combo */
#include <TinyGPS++.h>
#include <BLEDevice.h>

void setup() {
  // GSM/GPS/BLE init
}

void loop() {
  // Tracking logic
}`
  },
  {
    id: 'kotlin-android-hello',
    name: 'Android Hello World',
    category: 'Kotlin',
    description: 'Simple Android Activity in Kotlin.',
    code: `package com.example.myapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.TextView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val textView = TextView(this)
        textView.text = "Hello, Android from Kotlin!"
        setContentView(textView)
    }
}`
  }
];

export const BOARD_LIBRARIES: LibraryItem[] = [
  {
    id: 'esp32-s3',
    name: 'ESP32-S3',
    category: 'Espressif',
    description: 'Dual-core XTensa LX7 MCU with AI instructions.',
    code: `// Board: ESP32-S3
// CPU: 240MHz
// Flash: 8MB
// PSRAM: 2MB`
  },
  {
    id: 'esp32-c3',
    name: 'ESP32-C3',
    category: 'Espressif',
    description: 'RISC-V Single-core MCU with WiFi/BLE.',
    code: `// Board: ESP32-C3
// CPU: 160MHz`
  },
  {
    id: 'esp32-c6',
    name: 'ESP32-C6',
    category: 'Espressif',
    description: 'WiFi 6 & Matter support.',
    code: `// Board: ESP32-C6`
  },
  {
    id: 'esp32-h2',
    name: 'ESP32-H2',
    category: 'Espressif',
    description: 'IEEE 802.15.4 & BLE 5.3.',
    code: `// Board: ESP32-H2`
  },
  {
    id: 'esp32-p4',
    name: 'ESP32-P4',
    category: 'Espressif',
    description: 'High-performance Multimedia MCU.',
    code: `// Board: ESP32-P4`
  },
  {
    id: 'esp8266',
    name: 'ESP8266',
    category: 'Espressif',
    description: 'Classic WiFi MCU.',
    code: `// Board: ESP8266`
  },
  {
    id: 'stm32-f1',
    name: 'STM32 F1 Series',
    category: 'STM32',
    description: 'Mainstream ARM Cortex-M3.',
    code: `// Board: STM32F103 (Blue Pill)`
  },
  {
    id: 'raspberry-pi',
    name: 'Raspberry Pi',
    category: 'SBC',
    description: 'General purpose Linux SBC.',
    code: `// Board: Raspberry Pi 4/5`
  },
  {
    id: 'drone-fc',
    name: 'Drone Flight Controller',
    category: 'Specialized',
    description: 'Betaflight/Ardupilot compatible boards.',
    code: `// Board: F405/F722 Flight Controller`
  },
  {
    id: 'antminer-ctrl',
    name: 'Antminer Controller',
    category: 'Specialized',
    description: 'Bitmain Antminer control boards.',
    code: `// Board: Antminer C55/C71`
  },
  {
    id: 'vape-pod',
    name: 'Vape Pod Controller',
    category: 'Specialized',
    description: 'Custom MCU for vaping devices.',
    code: `// Board: Custom Vape MCU`
  },
  {
    id: 'python-blink',
    name: 'MicroPython Blink',
    category: 'Python',
    description: 'Basic LED blink in MicroPython.',
    code: `import machine
import time

led = machine.Pin(2, machine.Pin.OUT)

while True:
    led.on()
    time.sleep(1)
    led.off()
    time.sleep(1)`
  },
  {
    id: 'js-blink',
    name: 'Espruino Blink',
    category: 'JavaScript',
    description: 'Basic LED blink in Espruino (JavaScript).',
    code: `var on = false;
setInterval(function() {
  on = !on;
  LED1.write(on);
}, 500);`
  }
];
