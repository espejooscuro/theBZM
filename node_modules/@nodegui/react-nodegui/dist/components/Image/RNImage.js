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
exports.RNImage = void 0;
const nodegui_1 = require("@nodegui/nodegui");
const RNText_1 = require("../Text/RNText");
const helpers_1 = require("../../utils/helpers");
const phin_1 = __importDefault(require("phin"));
const setImageProps = (widget, newProps, oldProps) => {
    const setter = {
        set src(imageUrlOrPath) {
            if (!imageUrlOrPath) {
                return;
            }
            getLoadedPixmap(imageUrlOrPath)
                .then((pixmap) => widget.setPixmap(pixmap))
                .catch(console.warn);
        },
        set buffer(imageBuffer) {
            const pixMap = new nodegui_1.QPixmap();
            pixMap.loadFromData(imageBuffer);
            widget.setPixmap(pixMap);
        },
        set aspectRatioMode(mode) {
            widget.setAspectRatioMode(mode);
        },
        set transformationMode(mode) {
            widget.setTransformationMode(mode);
        },
    };
    Object.assign(setter, newProps);
    (0, RNText_1.setTextProps)(widget, newProps, oldProps);
};
/**
 * @ignore
 */
class RNImage extends nodegui_1.QLabel {
    constructor() {
        super(...arguments);
        this.setPixmap = (pixmap) => {
            // react:✓
            super.setPixmap(pixmap);
            this.originalPixmap = pixmap;
        };
    }
    setProps(newProps, oldProps) {
        setImageProps(this, newProps, oldProps);
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
    setAspectRatioMode(mode) {
        // react:✓ TODO://getter
        this.aspectRatioMode = mode;
        this.scalePixmap(this.size());
    }
    setTransformationMode(mode) {
        // react:✓ TODO://getter
        this.transformationMode = mode;
        this.scalePixmap(this.size());
    }
    scalePixmap(size) {
        if (this.originalPixmap) {
            return super.setPixmap(this.originalPixmap.scaled(size.width(), size.height(), this.aspectRatioMode, this.transformationMode));
        }
    }
}
exports.RNImage = RNImage;
RNImage.tagName = "image";
function getLoadedPixmap(imageUrlOrPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pixMap = new nodegui_1.QPixmap();
        if ((0, helpers_1.isValidUrl)(imageUrlOrPath)) {
            const res = yield (0, phin_1.default)(imageUrlOrPath);
            const imageBuffer = Buffer.from(res.body);
            pixMap.loadFromData(imageBuffer);
        }
        else {
            pixMap.load(imageUrlOrPath);
        }
        return pixMap;
    });
}
