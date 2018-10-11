(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/Global.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '87c30RXa+9Mq6yZlEUkCgO8', 'Global', __filename);
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
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Global.js.map
        