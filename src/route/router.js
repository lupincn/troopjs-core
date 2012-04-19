/*!
 * TroopJS route/router module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/widget", "../util/uri" ], function RouteRouterModule(Compose, Widget, URI) {
	var NULL = null;

	return Widget.extend(function RouteRouterWidget($element, name) {
		var self = this;
		var oldUri = NULL;
		var newUri = NULL;

		Compose.call(self, {
			"dom/hashchange" : function onHashChange(topic, $event) {
				// Create URI
				uri = URI($event.target.location.hash.replace(/^#/, ""));

				newUri = uri.toString();

				if (newUri !== oldUri) {
					oldUri = newUri;

					self.publish("route", uri);
				}
			}
		});
	}, {
		"hub:memory/application/state" : function onState(topic, state) {
			if (state === "started") {
				this.trigger("hashchange");
			}
		}
	});
});