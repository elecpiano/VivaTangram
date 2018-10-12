(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/HomeViewController.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '2a092IUAOxM+JAulEUzDZwV', 'HomeViewController', __filename);
// Script/HomeViewController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var FrameCanvasController_1 = require("./FrameCanvasController");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var HomeViewController = /** @class */ (function (_super) {
    __extends(HomeViewController, _super);
    function HomeViewController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.FrameController = null;
        _this.ShapeCanvas = null;
        _this.NavigatedFromListView = false;
        _this.ShapeCanvasAlphaMax = 150; // 0 is transparent, 255 is filled
        _this.AppearQueue = Array();
        _this.ShownShpaes = Array();
        _this.UnshownShpaes = Array();
        _this.drawDuration = 0.3;
        _this.drawInterval = 0.2;
        _this.drawTimeList = new Array();
        _this.drawingList = new Array();
        _this.TANGRAM_INTERVAL = 0.9;
        _this.IsBusy = false;
        _this.TangramColors = ["#5faace", "#3992bc", "#287ca3", "#19678b", "#105778", "#074561", "#05354b"];
        //["#ffda4c","#52cad1","#ff493a","#3968bc","#ff8e2f","#ca4c89","#55d723"];
        _this.ShowTangramFullColor = false;
        _this.Difficulty = 7; // 0 is most difficult, 7 shows all shapes(without color), 8 shows all shapes with color
        _this.HintColors = ["#5faace", "#3992bc", "#287ca3", "#19678b", "#105778", "#074561", "#05354b"];
        _this.HintColorRemap = Array();
        _this.ParamData = Array();
        _this.Dots = Array();
        _this.Shapes = Array();
        _this.Frames = Array();
        _this.TangramIndex = 0;
        return _this;
        //#endregion
    }
    //#endregion
    //#region Navigation
    HomeViewController.prototype.GoToListView = function () {
        cc.director.loadScene("ListView");
    };
    HomeViewController.prototype.GoToGameBoard = function () {
        cc.director.loadScene("GameBoard");
    };
    //#endregion
    //#region Lifecycle
    HomeViewController.prototype.onLoad = function () {
        this.LoadData();
    };
    HomeViewController.prototype.start = function () {
        var _this = this;
        this.draw = this.ShapeCanvas.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.ShapeCanvas.addComponent(cc.Graphics);
        }
        //show tangram
        this.node.runAction(cc.sequence(cc.delayTime(this.TANGRAM_INTERVAL), cc.callFunc(function () { return _this.ShowNextTangram(); }, this)));
    };
    HomeViewController.prototype.update = function (dt) {
        if (this.drawingList.length > 0) {
            this.UpdateRender(dt);
        }
    };
    //#endregion
    //#region Param Data & Dictionary
    HomeViewController.prototype.LoadData = function () {
        var _this = this;
        cc.loader.loadRes("param", function (error, txt) {
            _this.ParamData = txt.split("\n");
        });
    };
    //#endregion
    //#region Tangram Render
    HomeViewController.prototype.ShowNextTangram = function () {
        var _this = this;
        this.TangramIndex = Math.floor(Math.random() * this.ParamData.length);
        this.IsBusy = true;
        this.ClearTangram();
        this.PrepareParam();
        this.ShowTangramFullColor = this.Difficulty == 8 ? true : false;
        var appearCount = Math.min(this.Difficulty, 7); // this.Difficulty may go up to 8
        this.node.runAction(cc.sequence(cc.callFunc(function () { return _this.FrameController.StartDraw(_this.Dots, _this.Frames); }, this), cc.delayTime(0.5), cc.callFunc(function () { return _this.StartDraw(appearCount); }, this)));
    };
    HomeViewController.prototype.PrepareParam = function () {
        var param = this.ParamData[this.TangramIndex];
        // begin prepare
        var paramArray = param.split("/");
        // dots
        this.Dots.splice(0, this.Dots.length);
        var dotsPositonStr = paramArray[0].split(";");
        for (var i = 0; i < dotsPositonStr.length; i++) {
            var posStr = dotsPositonStr[i];
            var x = Math.round(Number(posStr.split(",")[0]));
            var y = Math.round(Number(posStr.split(",")[1]));
            // let dotPosition = new cc.Vec2(x,512 - y);
            var dotPosition = new cc.Vec2(x * 2, 1024 - y * 2);
            this.Dots.push(dotPosition);
        }
        //shapes
        this.Shapes.splice(0, this.Shapes.length);
        var shapeListStr = paramArray[1].split(";");
        for (var i = 0; i < shapeListStr.length; i++) {
            var shapeStr = shapeListStr[i];
            this.Shapes.push(shapeStr);
        }
        //frames
        this.Frames.splice(0, this.Frames.length);
        var frameListStr = paramArray[2].split(";");
        for (var i = 0; i < frameListStr.length; i++) {
            var frameStr = frameListStr[i];
            this.Frames.push(frameStr);
        }
    };
    HomeViewController.prototype.StartDraw = function (appearCount) {
        if (appearCount > 7) {
            return;
        }
        this.draw.clear();
        // randomize appear queue, populate shown shapes
        var tempQueue = [0, 1, 2, 3, 4, 5, 6];
        this.AppearQueue.splice(0, this.AppearQueue.length);
        this.ShownShpaes.splice(0, this.ShownShpaes.length);
        this.UnshownShpaes.splice(0, this.UnshownShpaes.length);
        while (this.AppearQueue.length < appearCount) {
            var rand = Math.floor(Math.random() * tempQueue.length);
            var idx = tempQueue.splice(rand, 1)[0];
            this.AppearQueue.push(idx);
            this.ShownShpaes.push(idx);
        }
        // randomize hint color
        tempQueue = [0, 1, 2, 3, 4, 5, 6];
        this.HintColorRemap.splice(0, this.HintColorRemap.length);
        while (tempQueue.length > 0) {
            var rand = Math.floor(Math.random() * tempQueue.length);
            var idx = tempQueue.splice(rand, 1)[0];
            this.HintColorRemap.push(idx);
        }
        // drawTimeList
        this.drawTimeList.splice(0, this.drawTimeList.length);
        this.drawTimeList = [0, 0, 0, 0, 0, 0, 0];
        if (this.AppearQueue.length > 0) {
            this.ShowNextShape();
        }
        else {
            this.IsBusy = false;
            this.ShowNextTangram();
        }
    };
    HomeViewController.prototype.ShowNextShape = function () {
        var _this = this;
        if (this.AppearQueue.length > 0) {
            var idx = this.AppearQueue.pop();
            this.drawingList.push(idx); /* this will trigger corresponding drawtime begin to tick */
            this.node.runAction(cc.sequence(cc.delayTime(this.drawInterval), cc.callFunc(function () { return _this.ShowNextShape(); }, this)));
        }
    };
    HomeViewController.prototype.UpdateRender = function (dt) {
        var _this = this;
        var i = 0;
        while (i < this.drawingList.length) {
            if (this.drawTimeList[this.drawingList[i]] >= this.drawDuration) {
                this.drawingList.splice(i, 1);
            }
            else {
                i++;
            }
        }
        for (var i_1 = 0; i_1 < this.drawingList.length; i_1++) {
            var index = this.drawingList[i_1];
            if (this.drawTimeList[index] < this.drawDuration) {
                this.drawTimeList[index] += dt;
            }
        }
        this.draw.clear();
        for (var i_2 = 0; i_2 < this.Shapes.length; i_2++) {
            /* if alpha is greater than 255, it will re-count from 256 */
            var alpha = this.ShapeCanvasAlphaMax * Math.min(this.drawTimeList[i_2], this.drawDuration) / this.drawDuration;
            this.RenderShape(this.Shapes[i_2], i_2, alpha);
        }
        if (this.drawingList.length == 0) {
            this.IsBusy = false;
            // show next tangram
            this.node.runAction(cc.sequence(cc.delayTime(this.TANGRAM_INTERVAL), cc.callFunc(function () { return _this.ShowNextTangram(); }, this)));
        }
    };
    HomeViewController.prototype.RenderShape = function (shapeString, colorIndex, alpha) {
        var dots = shapeString.split(",");
        var startX = 0;
        var startY = 0;
        var i = 0;
        while (i < dots.length) {
            var x = this.Dots[Number(dots[i])].x;
            var y = this.Dots[Number(dots[i])].y;
            if (i == 0) {
                this.draw.moveTo(x, y);
                startX = x;
                startY = y;
            }
            else if (i == (dots.length / -2)) {
                this.draw.lineTo(startX, startY);
            }
            else {
                this.draw.lineTo(x, y);
            }
            i++;
        }
        this.draw.close();
        if (this.ShowTangramFullColor) {
            this.draw.fillColor = cc.hexToColor(this.TangramColors[colorIndex]);
        }
        else {
            this.draw.fillColor = cc.hexToColor(this.HintColors[this.HintColorRemap[colorIndex]]);
        }
        this.draw.fillColor = this.draw.fillColor.setA(alpha);
        this.draw.fill();
    };
    HomeViewController.prototype.ClearTangram = function () {
        this.draw.clear();
        this.FrameController.ClearFrame();
    };
    __decorate([
        property(FrameCanvasController_1.default)
    ], HomeViewController.prototype, "FrameController", void 0);
    __decorate([
        property(cc.Node)
    ], HomeViewController.prototype, "ShapeCanvas", void 0);
    HomeViewController = __decorate([
        ccclass
    ], HomeViewController);
    return HomeViewController;
}(cc.Component));
exports.default = HomeViewController;

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
        //# sourceMappingURL=HomeViewController.js.map
        