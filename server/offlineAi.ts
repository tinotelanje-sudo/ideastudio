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

// Seed some initial data if empty
const rowCount = db.prepare('SELECT count(*) as count FROM knowledge').get() as { count: number };
if (rowCount.count === 0) {
  const insertKnowledge = db.prepare('INSERT INTO knowledge (keyword, response, category) VALUES (?, ?, ?)');
  insertKnowledge.run('blink', 'To blink an LED, you need to set the pin mode to OUTPUT in setup() and then toggle the pin HIGH and LOW with a delay in loop().', 'arduino');
  insertKnowledge.run('serial', 'Use Serial.begin(9600) to start serial communication. Use Serial.println() to send data to the computer.', 'arduino');
  insertKnowledge.run('esp32', 'The ESP32 is a powerful microcontroller with integrated WiFi and Bluetooth. It has more GPIOs and faster clock speed than Arduino Uno.', 'hardware');
  
  const insertSnippet = db.prepare('INSERT INTO code_snippets (trigger, code, language) VALUES (?, ?, ?)');
  insertSnippet.run('blink', 'void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}', 'cpp');
  insertSnippet.run('wifi', '#include <WiFi.h>\n\nconst char* ssid = "YOUR_SSID";\nconst char* password = "YOUR_PASSWORD";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, password);\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  Serial.println("WiFi connected");\n}', 'cpp');
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
  const keywords = db.prepare("SELECT keyword as label, response as detail FROM knowledge WHERE keyword LIKE ? || '%' LIMIT 5").all(lowerPrefix) as { label: string, detail: string }[];
  const snippets = db.prepare("SELECT trigger as label, code as detail FROM code_snippets WHERE trigger LIKE ? || '%' LIMIT 5").all(lowerPrefix) as { label: string, detail: string }[];
  
  return [...keywords, ...snippets].map(item => ({
    label: item.label,
    detail: item.detail.substring(0, 50) + '...',
    insertText: item.detail.includes('\n') ? item.detail : item.label
  }));
};
