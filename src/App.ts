require('dotenv').config();
import * as express from 'express';
import * as bodyParser from 'body-parser';
import RouteController from './controllers/RouteController';

let app: express.Application = express();

let routeController = new RouteController();

app.use('/api/routes', routeController.initRoute());

app.listen(3001);