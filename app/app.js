import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

var App;

function isInteractive(elem) {
  var interactive = [
    'input',
    'textarea',
    'select'
  ];

  return interactive.indexOf(elem.tagName.toLowerCase()) !== -1;
}

// FIXME: Deal with repeated attempts to route to the same route.
// TODO: Remove previous tabindex state.

Ember.Route.reopen({
  focus(morph) {
    // The elements we need are in the DOM.
    // ViewNodeManager for the primary outlet of the route.
    var elem = morph.firstNode;

    try {
      if (!elem.getAttribute('tabindex')) {
        if (isInteractive(elem)) {
          elem.setAttribute('tabindex', 0);
        } else {
          elem.setAttribute('tabindex', -1);
        }
      }

      elem.focus();
    } catch (e) {}
  },

  enter(transition) {
    var route = this;

    // Focus "up one level" for index routes.
    // FIXME: Pathing for non-index routes.
    if (transition.pivotHandler && this.routeName == transition.pivotHandler.routeName + '.index') {
      transition.pivot = transition.pivotHandler.routeName;
      route = transition.pivotHandler;
      this._focus(route, transition);
    }

    // Handle fresh entries.
    if (!transition.pivot) {
      transition.pivot = this.routeName;
      this._focus(route, transition)
    }

    return this._super(...arguments);
  },

  _focus(route, transition, parent) {
    var focus = new Ember.RSVP.Promise(function(resolve, reject) {
      this.focusPromiseResolve = resolve;
    }.bind(route));

    // Set up our context for after the transition completes.
    var transitionResolve = (function(transition, route) {
      return function(result) {
        delete transition.pivot;

        Ember.run.scheduleOnce('afterRender', route, function() {
          // The elements we need are in the DOM.
          // The ViewNodeManager for the specific connection is at result.focus.
          route.focus(result.focus)
        });
      };
    })(transition, route);

    // Clean up after ourselves in case there is a transition.retry() call.
    var transitionReject = (function(transition, route) {
      return function() {
        delete transition.pivot;
      };
    })(transition, route);

    Ember.RSVP.hash({ focus, transition })
      .then(transitionResolve)
      .catch(transitionReject);
  }
});

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
