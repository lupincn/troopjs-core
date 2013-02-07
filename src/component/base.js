/**
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../event/emitter", "when" ], function ComponentModule(Emitter, when) {
	/*jshint laxbreak:true */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var INSTANCE_COUNT = "instanceCount";
	var LENGTH = "length";
	var VALUE = "value";
	var COUNT = 0;

	var Component = Emitter.extend(
	/**
	 * Creates a new component
	 * @constructor
	 */
	function Component() {
		// Update instance count
		this[INSTANCE_COUNT] = COUNT++;
	}, {
		"instanceCount" : COUNT,

		"displayName" : "core/component",

		/**
		 * Signals the component
		 * @param signal {String} Signal
		 * @return {*}
		 */
		"signal" : function onSignal(signal) {
			var self = this;
			var args = ARRAY_SLICE.call(arguments);
			var signals = self.constructor.specials.sig[signal];
			var length = signals
				? signals[LENGTH]
				: 0;
			var index = 0;

			function next(_args) {
				// Update args
				args = _args || args;

				// Return a chained promise of next callback, or a promise resolved with args
				return length > index
					? when(signals[index++][VALUE].apply(self, args), next)
					: when.resolve(args);
			}

			try {
				// Return promise
				return next();
			}
			catch (e) {
				// Return rejected promise
				return when.reject(e);
			}
		},

		/**
		 * Start the component
		 * @return {*}
		 */
		"start" : function onStart() {
			var self = this;
			var _signal = self.signal;
			var args = [ "initialize" ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return _signal.apply(self, args).then(function _start() {
				// Modify args to change signal
				args[0] = "start";

				return _signal.apply(self, args);
			});
		},

		/**
		 * Stops the component
		 * @return {*}
		 */
		"stop" : function onStop() {
			var self = this;
			var _signal = self.signal;
			var args = [ "stop" ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return _signal.apply(self, args).then(function _stop() {
				// Modify args to change signal
				args[0] = "finalize";

				return _signal.apply(self, args);
			});
		}
	});

	/**
	 * Generates string representation of this object
	 * @returns {string} displayName and instanceCount
	 */
	Component.prototype.toString = function () {
		var self = this;

		return self.displayName + "@" + self[INSTANCE_COUNT];
	};

	return Component;
});
