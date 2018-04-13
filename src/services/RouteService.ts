import * as axios from 'axios';
import Route from '../models/Route';

export default class RouteService {
  constructor() { }

  async findALITRouteToDestination(): Promise<Route> {
    let res = await axios.default.get(`https://maps.googleapis.com/maps/api/directions/json?origin=Leppasuonkatu%2011,%20Helsinki&destination=Opastinsilta%202%20a&mode=walking&waypoints=McDonalds%20Vantaa,%20Helsinki|Alko%20Pasila,%20Helsinki&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    let route = new Route(res.data.routes[0]);

    let geocodedWaypoints = res.data.geocoded_waypoints;
    route.steps.forEach((step, i) => {
      let gcwp = geocodedWaypoints[i + 1];
      step.locationTypes = gcwp.types;
    });
    return route;

  }
}