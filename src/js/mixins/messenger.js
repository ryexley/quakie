import { extend } from "lodash";
import postal from "postal";
import DiagnosticsWireTap from "postal.diagnostics";
import eventEmitterMixin from "./event-emitter";

const messenger = extend( {

  ensureMessagingState() {
    this._messaging = this._messaging || { subscriptions: {}, wiretap: {} };
  },

  /*
    examples:
      this.publish( "some.topic", { some: "data" } );
  */
  publish( { channel = "app", topic, data = {} } ) {
    return postal.publish( {
      channel,
      topic,
      data
    } );
  },

  /*
    examples:
      this.subscribe( { topic: "some.topic", handler } );
      this.subscribe( { channel: "some-channel", topic: "some.topic", handler } );
  */
  subscribe( { channel = "app", topic, handler } ) {
    this.ensureMessagingState();

    const key = `${ channel } ${ topic }`;
    let subscription = {};

    subscription = postal.subscribe( { channel, topic, callback: handler } ).context( this );

    if ( !this._messaging.subscriptions ) {
      this._messaging.subscriptions = {};
    }

    this._messaging.subscriptions[ key ] = subscription;

    return subscription.context( this );
  },

  /*
    examples:
      this.clearSubscriptions();
  */
  clearSubscriptions() {
    if ( this._messaging && this._messaging.subscriptions ) {
      this._messaging.subscriptions.forEach( subscription => {
        subscription.unsubscribe();
      } );

      this._messaging.subscriptions = {};
    }
  },

  /*
    examples:
      this.startWiretap( {} ); // defaults, enable and set active
      this.startWiretap( { enable: ( "some boolean expression here" ) } ); // enable wiretapping dynamically
  */
  startWiretap( { enable = true, active = true } ) {
    if ( enable && !!!postal.wireTaps.length ) {
      this.ensureMessagingState();

      this._messaging.wiretap = new DiagnosticsWireTap( {
        name: "console",
        active,
        writer( output ) {
          console.log( "%cPostal message:", "color: #390", JSON.parse( output ) );
        }
      } );
    }
  },

  /*
    examples:
      this.stopWiretap( {} ); // defaults, removes existing wiretap
      this.stopWiretap( { kill: false } ); // disable the wiretap, but don't remove it

    TODO:
      * add the ability to nuke all postal wiretaps altogether?
  */
  stopWiretap( { kill = true } ) {
    this.ensureMessagingState();

    if ( kill ) {
      this._messaging.wiretap.removeWiretap();
    } else {
      this._messaging.wiretap.active = false;
    }
  }

}, eventEmitterMixin() );

export default messenger;
