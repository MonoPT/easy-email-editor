import express from "express"
import fs from "fs";

import path from "path"
import cors from "cors"

const app = express();

app.use(cors(
  {
    origin: '*', // Permitir todas as origens
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type,Authorization' // Cabeçalhos permitidos
  }
));


let currentPath = process.cwd();

app.get('/api/templates', (req, res) => {
  let filenames = fs.readdirSync(`${currentPath}/src/templates`);

  let templates = [];

  filenames.forEach(file => {
    if (!file.endsWith(".json")) return;

    let data = fs.readFileSync(`${currentPath}/src/templates/${file}`, { encoding: 'utf-8' });

    data = JSON.parse(data);
    data.path = file;

    templates.push(data);
  });

  res.json(templates);
});

app.listen(4000, () => console.log('Backend running on port 4000'));