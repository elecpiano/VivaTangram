"use strict";
cc._RF.push(module, '87c30RXa+9Mq6yZlEUkCgO8', 'Global');
// Script/Global.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GlobalData = /** @class */ (function (_super) {
    __extends(GlobalData, _super);
    function GlobalData() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.SelectedItemIndex = 0;
        _this.NavigatedFromListView = false;
        return _this;
    }
    GlobalData.prototype.onLoad = function () {
        cc.game.addPersistRootNode(this.node);
    };
    GlobalData = __decorate([
        ccclass
    ], GlobalData);
    return GlobalData;
}(cc.Component));
exports.default = GlobalData;

cc._RF.pop();