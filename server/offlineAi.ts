import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'offline_ai', 'database', 'ai_knowledge.db');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT UNIQUE,
    response TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS code_snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger TEXT UNIQUE,
    code TEXT,
    language TEXT
  );
`);

// Seed initial data
const insertKnowledge = db.prepare('INSERT OR IGNORE INTO knowledge (keyword, response, category) VALUES (?, ?, ?)');
const seedKnowledge = [
  ['blink', 'To blink an LED, you need to set the pin mode to OUTPUT in setup() and then toggle the pin HIGH and LOW with a delay in loop().', 'arduino'],
  ['serial', 'Use Serial.begin(9600) to start serial communication. Use Serial.println() to send data to the computer.', 'arduino'],
  ['esp32', 'The ESP32 is a powerful microcontroller with integrated WiFi and Bluetooth. It has more GPIOs and faster clock speed than Arduino Uno.', 'hardware'],
  ['pinmode', 'Configures the specified pin to behave either as an input or an output. Usage: pinMode(pin, mode);', 'arduino'],
  ['digitalwrite', 'Write a HIGH or a LOW value to a digital pin. Usage: digitalWrite(pin, value);', 'arduino'],
  ['analogread', 'Reads the value from the specified analog pin. Arduino boards contain a multi-channel, 10-bit analog to digital converter.', 'arduino'],
  ['millis', 'Returns the number of milliseconds passed since the Arduino board began running the current program.', 'arduino'],
  ['interrupt', 'Interrupts are useful for making things happen automatically in microcontroller programs and can help solve timing problems.', 'arduino'],
  ['deep sleep', 'ESP32 Deep Sleep is a power-saving mode where the CPU and most peripherals are powered off. Only the RTC remains active.', 'esp32'],
  ['watchdog', 'A Watchdog Timer (WDT) is a hardware timer that automatically generates a system reset if the main program neglects to periodically service it.', 'error'],
  ['brownout', 'A brownout detector triggers a reset when the supply voltage drops below a certain threshold to prevent unpredictable behavior.', 'error'],
  ['i2c', 'I2C (Inter-Integrated Circuit) is a synchronous, multi-master, multi-slave, packet switched, single-ended, serial communication bus.', 'communication'],
  ['spi', 'Serial Peripheral Interface (SPI) is a synchronous serial communication interface used for short-distance communication, primarily in embedded systems.', 'communication'],
  ['freertos', 'FreeRTOS is a real-time operating system for microcontrollers. ESP32 uses it for dual-core task management.', 'esp32'],
  ['stack overflow', 'A stack overflow occurs when a program uses more stack memory than allocated, often due to deep recursion or large local variables.', 'error'],
  ['pwm', 'Pulse Width Modulation (PWM) is a technique for getting analog results with digital means. Digital control is used to create a square wave.', 'arduino'],
  ['eeprom', 'EEPROM is memory whose values are kept when the board is powered off. It has a limited number of write cycles.', 'arduino'],
  ['ota', 'Over-the-Air (OTA) update is the process of loading firmware to a microcontroller using WiFi instead of a serial port.', 'esp32'],
  ['adc', 'Analog-to-Digital Converter (ADC) converts an analog voltage to a digital number. ESP32 has two 12-bit SAR ADCs.', 'hardware'],
  ['dac', 'Digital-to-Analog Converter (DAC) converts a digital number to an analog voltage. ESP32 has two 8-bit DAC channels.', 'hardware'],
  ['ble', 'Bluetooth Low Energy (BLE) is a wireless personal area network technology designed for low power consumption and cost.', 'communication'],
  ['spiffs', 'SPI Flash File System (SPIFFS) is a lightweight file system for microcontrollers with an SPI flash chip. Note: LittleFS is now preferred.', 'filesystem'],
  ['littlefs', 'LittleFS is a small, fail-safe filesystem designed for microcontrollers. It is more robust and faster than SPIFFS.', 'filesystem'],
  ['hall sensor', 'ESP32 has a built-in Hall effect sensor that detects magnetic fields by measuring voltage changes in a conductor.', 'hardware'],
  ['touch', 'ESP32 features capacitive touch sensors on up to 10 GPIO pins, allowing for touch-sensitive buttons without mechanical parts.', 'hardware'],
  ['guru meditation', 'A Guru Meditation Error is a critical system crash on ESP32, often caused by illegal instructions or memory access violations.', 'error'],
  ['panic', 'The Panic handler is triggered when the ESP32 encounters an unrecoverable error, usually resulting in a system reboot.', 'error']
];

for (const [keyword, response, category] of seedKnowledge) {
  insertKnowledge.run(keyword, response, category);
}

const insertSnippet = db.prepare('INSERT OR IGNORE INTO code_snippets (trigger, code, language) VALUES (?, ?, ?)');
const seedSnippets = [
  ['blink', 'void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}', 'cpp'],
  ['wifi', '#include <WiFi.h>\n\nconst char* ssid = "YOUR_SSID";\nconst char* password = "YOUR_PASSWORD";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, password);\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  Serial.println("WiFi connected");\n}', 'cpp'],
  ['pinmode', 'pinMode(${1:pin}, ${2:OUTPUT});', 'cpp'],
  ['digitalwrite', 'digitalWrite(${1:pin}, ${2:HIGH});', 'cpp'],
  ['analogread', 'int val = analogRead(${1:A0});', 'cpp'],
  ['millis', 'unsigned long currentMillis = millis();', 'cpp'],
  ['interrupt', 'attachInterrupt(digitalPinToInterrupt(${1:pin}), ${2:ISR}, ${3:CHANGE});', 'cpp'],
  ['deepsleep', 'esp_sleep_enable_timer_wakeup(${1:TIME_IN_US});\nesp_deep_sleep_start();', 'cpp'],
  ['i2c', '#include <Wire.h>\n\nvoid setup() {\n  Wire.begin();\n}', 'cpp'],
  ['spi', '#include <SPI.h>\n\nvoid setup() {\n  SPI.begin();\n}', 'cpp'],
  ['pwm', 'ledcSetup(${1:channel}, ${2:freq}, ${3:resolution});\nledcAttachPin(${4:pin}, ${1:channel});\nledcWrite(${1:channel}, ${5:duty});', 'cpp'],
  ['eeprom', '#include <EEPROM.h>\n\nvoid setup() {\n  EEPROM.begin(${1:512});\n}', 'cpp'],
  ['ota', '#include <ArduinoOTA.h>\n\nvoid setup() {\n  ArduinoOTA.begin();\n}\n\nvoid loop() {\n  ArduinoOTA.handle();\n}', 'cpp'],
  ['ble', '#include <BLEDevice.h>\n#include <BLEUtils.h>\n#include <BLEServer.h>\n\nvoid setup() {\n  BLEDevice::init("${1:MyESP32}");\n  BLEServer *pServer = BLEDevice::createServer();\n}', 'cpp'],
  ['spiffs', '#include "SPIFFS.h"\n\nvoid setup() {\n  if(!SPIFFS.begin(true)) {\n    Serial.println("SPIFFS Mount Failed");\n  }\n}', 'cpp'],
  ['touch', 'void setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println(touchRead(${1:T0}));\n  delay(1000);\n}', 'cpp']
];

for (const [trigger, code, language] of seedSnippets) {
  insertSnippet.run(trigger, code, language);
}

export const queryOfflineAi = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Try to find a code snippet first
  const snippet = db.prepare("SELECT code FROM code_snippets WHERE ? LIKE '%' || trigger || '%'").get(lowerPrompt) as { code: string } | undefined;
  if (snippet) {
    return {
      type: 'code',
      content: snippet.code
    };
  }

  // Try to find general knowledge
  const knowledge = db.prepare("SELECT response FROM knowledge WHERE ? LIKE '%' || keyword || '%'").get(lowerPrompt) as { response: string } | undefined;
  if (knowledge) {
    return {
      type: 'text',
      content: knowledge.response
    };
  }

  return {
    type: 'text',
    content: "I am currently in Offline Mode. I have limited knowledge about this specific query, but I can help with basic Arduino/ESP32 patterns like 'blink', 'wifi', or 'serial'."
  };
};

export const getOfflineCompletions = (prefix: string) => {
  const lowerPrefix = prefix.toLowerCase();
  
  // Find matching keywords or triggers
  const keywords = db.prepare("SELECT keyword as label, response as detail, 'keyword' as type FROM knowledge WHERE keyword LIKE ? || '%' LIMIT 5").all(lowerPrefix) as { label: string, detail: string, type: string }[];
  const snippets = db.prepare("SELECT trigger as label, code as detail, 'snippet' as type FROM code_snippets WHERE trigger LIKE ? || '%' LIMIT 5").all(lowerPrefix) as { label: string, detail: string, type: string }[];
  
  return [...keywords, ...snippets].map(item => ({
    label: item.label,
    detail: item.detail.substring(0, 50) + (item.detail.length > 50 ? '...' : ''),
    insertText: item.type === 'snippet' ? item.detail : item.label,
    type: item.type
  }));
};
