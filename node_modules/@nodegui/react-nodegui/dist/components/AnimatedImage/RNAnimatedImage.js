"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNAnimatedImage = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNText_1 = require("../Text/RNText");
const helpers_1 = require("../../utils/helpers");
const phin_1 = __importDefault(require("phin"));
const setAnimatedImageProps = (widget, newProps, oldProps) => {
    const setter = {
        set src(imageUrlOrPath) {
            if (!imageUrlOrPath) {
                return;
            }
            getLoadedQMovie(imageUrlOrPath)
                .then((movie) => {
                var _a;
                widget.setMovie(movie);
                (_a = widget.movie()) === null || _a === void 0 ? void 0 : _a.start();
            })
                .catch(console.warn);
        },
        set buffer(imageBuffer) {
            var _a;
            const movie = new nodegui_1.QMovie();
            movie.loadFromData(imageBuffer);
            widget.setMovie(movie);
            (_a = widget.movie()) === null || _a === void 0 ? void 0 : _a.start();
        },
    };
    Object.assign(setter, newProps);
    (0, RNText_1.setTextProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNAnimatedImage extends nodegui_1.QLabel {
    setProps(newProps, oldProps) {
        setAnimatedImageProps(this, newProps, oldProps);
    }
    appendInitialChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    appendChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    insertBefore(child, beforeChild) {
        (0, helpers_1.throwUnsupported)(this);
    }
    removeChild(child) {
        (0, helpers_1.throwUnsupported)(this);
    }
    scaleMovie(size) {
        const movie = this.movie();
        movie === null || movie === void 0 ? void 0 : movie.setScaledSize(size);
    }
}
exports.RNAnimatedImage = RNAnimatedImage;
RNAnimatedImage.tagName = "animatedimage";
function getLoadedQMovie(imageUrlOrPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const movie = new nodegui_1.QMovie();
        if ((0, helpers_1.isValidUrl)(imageUrlOrPath)) {
            const res = yield (0, phin_1.default)(imageUrlOrPath);
            const imageBuffer = Buffer.from(res.body);
            movie.loadFromData(imageBuffer);
        }
        else {
            movie.setFileName(imageUrlOrPath);
        }
        return movie;
    });
}
