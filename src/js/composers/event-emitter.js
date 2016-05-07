import EventEmitter from "events";

// extend the target object with the native node.js EventEmitter functionality
// see here for documentation https://nodejs.org/api/events.html
export const EventEmitterModule = target => {

  const instance = new EventEmitter();

  Object.keys( EventEmitter.prototype ).forEach( member => {
    target.prototype[ member ] = instance[ member ];
  } );

  return target;

};
