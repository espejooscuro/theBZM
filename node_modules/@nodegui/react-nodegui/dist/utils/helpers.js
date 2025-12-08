"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUrl = exports.throwUnsupported = void 0;
function throwUnsupported(instance) {
    throw new Error(`Unsupported operation performed in ${instance.constructor.name}`);
}
exports.throwUnsupported = throwUnsupported;
function isValidUrl(str) {
    try {
        const url = new URL(str);
        return url.protocol === "http" || url.protocol === "https";
    }
    catch (_) {
        return false;
    }
}
exports.isValidUrl = isValidUrl;
