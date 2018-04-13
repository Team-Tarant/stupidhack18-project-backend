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
    let route = await this.routeService.findALITRouteToDestination(
      { lat: 60.1692884, lng: 24.9211845 },
      ''
    )
    res.status(200).json(route)
  }

  initRoute() {
    this.route.get('/getRoute', this.getRoute.bind(this))
    return this.route
  }
}
