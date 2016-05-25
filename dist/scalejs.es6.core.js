'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejs = require('./scalejs.base');

var _scalejs2 = _interopRequireDefault(_scalejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Imports
var has = _scalejs2.default.object.has,
    is = _scalejs2.default.type.is,
    extend = _scalejs2.default.object.extend,
    addOne = _scalejs2.default.array.addOne,
    error = _scalejs2.default.log.error,


/**
 * Holds the core
 * @property self
 * @type Object
 * @memberOf core
 * @private
 */
self = {},

/**
 * Holds extensions for the core and sandbox
 * @property extensions
 * @type Array
 * @memberOf core
 * @private
 */
extensions = [],

/**
 * Holds application event listeners
 * @property applicationEventListeners
 * @type Array
 * @memberOf core
 * @private
 */
applicationEventListeners = [],

/**
 * Holds the current application state
 * @property isApplicationRunning
 * @type Boolean
 * @memberOf core
 * @private
 */
_isApplicationRunning = false;

/**
 * Registers an extension to the sandbox
 *
 * @param {Function|Object} extension function to create the extension or
 *                                    object representing the extension
 * @memberOf core
 */
/**
 * Provides core functionality of scalejs
 * @namespace scalejs.core
 * @module core
 */

/*global define*/
function registerExtension(extension) {
    try {
        var ext; // Actual extension

        if (is(extension, 'buildCore', 'function')) {
            // If extension has buildCore function then give it an instance of the core.
            extension.buildCore(self);
            addOne(extensions, extension);
            return; // No need to extend as that will be handled in buildCore
        }

        if (is(extension, 'function')) {
            // If extension is a function then give it an instance of the core.
            ext = extension(self);
        } else if (has(extension, 'core')) {
            // If extension has `core` property then extend core with it.
            ext = extension.core;
        } else {
            // Otherwise extend core with the extension itself.
            ext = extension;
        }

        if (ext) {
            extend(self, ext);
            addOne(extensions, extension);
        }
    } catch (ex) {
        error('Fatal error during application initialization. ', 'Failed to build core with extension "', extension, 'See following exception for more details.', ex);
    }

    return extension;
}

/**
 * Builds a sandbox from the current list of extensions
 *
 * @param {String} id identifier for the sandbox
 * @memberOf core
 * @return {Object} object representing the built sandbox
 */
function buildSandbox(id) {
    if (!has(id)) {
        throw new Error('Sandbox name is required to build a sandbox.');
    }

    // Create module instance specific sandbox
    var sandbox = {
        type: self.type,
        object: self.object,
        array: self.array,
        log: self.log
    };

    // Add extensions to sandbox
    extensions.forEach(function (extension) {
        try {

            // If extension has buildSandbox method use it to build sandbox
            if (is(extension, 'buildSandbox', 'function')) {
                extension.buildSandbox(sandbox);
            }

            // If extension has a sandbox object add it
            else if (has(extension, 'sandbox')) {
                    extend(sandbox, extension.sandbox);
                }

                // Otherwise extend the sandbox with the extension
                else {
                        extend(sandbox, extension);
                    }
        } catch (ex) {
            error('Fatal error during application initialization. ', 'Failed to build sandbox with extension "', extension, 'See following exception for more details.', ex);
            throw ex;
        }
    });

    return sandbox;
}

/**
 * Adds a listener to the application event
 *
 * @param {Function} listener called on application event
 * @param {String}   listener.message event description
 * @memberOf core
 */
function onApplicationEvent(listener) {
    applicationEventListeners.push(listener);
}

/**
 * Notify the event listeners the application has started
 *
 * @memberOf core
 */
function notifyApplicationStarted() {
    if (_isApplicationRunning) {
        return;
    }

    _isApplicationRunning = true;
    applicationEventListeners.forEach(function (listener) {
        listener('started');
    });
}

/**
 * Notify the event listeners the application has stopped
 *
 * @memberOf core
 */
function notifyApplicationStopped() {
    if (!_isApplicationRunning) {
        return;
    }

    _isApplicationRunning = false;
    applicationEventListeners.forEach(function (listener) {
        listener('stopped');
    });
}

/**
 * Constant for notifying application start
 *
 * @property STARTED
 * @type String
 * @memberOf core
 */
Object.defineProperty(self, 'STARTED', {
    value: 'started',
    writable: false
});

/**
 * Constant for notifying application stop
 *
 * @property STOPPED
 * @type String
 * @memberOf core
 */
Object.defineProperty(self, 'STOPPED', {
    value: 'stopped',
    writable: false
});

exports.default = extend(self, {
    type: _scalejs2.default.type,
    object: _scalejs2.default.object,
    array: _scalejs2.default.array,
    log: _scalejs2.default.log,
    buildSandbox: buildSandbox,
    notifyApplicationStarted: notifyApplicationStarted,
    notifyApplicationStopped: notifyApplicationStopped,
    onApplicationEvent: onApplicationEvent,
    registerExtension: registerExtension,
    /**
     * Accesses the current state of the application
     *
     * @memberOf core
     * @return {Boolean} state of the application
     */
    isApplicationRunning: function isApplicationRunning() {
        return _isApplicationRunning;
    }

});