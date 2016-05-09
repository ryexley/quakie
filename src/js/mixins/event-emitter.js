import EventEmitter from "events";

// extend the target object with the native node.js EventEmitter functionality
// see here for documentation https://nodejs.org/api/events.html
// export const EventEmitterModule = target => {
export default () => {

  const instance = new EventEmitter();
  let mixin = {};

  Object.keys( EventEmitter.prototype ).forEach( member => {
    mixin[ member ] = instance[ member ];
  } );

  return mixin;

};
