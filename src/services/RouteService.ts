import * as axios from 'axios'
import * as fs from 'fs';
import Route from '../models/Route'
import ServiceError from '../utils/ServiceError';

// assumes query is obj with string keys and values
const querify = (key, value) => `${key}=${encodeURIComponent(value)}`;

const formatQuery = query => {
  const queryArray = Object.keys(query).reduce((acc, key) => {
    const value = query[key];
    if (value === undefined || value === null) {
      // skip undefineds
      return acc;
    }
    return [...acc, querify(key, value)];
  }, []);
  return queryArray.join('&');
};

export default class RouteService {
  constructor() { }

  private async getDirectionsHome(startLocation: { lat: number; lng: number }, endLocation: string, waypoints: string[] | null = null): Promise<Route> {
    let waypointString = waypoints ? waypoints.join('|') : null;
    let res;

    const query = formatQuery({
      origin: `${startLocation.lat},${startLocation.lng}`,
      destination: endLocation,
      mode: 'walking',
      waypoints,
      key: process.env.GOOGLE_MAPS_API_KEY
    })
    try {
      res = await axios.default.get(
        `https://maps.googleapis.com/maps/api/directions/json?${query}`
      )
    } catch (e) {
      console.error(e);
      throw new ServiceError(500, e.message);
    }
    let route = new Route(res.data.routes[0]);
    return route;
  }

  private async getWaypoints(waypointSearchLocation: { lat: number; lng: number }) {
    const params = {
      location: waypointSearchLocation,
      type: 'restaurant|liquor_store|bar|park|food',
      radius: 10000
    }

    const query = formatQuery({
      key: process.env.GOOGLE_MAPS_API_KEY,
      location: `${params.location.lat},${params.location.lng}`,
      radius: params.radius,
      type: params.type
    });
    let places = await axios.default.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${query}`
    )
    let placesArray = places.data.results
    /* let randomNumbers = [];
     let i = 0
     while (i <= Math.floor(Math.random()) + 1) {
       i++
       randomNumbers.push(Math.floor(Math.random() * placesArray.length))
     }
     let locationIDs = randomNumbers.map(
       idx => 'place_id:' + placesArray[idx].place_id
     )*/
    let locationIDs = ['place_id:' + placesArray[0].place_id, 'place_id:' + placesArray[1].place_id];
    return locationIDs;
  }

  async findALITRouteToDestination(
    startLocation: { lat: number; lng: number },
    homeAddress: string
  ): Promise<Route> {

    let routeHome = await this.getDirectionsHome(startLocation, homeAddress);
    let waypointSearchLocations: { lat: number; lng: number }[] = [];
    let homeRouteStepAmount = routeHome.steps[0].directions.length;

    let i = 0
    while (i <= Math.floor((Math.log10(homeRouteStepAmount) * 2))) {
      i++
      waypointSearchLocations.push(routeHome.steps[0].directions[Math.floor(Math.random() * homeRouteStepAmount)].end_location)
    }

    let locationIDs = [];
    let promiseArray: Promise<any>[] = [];
    for (let loc of waypointSearchLocations) {
      promiseArray.push(this.getWaypoints(loc));
    }

    try {
      locationIDs = await Promise.all(promiseArray);
    } catch (e) {
      console.error(e);
      throw new ServiceError(500, e.message);
    }

    let waypoints = locationIDs.map(a => a.join('|')).join('|');
    let res;
    try {
      const query = formatQuery({
        origin: 'Leppäsuonkatu 11, Helsinki',
        destination: homeAddress,
        mode: 'walking',
        waypoints: waypoints,
        key: process.env.GOOGLE_MAPS_API_KEY
      })
      res = await axios.default.get(
        `https://maps.googleapis.com/maps/api/directions/json?${query}`
      )
    } catch (e) {
      console.error(e);
      throw new ServiceError(500, e.message);
    }
    let route = new Route(res.data.routes[0])

    let geocodedWaypoints = res.data.geocoded_waypoints
    route.steps.forEach((step, i) => {
      let gcwp = geocodedWaypoints[i + 1]
      step.locationTypes = gcwp.types
    })
    return route
  }
}
