import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('feed');
  this.route('profile');
  this.route('messages', function() {
    this.route('message', {path: "/:id"});
  });
});

export default Router;
