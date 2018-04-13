import * as axios from 'axios'
import Route from '../models/Route'

export default class RouteService {
  constructor() {}

  async getDirectionsHome(startLocation: { lat: number; lng: number }, endLocation: string, waypoints: string[] | null = null): Promise<Route> {
    let waypointString = waypoints ? waypoints.join('|') : null;
    let res = await axios.default.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.lat},${startLocation.lng}&destination=Opastinsilta%202%20a&mode=walking${waypoints ? '&waypoints=' + waypoints : ''}&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`
    )
    let route = new Route(res.data.routes[0]);
    return route;
  }

  async findALITRouteToDestination(
    startLocation: { lat: number; lng: number },
    homeAddress: string
  ): Promise<Route> {

    let routeHome = await this.getDirectionsHome(startLocation, homeAddress);
    let waypointSearchLocations: { lat: number; lng: number }[];
    let homeRouteStepAmount = routeHome.steps.length;
    const params = {
      location: startLocation,
      type: 'restaurant|liquor_store|bar|park|food',
      radius: 10000
    }
    let places = await axios.default.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${
        process.env.GOOGLE_MAPS_API_KEY
      }&location=${params.location.lat},${params.location.lng}&radius=${
        params.radius
      }&type=${params.type}`
    )
    let placesArray = places.data.results
    let randomNumbers = []
    let i = 0
    while (i <= Math.floor(Math.random() * 10) + 3) {
      i++
      randomNumbers.push(Math.floor(Math.random() * placesArray.length))
    }
    let locationIDs = randomNumbers.map(
      idx => 'place_id:' + placesArray[idx].place_id
    )
    let waypoints = locationIDs.join('|')
    let res = await axios.default.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=Leppasuonkatu%2011,%20Helsinki&destination=Opastinsilta%202%20a&mode=walking&waypoints=${waypoints}&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`
    )
    let route = new Route(res.data.routes[0])

    let geocodedWaypoints = res.data.geocoded_waypoints
    route.steps.forEach((step, i) => {
      let gcwp = geocodedWaypoints[i + 1]
      step.locationTypes = gcwp.types
    })
    return route
  }
}
