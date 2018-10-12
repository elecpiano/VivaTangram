(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/GameBoardController.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'dff6d+yjHZADYFLqbthj+T6', 'GameBoardController', __filename);
// Script/GameBoardController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var FrameCanvasController_1 = require("./FrameCanvasController");
var Dictionary_1 = require("./Dictionary");
var Global_1 = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameBoardController = /** @class */ (function (_super) {
    __extends(GameBoardController, _super);
    function GameBoardController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ItemNumberLabel = null;
        _this.DisplayNameCN = null;
        _this.DisplayNameEN = null;
        _this.ProgressBar = null;
        _this.UIPanel = null;
        _this.ShapeCanvas = null;
        _this.ShapeCanvasAlphaMax = 150; // 0 is transparent, 255 is filled
        _this.Seq0 = null;
        _this.Seq1 = null;
        _this.Level0 = null;
        _this.Level1 = null;
        _this.Level2 = null;
        _this.Level3 = null;
        _this.Level4 = null;
        _this.Level5 = null;
        _this.Level6 = null;
        _this.Level7 = null;
        _this.Level8 = null;
        _this.SeqButtons = new Array();
        _this.SeqSpriteFrames = new Array();
        _this.LevelButtons = new Array();
        _this.LevelSpriteFrames = new Array();
        _this.FrameController = null;
        _this.TangramColors = ["#ffda4c", "#52cad1", "#ff493a", "#3968bc", "#ff8e2f", "#ca4c89", "#55d723"];
        _this.ShowTangramFullColor = false;
        // SHAPE_LINE_WIDTH = 5;
        _this.Difficulty = 0; // 0 is most difficult, 7 shows all shapes(without color), 8 shows all shapes with color
        _this.HintColors = ["#5faace", "#3992bc", "#287ca3", "#19678b", "#105778", "#074561", "#05354b"];
        _this.HintColorRemap = Array();
        _this.ParamData = Array();
        _this.DictionaryData = Array();
        _this.DISPLAY_NAME_DURATION = 0.5;
        _this.Dots = Array();
        _this.Shapes = Array();
        _this.Frames = Array();
        _this.CurrentDisplayNameKey = "";
        _this.AppearQueue = Array();
        _this.ShownShpaes = Array();
        _this.UnshownShpaes = Array();
        _this.drawDuration = 0.2;
        _this.drawInterval = 0.05;
        _this.drawTimeList = new Array();
        _this.drawingList = new Array();
        _this.PRGRESS_DURATION = 0.7;
        _this.TangramIndex = 0;
        _this.NavigatedFromListView = false;
        _this.SeqMode = 0; // 0 - Sequence, 1 - Suffle
        _this.VisitedList = Array();
        _this.UnvisitedList = Array();
        _this.IsBusy = false;
        //#endregion
        //#region Difficulty, Sequence
        _this.menuSeqOpen = false;
        _this.menuDiffOpen = false;
        _this.animations = null;
        return _this;
        //#endregion
    }
    //#endregion
    //#region Navigation
    GameBoardController.prototype.NavigateToListView = function () {
        cc.director.loadScene("ListView");
    };
    //#endregion
    //#region Lifecycle
    GameBoardController.prototype.onLoad = function () {
        var globalNode = cc.director.getScene().getChildByName('GlobalNode');
        this.TangramIndex = globalNode.getComponent(Global_1.default).SelectedItemIndex;
        this.NavigatedFromListView = globalNode.getComponent(Global_1.default).NavigatedFromListView;
        globalNode.getComponent(Global_1.default).NavigatedFromListView = false;
        this.LoadData();
        this.UIPanel.opacity = 0;
        if (this.animations == null) {
            this.animations = this.getComponent(cc.Animation);
        }
    };
    GameBoardController.prototype.start = function () {
        this.draw = this.ShapeCanvas.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.ShapeCanvas.addComponent(cc.Graphics);
        }
        this.ShowProgressBar();
    };
    GameBoardController.prototype.update = function (dt) {
        if (this.drawingList.length > 0) {
            this.UpdateRender(dt);
        }
    };
    GameBoardController.prototype.DoThingsAfterProgress = function () {
        //hide progress bar
        this.ProgressBar.setScale(0, 1);
        this.InitMenu();
        //show UI Panel
        this.UIPanel.opacity = 255;
        //dictionary
        this.PrepareDictionary();
        // user data
        this.EnsureUserDataAccess();
        var data = this.GetUserData();
        var strArr = data.split(";");
        if (strArr.length == 4) {
            if (!this.NavigatedFromListView) {
                this.TangramIndex = Number(strArr[0]);
            }
            this.Difficulty = Number(strArr[1]);
            this.SeqMode = Number(strArr[2]);
            //visited list
            this.InitVisitList(strArr[3]);
        }
        // sync diff menu
        this.SyncSeqMenu();
        this.SyncDiffMenu();
        //show tangram
        this.ShowTangram();
    };
    GameBoardController.prototype.SyncVistList = function () {
        var i = 0;
        var idx = null;
        while (i < this.UnvisitedList.length) {
            if (this.TangramIndex == this.UnvisitedList[i]) {
                idx = this.UnvisitedList.splice(i, 1);
                this.VisitedList.push(idx);
                break;
            }
            i++;
        }
        // if all tangrams have been visited, reset
        if (this.UnvisitedList.length == 0) {
            this.InitVisitList("");
        }
    };
    GameBoardController.prototype.InitVisitList = function (visitStr) {
        //visited list
        this.VisitedList.splice(0, this.VisitedList.length);
        var visitArr = visitStr.split(",");
        for (var i = 0; i < visitArr.length; i++) {
            if (visitArr[i] != "") {
                this.VisitedList.push(Number(visitArr[i]));
            }
        }
        //unvisited list
        this.UnvisitedList.splice(0, this.UnvisitedList.length);
        for (var i = 0; i < this.ParamData.length; i++) {
            var visited = false;
            var j = 0;
            while (j < this.VisitedList.length) {
                if (i == this.VisitedList[j]) {
                    visited = true;
                    break;
                }
                j++;
            }
            if (!visited) {
                this.UnvisitedList.push(i);
            }
        }
        console.log("xxx unvisited list : " + this.UnvisitedList);
    };
    //#endregion
    //#region Param Data & Dictionary
    GameBoardController.prototype.LoadData = function () {
        var _this = this;
        cc.loader.loadRes("param", function (error, txt) {
            _this.ParamData = txt.split("\n");
        });
        cc.loader.loadRes("dictionary", function (error, txt) {
            _this.DictionaryData = txt.split("\n");
        });
    };
    GameBoardController.prototype.PrepareDictionary = function () {
        if (this.DisplayNameDictionary == null) {
            this.DisplayNameDictionary = new Dictionary_1.default();
            for (var i = 0; i < this.DictionaryData.length; i++) {
                var str = this.DictionaryData[i];
                var arr = str.split(",");
                if (arr.length == 3) {
                    var key = arr[0];
                    arr.splice(0, 1);
                    this.DisplayNameDictionary.Add(key, arr);
                }
            }
        }
    };
    //#endregion
    //#region Tangram Render
    GameBoardController.prototype.ShowTangram = function () {
        var _this = this;
        this.IsBusy = true;
        this.ClearTangram();
        this.PrepareParam();
        this.ShowTangramFullColor = this.Difficulty == 8 ? true : false;
        var appearCount = Math.min(this.Difficulty, 7); // this.Difficulty may go up to 8
        this.node.runAction(cc.sequence(cc.callFunc(function () { return _this.FrameController.StartDraw(_this.Dots, _this.Frames); }, this), cc.delayTime(0.5), cc.callFunc(function () { return _this.StartDraw(appearCount); }, this)));
        this.ShowDisplayName();
        this.SaveUserData();
    };
    GameBoardController.prototype.PrepareParam = function () {
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
        //display name key
        if (paramArray.length > 3) {
            this.CurrentDisplayNameKey = paramArray[3].trim();
        }
        else {
            this.CurrentDisplayNameKey = "";
        }
    };
    GameBoardController.prototype.StartDraw = function (appearCount) {
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
        // record unshown shapes
        while (tempQueue.length > 0) {
            var idx = tempQueue.pop();
            this.UnshownShpaes.push(idx);
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
            console.log("xxx - unbusy at StartDraw");
        }
    };
    GameBoardController.prototype.ShowNextShape = function () {
        var _this = this;
        if (this.AppearQueue.length > 0) {
            var idx = this.AppearQueue.pop();
            this.drawingList.push(idx); /* this will trigger corresponding drawtime begin to tick */
            this.node.runAction(cc.sequence(cc.delayTime(this.drawInterval), cc.callFunc(function () { return _this.ShowNextShape(); }, this)));
        }
    };
    GameBoardController.prototype.ShowOneMoreHint = function () {
        if (this.UnshownShpaes.length == 0) {
            this.IsBusy = true;
            this.ShowTangramFullColor = true;
            this.StartDraw(7);
        }
        else {
            var rand = Math.floor(Math.random() * this.UnshownShpaes.length);
            var idx = this.UnshownShpaes.splice(rand, 1)[0];
            this.drawTimeList[idx] = 0;
            this.drawingList.push(idx); /* this will trigger corresponding drawtime begin to tick */
            this.IsBusy = true;
        }
    };
    GameBoardController.prototype.UpdateRender = function (dt) {
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
            console.log("xxx - unbusy at UpdateRender");
        }
    };
    GameBoardController.prototype.RenderShape = function (shapeString, colorIndex, alpha) {
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
        // // make each shape a bit larger, to avoid small gaps between shapes
        // this.draw.lineWidth = this.SHAPE_LINE_WIDTH;
        // this.draw.strokeColor = this.draw.fillColor.setA(alpha*0.2);
        // this.draw.stroke();
    };
    GameBoardController.prototype.ShowDisplayName = function () {
        var nameCN = "";
        var nameEN = "";
        if (this.CurrentDisplayNameKey != "") {
            var names = this.DisplayNameDictionary.TryGetValue(this.CurrentDisplayNameKey);
            if (names != null) {
                nameCN = names[0].trim();
                nameEN = names[1].trim();
                this.DisplayNameAnimate();
            }
        }
        this.ItemNumberLabel.string = "No." + this.TangramIndex.toString();
        this.DisplayNameEN.string = nameCN;
        this.DisplayNameCN.string = nameEN;
    };
    GameBoardController.prototype.DisplayNameAnimate = function () {
        this.DisplayNameEN.node.opacity = 0;
        this.DisplayNameCN.node.opacity = 0;
        this.DisplayNameCN.node.runAction(cc.fadeIn(this.DISPLAY_NAME_DURATION));
        this.DisplayNameEN.node.runAction(cc.fadeTo(this.DISPLAY_NAME_DURATION, 128));
        // this.node.runAction(cc.sequence(
        //     cc.delayTime(0.2),
        //     cc.callFunc(
        //         ()=>{
        //             this.DisplayNameCN.node.runAction(cc.fadeIn(this.DISPLAY_NAME_DURATION));
        //         },this)
        // ));
        // this.node.runAction(cc.sequence(
        //     cc.delayTime(0.3),
        //     cc.callFunc(
        //         ()=>{
        //             this.DisplayNameEN.node.runAction(cc.fadeIn(this.DISPLAY_NAME_DURATION));
        //         },this)
        // ));
    };
    GameBoardController.prototype.ClearTangram = function () {
        this.draw.clear();
        this.FrameController.ClearFrame();
    };
    //#endregion
    //#region Button Logic
    GameBoardController.prototype.ShowNextTangram = function () {
        if (this.IsBusy) {
            return;
        }
        this.HideContextMenus();
        //pick next tangram in data
        if (this.SeqMode == 0) {
            if (this.TangramIndex < this.ParamData.length - 1) {
                this.TangramIndex++;
            }
            else {
                this.TangramIndex = 0;
            }
        }
        else {
            var rand = Math.floor(Math.random() * this.UnvisitedList.length);
            this.TangramIndex = this.UnvisitedList[rand];
        }
        this.SyncVistList();
        this.ShowTangram();
    };
    //#endregion
    //#region Hint
    GameBoardController.prototype.GiveMeHint = function () {
        if (this.IsBusy) {
            return;
        }
        this.HideContextMenus();
        this.ShowOneMoreHint();
    };
    //#endregion
    //#region Progress Bar
    GameBoardController.prototype.ShowProgressBar = function () {
        var _this = this;
        this.ProgressBar.setScale(0, 1);
        this.ProgressBar.runAction(cc.sequence(cc.scaleTo(this.PRGRESS_DURATION, 1, 1), cc.callFunc(function () { return _this.DoThingsAfterProgress(); })));
    };
    GameBoardController.prototype.InitMenu = function () {
        // Level Buttons
        this.Level1.scale = 0;
        ;
        this.Level2.scale = 0;
        this.Level3.scale = 0;
        this.Level4.scale = 0;
        this.Level5.scale = 0;
        this.Level6.scale = 0;
        this.Level7.scale = 0;
        this.Level8.scale = 0;
        this.LevelButtons.push(this.Level0);
        this.LevelButtons.push(this.Level1);
        this.LevelButtons.push(this.Level2);
        this.LevelButtons.push(this.Level3);
        this.LevelButtons.push(this.Level4);
        this.LevelButtons.push(this.Level5);
        this.LevelButtons.push(this.Level6);
        this.LevelButtons.push(this.Level7);
        this.LevelButtons.push(this.Level8);
        this.LevelSpriteFrames.push(this.Level0.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level1.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level2.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level3.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level4.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level5.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level6.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level7.getComponent(cc.Sprite).spriteFrame);
        this.LevelSpriteFrames.push(this.Level8.getComponent(cc.Sprite).spriteFrame);
        // Seq Buttons
        this.Seq1.scale = 0;
        this.SeqButtons.push(this.Seq0);
        this.SeqButtons.push(this.Seq1);
        this.SeqSpriteFrames.push(this.Seq0.getComponent(cc.Sprite).spriteFrame);
        this.SeqSpriteFrames.push(this.Seq1.getComponent(cc.Sprite).spriteFrame);
    };
    GameBoardController.prototype.TapSeqMenu = function (event, customEventData) {
        console.log("xxx TapSeqMenu : ");
        if (this.IsBusy) {
            return;
        }
        if (this.menuDiffOpen) {
            this.HideDiffMenu();
        }
        if (this.menuSeqOpen) {
            var idx = Number(customEventData);
            if (idx == 1) {
                this.SeqMode = this.SeqMode == 0 ? 1 : 0;
            }
            this.HideSeqMenu();
            this.SyncSeqMenu();
            this.SaveUserData();
        }
        else {
            this.ShowSeqMenu();
        }
    };
    GameBoardController.prototype.SyncSeqMenu = function () {
        this.Seq0.getComponent(cc.Sprite).spriteFrame = this.SeqSpriteFrames[this.SeqMode];
        var idx = this.SeqMode == 0 ? 1 : 0;
        this.Seq1.getComponent(cc.Sprite).spriteFrame = this.SeqSpriteFrames[idx];
    };
    GameBoardController.prototype.TapDiffMenu = function (event, customEventData) {
        if (this.IsBusy) {
            return;
        }
        if (this.menuSeqOpen) {
            this.HideSeqMenu();
        }
        if (this.menuDiffOpen) {
            var idx = Number(customEventData);
            if (idx > 0 && idx <= this.Difficulty) {
                this.Difficulty = idx - 1;
            }
            else if (idx > this.Difficulty) {
                this.Difficulty = idx;
            }
            this.HideDiffMenu();
            this.SyncDiffMenu();
            this.ApplyDiffMenu();
            this.SaveUserData();
        }
        else {
            this.ShowDiffMenu();
        }
    };
    GameBoardController.prototype.SyncDiffMenu = function () {
        this.Level0.getComponent(cc.Sprite).spriteFrame = this.LevelSpriteFrames[this.Difficulty];
        var idx = 1;
        while (idx < this.LevelButtons.length) {
            if (idx <= this.Difficulty) {
                this.LevelButtons[idx].getComponent(cc.Sprite).spriteFrame = this.LevelSpriteFrames[idx - 1];
            }
            else {
                this.LevelButtons[idx].getComponent(cc.Sprite).spriteFrame = this.LevelSpriteFrames[idx];
            }
            idx++;
        }
    };
    GameBoardController.prototype.ApplyDiffMenu = function () {
        this.IsBusy = true;
        this.ShowTangramFullColor = this.Difficulty == 8 ? true : false;
        var appearCount = Math.min(this.Difficulty, 7); // this.Difficulty may go up to 8
        this.StartDraw(appearCount);
    };
    GameBoardController.prototype.HideContextMenus = function () {
        if (this.menuDiffOpen) {
            this.HideDiffMenu();
        }
        if (this.menuSeqOpen) {
            this.HideSeqMenu();
        }
    };
    GameBoardController.prototype.ShowSeqMenu = function () {
        this.animations.playAdditive("MenuSeqOpen");
        this.menuSeqOpen = true;
    };
    GameBoardController.prototype.HideSeqMenu = function () {
        this.animations.playAdditive("MenuSeqClose");
        this.menuSeqOpen = false;
    };
    GameBoardController.prototype.ShowDiffMenu = function () {
        this.animations.playAdditive("MenuDiffOpen");
        this.menuDiffOpen = true;
    };
    GameBoardController.prototype.HideDiffMenu = function () {
        this.animations.playAdditive("MenuDiffClose");
        this.menuDiffOpen = false;
    };
    //#endregion
    //#region Test
    GameBoardController.prototype.Test = function () {
        // console.log("xxx drawingList : " + this.drawingList);
        // console.log("xxx drawTimeList : " + this.drawTimeList);
        console.log("xxx UnvisitedList : " + this.UnvisitedList);
    };
    //#endregion
    //#region WX Data API
    GameBoardController.prototype.EnsureUserDataAccess = function () {
        // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        // }
        var fs = wx.getFileSystemManager();
        var data = null;
        try {
            data = fs.readFileSync(wx.env.USER_DATA_PATH + "/userdata.txt", 'utf8');
        }
        catch (error) {
        }
        if (data == null) {
            fs.writeFileSync(wx.env.USER_DATA_PATH + "/userdata.txt", '0;0;0;0', 'utf8');
        }
    };
    GameBoardController.prototype.SaveUserData = function () {
        var str = "";
        str += this.TangramIndex.toString() + ";";
        str += this.Difficulty.toString() + ";";
        str += this.SeqMode.toString() + ";";
        for (var i = 0; i < this.VisitedList.length; i++) {
            str += this.VisitedList[i].toString() + ",";
        }
        var fs = wx.getFileSystemManager();
        fs.writeFileSync(wx.env.USER_DATA_PATH + "/userdata.txt", str, 'utf8');
        console.log("xxx save user data : " + str);
    };
    GameBoardController.prototype.GetUserData = function () {
        var fs = wx.getFileSystemManager();
        var data = null;
        try {
            data = fs.readFileSync(wx.env.USER_DATA_PATH + "/userdata.txt", 'utf8');
        }
        catch (error) {
        }
        return data;
    };
    __decorate([
        property(cc.Label)
    ], GameBoardController.prototype, "ItemNumberLabel", void 0);
    __decorate([
        property(cc.Label)
    ], GameBoardController.prototype, "DisplayNameCN", void 0);
    __decorate([
        property(cc.Label)
    ], GameBoardController.prototype, "DisplayNameEN", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "ProgressBar", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "UIPanel", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "ShapeCanvas", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Seq0", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Seq1", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level0", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level1", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level2", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level3", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level4", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level5", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level6", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level7", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "Level8", void 0);
    __decorate([
        property(FrameCanvasController_1.default)
    ], GameBoardController.prototype, "FrameController", void 0);
    GameBoardController = __decorate([
        ccclass
    ], GameBoardController);
    return GameBoardController;
}(cc.Component));
exports.default = GameBoardController;

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
        //# sourceMappingURL=GameBoardController.js.map
        