import * as express from 'express';
import * as bodyParser from 'body-parser';

let app: express.Application = express();

app.get('/', (req, res) => res.json(process.env));

app.listen(3000);