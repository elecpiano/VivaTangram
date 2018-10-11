(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/Dictionary.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'd790dkXYCFCbIiNERCjHrQf', 'Dictionary', __filename);
// Script/Dictionary.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary = /** @class */ (function () {
    function Dictionary() {
        this.keys = [];
        this.values = [];
    }
    Dictionary.prototype.Add = function (key, value) {
        this.keys.push(key);
        this.values.push(value);
    };
    Dictionary.prototype.Remove = function (key) {
        var index = this.keys.indexOf(key, 0);
        this.keys.splice(index, 1);
        this.values.splice(index, 1);
    };
    Dictionary.prototype.TryGetValue = function (key) {
        var index = this.keys.indexOf(key, 0);
        // console.log("xxx key : " + key);
        // console.log("xxx keys : " + this.keys.length + "/" + this.keys);
        // console.log("xxx index : " + index);
        if (index != -1) {
            return this.values[index];
        }
        return null;
    };
    Dictionary.prototype.ContainsKey = function (key) {
        var ks = this.keys;
        for (var i = 0; i < ks.length; ++i) {
            if (ks[i] == key) {
                return true;
            }
        }
        return false;
    };
    Dictionary.prototype.SetValue = function (key, value) {
        var index = this.keys.indexOf(key, 0);
        if (index != -1) {
            this.keys[index] = key;
            this.values[index] = value;
            return true;
        }
        return false;
    };
    Dictionary.prototype.GetKeys = function () {
        return this.keys;
    };
    Dictionary.prototype.GetValues = function () {
        return this.values;
    };
    return Dictionary;
}());
exports.default = Dictionary;

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
        //# sourceMappingURL=Dictionary.js.map
        