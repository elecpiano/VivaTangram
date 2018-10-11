"use strict";
cc._RF.push(module, 'd790dkXYCFCbIiNERCjHrQf', 'Dictionary');
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