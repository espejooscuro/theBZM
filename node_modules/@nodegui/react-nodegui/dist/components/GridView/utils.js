"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDisplacedChildren = exports.offsetForIndex = void 0;
const offsetForIndex = (index, items, sizeKey) => {
    var _a;
    let offset = 0;
    if (index > 0) {
        const previousChild = items[index - 1];
        offset = previousChild.offset + ((_a = previousChild.data[sizeKey]) !== null && _a !== void 0 ? _a : 1);
    }
    return offset;
};
exports.offsetForIndex = offsetForIndex;
function updateDisplacedChildren(startIndex, items, parent, sizeKey, setParentFuncKey) {
    var _a, _b, _c;
    let offset = (0, exports.offsetForIndex)(startIndex, items, sizeKey);
    for (let i = startIndex; i < items.length; i++) {
        const displacedChild = items[i];
        displacedChild.offset = offset;
        (_b = (_a = displacedChild.data)[setParentFuncKey]) === null || _b === void 0 ? void 0 : _b.call(_a, parent, offset);
        offset += (_c = displacedChild.data[sizeKey]) !== null && _c !== void 0 ? _c : 1;
    }
}
exports.updateDisplacedChildren = updateDisplacedChildren;
;
