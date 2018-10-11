"use strict";
cc._RF.push(module, '30927T9s0pOWbzhrkddqQLA', 'ListViewController');
// Script/ListViewController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ListItemController_1 = require("./ListItemController");
var Global_1 = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ListViewController = /** @class */ (function (_super) {
    __extends(ListViewController, _super);
    function ListViewController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ProgressBar = null;
        _this.PageLabel = null;
        _this.UIPanel = null;
        _this.ListItemTemplate = null;
        _this.ROW_COUNT = 7;
        _this.COLUMN_COUNT = 4;
        _this.ITEM_WIDTH = 240;
        _this.ITEM_HEIGHT = 220;
        _this.ITEM_MARGIN_L = 120;
        _this.ITEM_MARGIN_T = 120;
        _this.APPEAR_INTERVAL = 0.015;
        _this.PRGRESS_DURATION = 0.7;
        _this.ItemNodes = new Array();
        _this.Items = new Array();
        _this.ParamData = Array();
        _this.PageData = Array();
        _this.PageIndex = 0;
        _this.AppearQueue = new Array();
        _this.ShowShape = false;
        return _this;
        //#endregion
    }
    //#endregion
    //#region Lifecycle
    ListViewController.prototype.onLoad = function () {
        this.InitItemList();
        this.LoadData();
        this.UIPanel.opacity = 0;
    };
    ListViewController.prototype.start = function () {
        // this.node.runAction(cc.sequence(
        //     cc.delayTime(0.3),
        //     cc.callFunc(()=>this.ShowList(),this)
        // ));
        this.ShowProgressBar();
    };
    // update (dt) {}
    ListViewController.prototype.DoThingsAfterProgress = function () {
        //hide progress bar
        this.ProgressBar.setScale(0, 1);
        //show UI Panel
        this.UIPanel.opacity = 255;
        //set page
        this.SetPage();
        //show list
        this.ShowList();
    };
    //#endregion
    //#region Navigation
    ListViewController.prototype.NavigateToGameBoard = function () {
        cc.director.loadScene("GameBoard");
    };
    ListViewController.prototype.TapItem = function (event, customEventData) {
        var index = 28 * this.PageIndex + Number(customEventData);
        console.log("xxx item tap : " + index);
        var globalNode = cc.director.getScene().getChildByName('GlobalNode');
        globalNode.getComponent(Global_1.default).SelectedItemIndex = index;
        globalNode.getComponent(Global_1.default).NavigatedFromListView = true;
        cc.director.loadScene("GameBoard");
    };
    //#endregion
    //#region Param Data
    ListViewController.prototype.LoadData = function () {
        var _this = this;
        //pick a param string
        cc.loader.loadRes("param", function (error, txt) {
            _this.ParamData = txt.split("\n");
        });
    };
    ListViewController.prototype.RenderItem = function (item, itemData) {
        // // pick a random tangram
        // let rand = Math.floor(Math.random() * this.ParamData.length);
        // let itemData = this.ParamData[rand];
        // begin prepare
        var paramArray = itemData.split("/");
        // dots
        var dots = new Array();
        var dotsPositonStr = paramArray[0].split(";");
        for (var i = 0; i < dotsPositonStr.length; i++) {
            var posStr = dotsPositonStr[i];
            var x = Math.round(Number(posStr.split(",")[0]));
            var y = Math.round(Number(posStr.split(",")[1]));
            var dotPosition = new cc.Vec2(x, 512 - y);
            dots.push(dotPosition);
        }
        //shapes
        var shapes = Array();
        var shapeListStr = paramArray[1].split(";");
        for (var i = 0; i < shapeListStr.length; i++) {
            var shapeStr = shapeListStr[i];
            shapes.push(shapeStr);
        }
        //frames
        var frames = Array();
        var frameListStr = paramArray[2].split(";");
        for (var i = 0; i < frameListStr.length; i++) {
            var frameStr = frameListStr[i];
            frames.push(frameStr);
        }
        //draw item
        item.Show(dots, shapes, frames, this.ShowShape);
    };
    //#endregion
    //#region List Management
    ListViewController.prototype.InitItemList = function () {
        this.Items.splice(0, this.Items.length);
        this.ItemNodes.splice(0, this.ItemNodes.length);
        var target = this.ListItemTemplate.node;
        for (var row = 0; row < this.ROW_COUNT; row++) {
            for (var column = 0; column < this.COLUMN_COUNT; column++) {
                var itemNode = cc.instantiate(target);
                var btn = itemNode.getComponent(cc.Button);
                btn.clickEvents[0].customEventData = (row * this.COLUMN_COUNT + column).toString();
                itemNode.parent = target.parent;
                itemNode.setPosition(column * this.ITEM_WIDTH + this.ITEM_MARGIN_L, 0 - row * this.ITEM_HEIGHT - this.ITEM_MARGIN_T);
                this.ItemNodes.push(itemNode);
                var item = itemNode.getComponent(ListItemController_1.default);
                this.Items.push(item);
            }
        }
    };
    // AppearIndex = 0;
    ListViewController.prototype.ShowList = function () {
        this.ClearItemList();
        // this.AppearIndex = 0;
        this.AppearQueue.splice(0, this.AppearQueue.length);
        var tempArr = new Array();
        for (var i = 0; i < this.PageData.length; i++) {
            tempArr.push(i);
        }
        while (tempArr.length > 0) {
            var rand = Math.floor(Math.random() * tempArr.length);
            var data = tempArr.splice(rand, 1)[0];
            this.AppearQueue.push(data);
        }
        this.ShowNextItem();
    };
    ListViewController.prototype.ShowNextItem = function () {
        var _this = this;
        // if (this.AppearIndex < this.COLUMN_COUNT * this.ROW_COUNT && this.AppearIndex < this.PageData.length) {
        if (this.AppearQueue.length > 0) {
            var index = this.AppearQueue.pop();
            this.RenderItem(this.Items[index], this.PageData[index]);
            // this.RenderItem(this.Items[this.AppearIndex], this.PageData[this.AppearIndex]);
            // this.AppearIndex++;
            this.node.runAction(cc.sequence(cc.delayTime(this.APPEAR_INTERVAL), cc.callFunc(function () { return _this.ShowNextItem(); }, this)));
        }
    };
    ListViewController.prototype.ClearItemList = function () {
        for (var i = 0; i < this.Items.length; i++) {
            this.Items[i].FinishDraw();
            this.Items[i].ClearDraw();
        }
    };
    //#endregion
    //#region Page management
    ListViewController.prototype.NextPage = function () {
        var maxIndex = Math.ceil(this.ParamData.length / (this.COLUMN_COUNT * this.ROW_COUNT)) - 1;
        if (this.PageIndex < maxIndex) {
            this.PageIndex++;
        }
        else {
            this.PageIndex = 0;
        }
        this.SetPage();
        this.ShowList();
    };
    ListViewController.prototype.PreviousPage = function () {
        if (this.PageIndex > 0) {
            this.PageIndex--;
        }
        else {
            var maxIndex = Math.ceil(this.ParamData.length / (this.COLUMN_COUNT * this.ROW_COUNT)) - 1;
            this.PageIndex = maxIndex;
        }
        this.SetPage();
        this.ShowList();
    };
    ListViewController.prototype.SetPage = function () {
        var pageLabelString = (this.PageIndex + 1).toString() + "/" + Math.ceil(this.ParamData.length / (this.COLUMN_COUNT * this.ROW_COUNT)).toString();
        this.PageLabel.string = pageLabelString;
        // console.log("xxx page " + pageLabelString);
        var itemCountPerPage = this.COLUMN_COUNT * this.ROW_COUNT;
        var idx = itemCountPerPage * this.PageIndex;
        this.PageData.splice(0, this.PageData.length);
        while (idx < (this.ParamData.length - 1)) {
            if (this.PageData.length < itemCountPerPage) {
                this.PageData.push(this.ParamData[idx]);
            }
            else {
                break;
            }
            idx++;
        }
    };
    //#endregion
    //#region Test
    ListViewController.prototype.Test = function () {
        // this.ShowShape = false;
        // this.ShowList();
    };
    ListViewController.prototype.Test2 = function () {
        // this.ShowShape = true;
        // this.ShowList();
    };
    //#endregion
    //#region Progress Bar
    ListViewController.prototype.ShowProgressBar = function () {
        var _this = this;
        this.ProgressBar.setScale(0, 1);
        this.ProgressBar.runAction(cc.sequence(cc.scaleTo(this.PRGRESS_DURATION, 1, 1), cc.callFunc(function () { return _this.DoThingsAfterProgress(); })));
    };
    __decorate([
        property(cc.Node)
    ], ListViewController.prototype, "ProgressBar", void 0);
    __decorate([
        property(cc.Label)
    ], ListViewController.prototype, "PageLabel", void 0);
    __decorate([
        property(cc.Node)
    ], ListViewController.prototype, "UIPanel", void 0);
    __decorate([
        property(ListItemController_1.default)
    ], ListViewController.prototype, "ListItemTemplate", void 0);
    ListViewController = __decorate([
        ccclass
    ], ListViewController);
    return ListViewController;
}(cc.Component));
exports.default = ListViewController;

cc._RF.pop();