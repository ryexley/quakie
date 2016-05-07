import postal from "postal";
import DiagnosticsWireTap from "postal.diagnostics";
import { EventEmitterModule as EventEmitter } from "./event-emitter";

const messenger = ( { target, channelName = "app" } ) => {

  class MessengerModule extends target {
    constructor() {
      super();

      this.channelName = channelName;
      this.channel = postal.channel( channelName );
      this._messaging = {};
    }

    /*
      examples:
        this.publish( "some.topic", { some: "data" } );
    */
    publish( topic, data ) {
      return this.channel.publish.call( this.channel, {
        topic,
        data
      } );
    }

    /*
      examples:
        this.subscribe( { topic: "some.topic", handler } );
        this.subscribe( { channel: "some-channel", topic: "some.topic", handler } );
    */
    subscribe( { channel = this.channelName, topic, handler } ) {
      const key = `${ channel } ${ topic }`;
      let subscription = {};

      if ( channel !== this.channelName ) {
        subscription = postal.subscribe( { channel, topic, callback: handler } ).context( this );
      } else {
        subscription = this.channel.subscribe( topic, handler ).context( this );
      }

      if ( !this._messaging.subscriptions ) {
        this._messaging.subscriptions = {};
      }

      this._messaging.subscriptions[ key ] = subscription;

      return subscription.context( this );
    }

    /*
      examples:
        this.clearSubscriptions();
    */
    clearSubscriptions() {
      if ( this._messaging.subscriptions ) {
        this._messaging.subscriptions.forEach( subscription => {
          subscription.unsubscribe();
        } );
      }

      this._messaging.subscriptions = {};
    }

    /*
      examples:
        this.startWiretap( {} ); // defaults, enable and set active
        this.startWiretap( { enable: ( "some boolean expression here" ) } ); // enable wiretapping dynamically
    */
    startWiretap( { enable = true, active = true } ) {
      if ( enable && !!!postal.wireTaps.length ) {
        this._messaging.wiretap = new DiagnosticsWireTap( {
          name: "console",
          active,
          writer( output ) {
            console.log( "%cPostal message:", "color: #390", JSON.parse( output ) );
          }
        } );
      }
    }

    /*
      examples:
        this.stopWiretap( {} ); // defaults, removes existing wiretap
        this.stopWiretap( { kill: false } ); // disable the wiretap, but don't remove it

      TODO:
        * add the ability to nuke all postal wiretaps altogether?
    */
    stopWiretap( { kill = true } ) {
      if ( kill ) {
        this._messaging.wiretap.removeWiretap();
      } else {
        this._messaging.wiretap.active = false;
      }
    }
  };

  MessengerModule = EventEmitter( MessengerModule );

  return MessengerModule;
};

export default messenger;
