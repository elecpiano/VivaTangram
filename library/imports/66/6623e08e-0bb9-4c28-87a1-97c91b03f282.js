"use strict";
cc._RF.push(module, '6623eCOC7lMKIehl8kbA/KC', 'FrameCanvasController');
// Script/FrameCanvasController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var FrameCanvasController = /** @class */ (function (_super) {
    __extends(FrameCanvasController, _super);
    function FrameCanvasController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.drawDuration = 0.5;
        _this.drawTime = 0;
        _this.drawing = false;
        _this.Frames = Array();
        _this.Dots = Array();
        _this.LINE_WIDTH = 8;
        _this.LINE_COLOR = "#353535";
        return _this;
        //#endregion
    }
    //#endregion
    FrameCanvasController.prototype.start = function () {
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }
    };
    FrameCanvasController.prototype.update = function (dt) {
        if (this.drawing) {
            if (this.drawTime > this.drawDuration) {
                this.FinishDraw();
            }
            else {
                this.UpdateDraw(dt);
            }
        }
    };
    //#region Frame
    FrameCanvasController.prototype.StartDraw = function (dots, frames) {
        this.Dots = dots;
        this.draw.clear();
        this.draw.lineWidth = this.LINE_WIDTH;
        this.draw.strokeColor = cc.hexToColor(this.LINE_COLOR);
        //frame list
        this.Frames = frames;
        // for (let index = 0; index < pointArray.length; index++) {
        //     let x = Number(pointArray[index].split(",")[0]);
        //     let y = 512 - Number(pointArray[index].split(",")[1]);
        //     this.pointList.push(new cc.Vec2(x,y));
        // }
        this.drawTime = 0;
        this.drawing = true;
    };
    FrameCanvasController.prototype.UpdateDraw = function (dt) {
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
                var pointTo = pointFrom.lerp(pointDest, this.drawTime / this.drawDuration);
                this.draw.moveTo(pointFrom.x, pointFrom.y);
                this.draw.lineTo(pointTo.x, pointTo.y);
                this.draw.stroke();
                index++;
            }
        }
    };
    FrameCanvasController.prototype.FinishDraw = function () {
        this.drawing = false;
        this.drawTime = 0;
    };
    FrameCanvasController.prototype.ClearFrame = function () {
        this.draw.clear();
    };
    FrameCanvasController = __decorate([
        ccclass
    ], FrameCanvasController);
    return FrameCanvasController;
}(cc.Component));
exports.default = FrameCanvasController;

cc._RF.pop();