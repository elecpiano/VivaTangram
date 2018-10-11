(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/ListItemController.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'fd9659URZtLn6f1jTgsiHX0', 'ListItemController', __filename);
// Script/ListItemController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ListItemController = /** @class */ (function (_super) {
    __extends(ListItemController, _super);
    function ListItemController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.DRAW_DURATION = 0.4;
        _this.drawTime = 0;
        _this.drawing = false;
        _this.Dots = Array();
        _this.Shapes = Array();
        _this.Frames = Array();
        _this.Route = Array();
        _this.LINE_WIDTH = 15;
        _this.STROKE_COLOR = "#353535";
        _this.FILL_COLOR = "#ffda4c";
        _this.TangramColors = ["#ffda4c", "#52cad1", "#ff493a", "#3968bc", "#ff8e2f", "#ca4c89", "#55d723"];
        _this.ShowShape = false;
        return _this;
        //#endregion
        //#region Test
        //#endregion
    }
    //#endregion
    //#region Lifecycle
    ListItemController.prototype.start = function () {
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }
        this.draw.fillColor = cc.hexToColor(this.FILL_COLOR);
        this.draw.lineWidth = this.LINE_WIDTH;
        this.draw.strokeColor = cc.hexToColor(this.STROKE_COLOR);
    };
    ListItemController.prototype.update = function (dt) {
        if (this.drawing) {
            if (this.drawTime > this.DRAW_DURATION) {
                this.FinishDraw();
            }
            else {
                this.UpdateDraw(dt);
            }
        }
    };
    //#endregion
    //#region Frame
    ListItemController.prototype.Show = function (dots, shapes, frames, showShape) {
        this.Dots = dots;
        this.Shapes = shapes;
        this.Frames = frames;
        this.ShowShape = showShape;
        this.StartDraw();
    };
    ListItemController.prototype.StartDraw = function () {
        this.draw.clear();
        this.drawTime = 0;
        this.drawing = true;
        //scale animation
        this.node.setScale(0.2, 0.2);
        this.node.runAction(cc.sequence(cc.scaleTo(this.DRAW_DURATION * 0.5, 0.38, 0.38), cc.scaleTo(this.DRAW_DURATION * 0.5, 0.3, 0.3)));
    };
    ListItemController.prototype.UpdateDraw = function (dt) {
        this.drawTime += dt;
        this.draw.clear();
        /* if alpha is greater than 255, it will re-count from 256 */
        var alpha = 255 * Math.min(this.drawTime, this.DRAW_DURATION) / this.DRAW_DURATION;
        this.DrawFrame(alpha);
        if (this.ShowShape) {
            this.DrawSahpe(alpha);
        }
    };
    ListItemController.prototype.DrawFrame = function (alpha) {
        for (var i = 0; i < this.Frames.length; i++) {
            var frameStr = this.Frames[i];
            var pointList = frameStr.split(",");
            var index = 0;
            var pointFrom = this.Dots[pointList[index]];
            this.draw.moveTo(pointFrom.x, pointFrom.y);
            while (index < pointList.length - 1) {
                // let pointFrom = this.Dots[pointList[index]];
                var pointDest = this.Dots[pointList[index + 1]];
                // this.draw.moveTo(pointFrom.x,pointFrom.y);
                this.draw.lineTo(pointDest.x, pointDest.y);
                index++;
            }
            this.draw.strokeColor = this.draw.strokeColor.setA(alpha);
            this.draw.stroke();
        }
    };
    ListItemController.prototype.DrawSahpe = function (alpha) {
        for (var i = 0; i < 7; i++) {
            var shapeString = this.Shapes[i];
            var dots = shapeString.split(",");
            var startX = 0;
            var startY = 0;
            var idx = 0;
            while (idx < dots.length) {
                var x = this.Dots[Number(dots[idx])].x;
                var y = this.Dots[Number(dots[idx])].y;
                if (idx == 0) {
                    this.draw.moveTo(x, y);
                    startX = x;
                    startY = y;
                }
                else if (idx == (dots.length / -2)) {
                    this.draw.lineTo(startX, startY);
                }
                else {
                    this.draw.lineTo(x, y);
                }
                idx++;
            }
            this.draw.close();
            this.draw.fillColor = cc.hexToColor(this.TangramColors[i]);
            this.draw.fillColor = this.draw.fillColor.setA(alpha);
            this.draw.fill();
        }
    };
    ListItemController.prototype.DrawFrame2 = function (dots, frames) {
        this.Dots = dots;
        this.draw.clear();
        this.draw.lineWidth = this.LINE_WIDTH;
        this.draw.strokeColor = cc.color(225, 225, 225);
        //frame list
        this.Frames = frames;
        this.drawTime = 0;
        this.drawing = true;
    };
    ListItemController.prototype.UpdateDraw2 = function (dt) {
        this.drawTime += dt;
        for (var i = 0; i < this.Frames.length; i++) {
            var frameStr = this.Frames[i];
            var pointList = frameStr.split(",");
            var index = 0;
            while (index < pointList.length) {
                var pointFrom = this.Dots[pointList[index]];
                var pointDest = null;
                if (index == pointList.length - 1) {
                    pointDest = this.Dots[pointList[0]];
                }
                else {
                    pointDest = this.Dots[pointList[index + 1]];
                }
                var pointTo = pointFrom.lerp(pointDest, this.drawTime / this.DRAW_DURATION);
                this.draw.moveTo(pointFrom.x, pointFrom.y);
                this.draw.lineTo(pointTo.x, pointTo.y);
                this.draw.stroke();
                index++;
            }
        }
    };
    ListItemController.prototype.FinishDraw = function () {
        this.drawing = false;
        this.drawTime = 0;
    };
    ListItemController.prototype.ClearDraw = function () {
        this.draw.clear();
    };
    ListItemController = __decorate([
        ccclass
    ], ListItemController);
    return ListItemController;
}(cc.Component));
exports.default = ListItemController;

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
        //# sourceMappingURL=ListItemController.js.map
        