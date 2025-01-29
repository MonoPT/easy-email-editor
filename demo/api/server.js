import express from "express"
import fs from "fs";

import cors from "cors"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = `${__dirname}/../src/templates`;

app.use(cors(
  {
    origin: '*', // Permitir todas as origens
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type,Authorization' // Cabeçalhos permitidos
  }
));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.get('/api/templates', (req, res) => {
  let filenames = fs.readdirSync(`${path}/`);

  let templates = [];

  filenames.forEach(file => {
    if (!file.endsWith(".json")) return;

    let data = fs.readFileSync(`${path}/${file}`, { encoding: 'utf-8' });

    data = JSON.parse(data);
    data.path = file;

    templates.push(data);
  });

  res.json(templates);
});

app.post("/api/template", (req, res) => {
  let uuid = uuidv4();

  const requestBody = req.body;

  if (requestBody.uuid.length > 0) {
    uuid = requestBody.uuid;
  }

  saveBase64Image(requestBody.picture, `${path}/pictures/${uuid}.png`)

  requestBody.picture = `/src/templates/pictures/${uuid}.png`;

  saveJsonToFile(requestBody, `${path}/${uuid}.json`);

  res.json({ received: requestBody });
})

app.listen(4000, () => console.log('Backend running on port 4000'));

function saveBase64Image(base64String, filePath) {
  // Remove the base64 prefix (data:image/png;base64,)
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

  // Convert base64 string to binary data
  const buffer = Buffer.from(base64Data, 'base64');

  // Write the buffer to a file
  fs.writeFile(filePath, buffer, (err) => {
      if (err) {
          console.error('Error saving image:', err);
      } else {
          console.log('Image saved successfully!');
      }
  });
}

function saveJsonToFile(data, filePath) {
  // Convert the JavaScript object to a JSON string
  const jsonString = JSON.stringify(data, null, 2); // Pretty print with 2 spaces for indentation

  // Write the JSON string to the file
  fs.writeFile(filePath, jsonString, (err) => {
      if (err) {
          console.error('Error saving JSON:', err);
      } else {
          console.log('JSON saved successfully!');
      }
  });
}