// this function is a nearly straight copy of
// https://github.com/cujojs/when/blob/master/pipeline.js
// because webpack seems to think that referencing that
// module directly is using pre-minified code...
// so this is really a kinda silly hack to get around that
import when from "when";

export default function pipeline( tasks ) {
  let runTask = function( args, task ) {
    runTask = function( arg, task ) {
      return task( arg );
    };

    return task.apply( null, args );
  };

  return when.Promise.all( Array.prototype.slice.call( arguments, 1 ) ).then( function( args ) {
    return when.reduce( tasks, function( arg, task ) {
      return runTask( arg, task );
    }, args );
  } );
};
