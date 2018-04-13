class Direction {
  distance: {
    text: string,
    value: number
  } = null;
  duration: {
    text: string,
    value: number
  } = null;
  end_location: {
    lat: number,
    lng: number
  } = null;
  html_instructions: string = null;
  maneuver: string = null;
  start_location: {
    lat: number,
    lng: number
  } = null;

  constructor(obj) {
    Object.keys(this).forEach(key => {
      this[key] = obj[key];
    });
  }
}

export default class Route {
  waypoint_order: number[] = null;
  summary: string = null;
  directions: Direction[] = null

  constructor(obj) {
    Object.keys(this).forEach(key => {
      if (key === 'directions') {
        this.directions = obj['legs']
          .map(o => o.steps)
          .reduce((a, b) => a.concat(b))
          .map(o => new Direction(o));
      } else this[key] = obj[key];
    });
  }
}