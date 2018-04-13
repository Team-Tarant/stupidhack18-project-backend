

class Step {
  type: {
    'start',
    'home',
    'alko',
    'fast_food',
    'bar',
    'grocery'
  } = null;
  start_location: {
    lat: number,
    lng: number
  } = null;
  end_location: {
    lat: number,
    lng: number
  } = null;
  directions: Direction[] = null;

  constructor(obj) {
    Object.keys(this).forEach(key => {
      if (key === 'directions') {
        this.directions = obj['steps'];
      } else this[key] = obj[key];
    });
  }
}

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
  steps: Step[] = null

  constructor(obj) {
    Object.keys(this).forEach(key => {
      if (key === 'steps') {
        this.steps = obj['legs']
          .map(o => new Step(o));
      } else this[key] = obj[key];
    });
  }
}