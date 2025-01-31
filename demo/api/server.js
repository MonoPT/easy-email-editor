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

    delete data.data;

    templates.push(data);
  });

  templates = templates.sort((a, b) => b.created_at - a.created_at);


  res.json(templates);
});

app.get('/api/folders', (req, res) => {
  let data = fs.readFileSync(`${__dirname}/folders.json`, { encoding: 'utf-8' });

  res.json(JSON.parse(data));
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

  res.json({ uuid });
})

app.post("/api/template/duplicate", (req, res) => {
  const requestBody = req.body;
  let uuid = uuidv4();

  let email_to_clone = requestBody.uuid;

  const timestamp = Math.floor(Date.now() / 1000);

  loadJsonFile(`${path}/${email_to_clone}.json`, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "file with uuid " + email_to_clone + " does not exist"
      })
    }

    fs.copyFile(`${path}/pictures/${email_to_clone}.png`, `${path}/pictures/${uuid}.png`, (err) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Image cloned successfully!');
      }
    });

    data.created_at = timestamp;
    data.updated_at = timestamp;
    data.uuid = uuid
    data.picture = `/src/templates/pictures/${uuid}.png`

    saveJsonToFile(data, `${path}/${uuid}.json`)

    return res.status(200).json({
      uuid
    })
  })
})

app.delete("/api/template/", (req, res) => {
  const requestBody = req.body;

  let uuid = requestBody.uuid;

  fs.unlink(`${path}/${uuid}.json`, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully!');
    }
  });

  fs.unlink(`${path}/pictures/${uuid}.png`, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully!');
    }
  });

  return res.status(200).json("ok");
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

function loadJsonFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      callback(err, null);  // Return error if there was one
    } else {
      try {
        const jsonData = JSON.parse(data);  // Parse the JSON data
        callback(null, jsonData);  // Return the parsed data
      } catch (parseError) {
        callback(parseError, null);  // Return parse error if there's an issue with JSON format
      }
    }
  });
}