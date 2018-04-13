import * as express from 'express'
import RouteService from '../services/RouteService'

export default class RouteController {
  route: express.Router
  routeService: RouteService
  constructor() {
    this.route = express.Router()
    this.routeService = new RouteService()
  }

  async getRoute(req: express.Request, res: express.Response) {
    let locationString = req.query.startLocation.split('%2C')
    let startLocation = { lat: locationString[0], lng: locationString[1] }

    let route = await this.routeService.findALITRouteToDestination(
      startLocation,
      req.query.homeAddress
    )
    res.status(200).json(route)
  }

  initRoute() {
    this.route.get('/getRoute', this.getRoute.bind(this))
    return this.route
  }
}
