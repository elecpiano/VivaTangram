import FrameCanvasController from "./FrameCanvasController";
import Dictionary from "./Dictionary";
import GlobalData from "./Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBoardController extends cc.Component {

    //#region Properties

    @property(cc.Label)
    ItemNumberLabel: cc.Label = null;
    @property(cc.Label)
    DisplayNameCN: cc.Label = null;
    @property(cc.Label)
    DisplayNameEN: cc.Label = null;
    @property(cc.Node)
    ProgressBar: cc.Node = null;
    @property(cc.Node)
    UIPanel: cc.Node = null;
    @property(cc.Node)
    ShapeCanvas: cc.Node = null;

    ShapeCanvasAlphaMax = 150; // 0 is transparent, 255 is filled

    @property(cc.Node)
    Seq0: cc.Node = null;
    @property(cc.Node)
    Seq1: cc.Node = null;

    @property(cc.Node)
    Level0: cc.Node = null;
    @property(cc.Node)
    Level1: cc.Node = null;
    @property(cc.Node)
    Level2: cc.Node = null;
    @property(cc.Node)
    Level3: cc.Node = null;
    @property(cc.Node)
    Level4: cc.Node = null;
    @property(cc.Node)
    Level5: cc.Node = null;
    @property(cc.Node)
    Level6: cc.Node = null;
    @property(cc.Node)
    Level7: cc.Node = null;
    @property(cc.Node)
    Level8: cc.Node = null;

    SeqButtons = new Array<cc.Node>();
    SeqSpriteFrames = new Array<cc.SpriteFrame>();

    LevelButtons = new Array<cc.Node>();
    LevelSpriteFrames = new Array<cc.SpriteFrame>();

    @property(FrameCanvasController)
    FrameController: FrameCanvasController = null;

    draw: cc.Graphics;
    TangramColors:string[] = ["#ffda4c","#52cad1","#ff493a","#3968bc","#ff8e2f","#ca4c89","#55d723"];
    ShowTangramFullColor:boolean = false;
    // SHAPE_LINE_WIDTH = 5;

    Difficulty = 0; // 0 is most difficult, 7 shows all shapes(without color), 8 shows all shapes with color
    HintColors:string[] = ["#5faace","#3992bc","#287ca3","#19678b","#105778","#074561","#05354b"];
    HintColorRemap = Array<number>();

    ParamData = Array<string>();
    DictionaryData = Array<string>();
    DisplayNameDictionary: Dictionary<string,string[]>;
    DISPLAY_NAME_DURATION = 0.5;

    Dots = Array<cc.Vec2>();
    Shapes = Array<string>();
    Frames = Array<string>();
    CurrentDisplayNameKey = "";

    AppearQueue = Array<number>();
    ShownShpaes = Array<number>();
    UnshownShpaes = Array<number>();
    drawDuration: number = 0.2;
    drawInterval: number = 0.05;
    drawTimeList = new Array<number>();
    drawingList = new Array<number>();

    PRGRESS_DURATION = 0.7;
    
    TangramIndex = 0;
    NavigatedFromListView:boolean = false;
    
    SeqMode = 0;// 0 - Sequence, 1 - Suffle
    VisitedList = Array<number>();
    UnvisitedList = Array<number>();

    IsBusy = false;

    //#endregion

    //#region Navigation

    NavigateToListView(){
        cc.director.loadScene("ListView");
    }

    //#endregion

    //#region Lifecycle

    onLoad () {
        let globalNode = cc.director.getScene().getChildByName('GlobalNode');       
        this.TangramIndex = globalNode.getComponent(GlobalData).SelectedItemIndex;
        this.NavigatedFromListView = globalNode.getComponent(GlobalData).NavigatedFromListView;
        globalNode.getComponent(GlobalData).NavigatedFromListView = false;

        this.LoadData();
        this.UIPanel.opacity = 0;
        if (this.animations == null) {
            this.animations = this.getComponent(cc.Animation);
        }
    }

    start () {
        this.draw = this.ShapeCanvas.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.ShapeCanvas.addComponent(cc.Graphics);
        }

        this.ShowProgressBar();
    }

    update (dt) {
        if (this.drawingList.length > 0) {
            this.UpdateRender(dt);
        }
    }

    DoThingsAfterProgress(){
        //hide progress bar
        this.ProgressBar.setScale(0,1);

        this.InitMenu();

        //show UI Panel
        this.UIPanel.opacity = 255;

        //dictionary
        this.PrepareDictionary();

        // user data
        this.EnsureUserDataAccess();
        let data = this.GetUserData();
        let strArr = data.split(";");
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
    }

    SyncVistList(){
        let i = 0;
        let idx = null;
        while (i < this.UnvisitedList.length) {
            if (this.TangramIndex == this.UnvisitedList[i]) {
                idx = this.UnvisitedList.splice(i,1);
                this.VisitedList.push(idx);
                break;
            }
            i++;
        }

        // if all tangrams have been visited, reset
        if (this.UnvisitedList.length == 0) {
            this.InitVisitList("");
        }
    }

    InitVisitList(visitStr:string){
        //visited list
        this.VisitedList.splice(0,this.VisitedList.length);
        let visitArr = visitStr.split(",");        
        for (let i = 0; i < visitArr.length; i++) {
            if (visitArr[i] != "") {
                this.VisitedList.push(Number(visitArr[i]));
            }
        }

        //unvisited list
        this.UnvisitedList.splice(0,this.UnvisitedList.length);
        for (let i = 0; i < this.ParamData.length; i++) {
            let visited = false;
            let j = 0;
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
    }

    //#endregion

    //#region Param Data & Dictionary

    LoadData(){
        cc.loader.loadRes(
            "param",
            (error, txt:string)=>{
                this.ParamData = txt.split("\n");
            }
        );

        cc.loader.loadRes(
            "dictionary",
            (error, txt:string)=>{
                this.DictionaryData = txt.split("\n");
            }
        );
    }

    PrepareDictionary(){
        if (this.DisplayNameDictionary == null) {
            this.DisplayNameDictionary = new Dictionary<string,string[]>();

            for (let i = 0; i < this.DictionaryData.length; i++) {
                let str = this.DictionaryData[i];
                let arr = str.split(",");
                if (arr.length == 3) {
                    let key = arr[0];
                    arr.splice(0,1);
                    this.DisplayNameDictionary.Add(key, arr);
                }
            }
        }
    }

    //#endregion

    //#region Tangram Render
    
    ShowTangram(){
        this.IsBusy = true;

        this.ClearTangram();
        this.PrepareParam();

        this.ShowTangramFullColor = this.Difficulty == 8 ? true : false;
        let appearCount = Math.min(this.Difficulty, 7);// this.Difficulty may go up to 8
        
        this.node.runAction(cc.sequence(
            cc.callFunc(()=>this.FrameController.StartDraw(this.Dots, this.Frames),this),
            cc.delayTime(0.5),
            cc.callFunc(()=>this.StartDraw(appearCount),this)
        ));

        this.ShowDisplayName();

        this.SaveUserData();
    }

    PrepareParam(){
        let param = this.ParamData[this.TangramIndex];
        
        // begin prepare
        let paramArray = param.split("/");

        // dots
        this.Dots.splice(0,this.Dots.length);
        let dotsPositonStr = paramArray[0].split(";");
        for (let i = 0; i < dotsPositonStr.length; i++) {
            let posStr = dotsPositonStr[i];
            let x = Math.round(Number(posStr.split(",")[0]));
            let y = Math.round(Number(posStr.split(",")[1]));
            // let dotPosition = new cc.Vec2(x,512 - y);
            let dotPosition = new cc.Vec2(x * 2,1024 - y * 2);
            this.Dots.push(dotPosition);
        }

        //shapes
        this.Shapes.splice(0,this.Shapes.length);
        let shapeListStr = paramArray[1].split(";");
        for (let i = 0; i < shapeListStr.length; i++) {
            let shapeStr = shapeListStr[i];
            this.Shapes.push(shapeStr);
        }

        //frames
        this.Frames.splice(0,this.Frames.length);
        let frameListStr = paramArray[2].split(";");
        for (let i = 0; i < frameListStr.length; i++) {
            let frameStr = frameListStr[i];
            this.Frames.push(frameStr);
        }

        //display name key
        if (paramArray.length > 3) {
            this.CurrentDisplayNameKey = paramArray[3].trim();            
        }
        else{
            this.CurrentDisplayNameKey = "";
        }
    }

    StartDraw(appearCount:number){
        if (appearCount > 7) {
            return;
        }

        this.draw.clear();

        // randomize appear queue, populate shown shapes
        let tempQueue = [ 0, 1, 2, 3, 4, 5, 6 ];
        this.AppearQueue.splice(0,this.AppearQueue.length);
        this.ShownShpaes.splice(0,this.ShownShpaes.length);
        this.UnshownShpaes.splice(0,this.UnshownShpaes.length);

        while (this.AppearQueue.length < appearCount) {
            let rand = Math.floor(Math.random() * tempQueue.length);
            let idx = tempQueue.splice(rand,1)[0];
            this.AppearQueue.push(idx);
            this.ShownShpaes.push(idx);
        }

        // record unshown shapes
        while (tempQueue.length > 0) {
            let idx = tempQueue.pop();
            this.UnshownShpaes.push(idx);
        }

        // randomize hint color
        tempQueue = [ 0, 1, 2, 3, 4, 5, 6 ];
        this.HintColorRemap.splice(0,this.HintColorRemap.length);
        while (tempQueue.length > 0) {
            let rand = Math.floor(Math.random() * tempQueue.length);
            let idx = tempQueue.splice(rand,1)[0];
            this.HintColorRemap.push(idx);
        }
        
        // drawTimeList
        this.drawTimeList.splice(0,this.drawTimeList.length);
        this.drawTimeList = [0,0,0,0,0,0,0];

        if (this.AppearQueue.length > 0) {
            this.ShowNextShape();            
        }
        else{
            this.IsBusy = false;
            console.log("xxx - unbusy at StartDraw");
        }
    }

    ShowNextShape(){
        if (this.AppearQueue.length>0) {
            let idx = this.AppearQueue.pop();
            this.drawingList.push(idx); /* this will trigger corresponding drawtime begin to tick */

            this.node.runAction(cc.sequence(
                cc.delayTime(this.drawInterval),
                cc.callFunc(()=>this.ShowNextShape(),this)
            ));
        }
    }

    ShowOneMoreHint(){
        if (this.UnshownShpaes.length == 0) {
            this.IsBusy = true;
            this.ShowTangramFullColor = true;
            this.StartDraw(7);
        }
        else{
            let rand = Math.floor(Math.random() * this.UnshownShpaes.length);
            let idx = this.UnshownShpaes.splice(rand,1)[0];
            this.drawTimeList[idx] = 0;
            this.drawingList.push(idx); /* this will trigger corresponding drawtime begin to tick */
            this.IsBusy = true;
        }
    }

    UpdateRender(dt: number){
        let i = 0;
        while (i < this.drawingList.length) {
            if (this.drawTimeList[this.drawingList[i]] >= this.drawDuration) { 
                this.drawingList.splice(i,1);
            }
            else{
                i++;
            }
        }

        for (let i = 0; i < this.drawingList.length; i++) {
            let index = this.drawingList[i];
            if (this.drawTimeList[index] < this.drawDuration) { 
                this.drawTimeList[index] += dt;
            }
        }

        this.draw.clear();

        for (let i = 0; i < this.Shapes.length; i++) {
            /* if alpha is greater than 255, it will re-count from 256 */
            let alpha = this.ShapeCanvasAlphaMax * Math.min(this.drawTimeList[i],this.drawDuration)/this.drawDuration;
            this.RenderShape(this.Shapes[i], i, alpha);
        }

        if (this.drawingList.length == 0) {
            this.IsBusy = false;
            console.log("xxx - unbusy at UpdateRender");
        }
    }

    RenderShape(shapeString:string, colorIndex:number, alpha: number){
        let dots = shapeString.split(",");

        let startX = 0;
        let startY = 0;

        let i = 0;
        while (i < dots.length) {
            let x = this.Dots[Number(dots[i])].x;
            let y = this.Dots[Number(dots[i])].y;
            if (i == 0) {
                this.draw.moveTo(x,y);
                startX = x;
                startY = y;
            }
            else if(i == (dots.length/ - 2)){
                this.draw.lineTo(startX,startY);
            }
            else{
                this.draw.lineTo(x,y);
            }
            i ++;
        }

        this.draw.close();

        if (this.ShowTangramFullColor) {
            this.draw.fillColor = cc.hexToColor(this.TangramColors[colorIndex]);
        }
        else{
            this.draw.fillColor = cc.hexToColor(this.HintColors[this.HintColorRemap[colorIndex]]);
        }
        this.draw.fillColor = this.draw.fillColor.setA(alpha);
        this.draw.fill();

        // // make each shape a bit larger, to avoid small gaps between shapes
        // this.draw.lineWidth = this.SHAPE_LINE_WIDTH;
        // this.draw.strokeColor = this.draw.fillColor.setA(alpha*0.2);
        // this.draw.stroke();
    }

    ShowDisplayName(){
        let nameCN = "";
        let nameEN = "";
        if (this.CurrentDisplayNameKey != "") {
            let names = this.DisplayNameDictionary.TryGetValue(this.CurrentDisplayNameKey);
            if (names != null) {
                nameCN = names[0].trim();
                nameEN = names[1].trim();
                this.DisplayNameAnimate();
            }
        }

        this.ItemNumberLabel.string = "No." + this.TangramIndex.toString();
        this.DisplayNameEN.string = nameCN;
        this.DisplayNameCN.string = nameEN;
    }

    DisplayNameAnimate(){
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
        
    }

    ClearTangram(){
        this.draw.clear();
        this.FrameController.ClearFrame();
    }

    //#endregion

    //#region Button Logic

    ShowNextTangram(){
        if (this.IsBusy) {
            return;
        }

        this.HideContextMenus();

        //pick next tangram in data
        if (this.SeqMode == 0) {
            if (this.TangramIndex < this.ParamData.length-1 ) {
                this.TangramIndex++;
            }
            else {
                this.TangramIndex = 0;
            }
        }
        else{
            let rand = Math.floor(Math.random() * this.UnvisitedList.length);
            this.TangramIndex = this.UnvisitedList[rand];
        }

        this.SyncVistList();

        this.ShowTangram();
    }

    //#endregion

    //#region Hint

    GiveMeHint(){
        if (this.IsBusy) {
            return;
        }

        this.HideContextMenus();

        this.ShowOneMoreHint();
    }

    //#endregion

    //#region Progress Bar

    ShowProgressBar(){
        this.ProgressBar.setScale(0,1);
        this.ProgressBar.runAction(cc.sequence(
            cc.scaleTo(this.PRGRESS_DURATION, 1, 1),
            cc.callFunc(()=>this.DoThingsAfterProgress())
        ));
    }

    //#endregion

    //#region Difficulty, Sequence

    menuSeqOpen = false;
    menuDiffOpen = false;
    animations:cc.Animation = null;

    InitMenu(){
        // Level Buttons
        this.Level1.scale = 0;;
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
    }

    TapSeqMenu(event, customEventData){
        console.log("xxx TapSeqMenu : ");

        if (this.IsBusy) {
            return;
        }

        if (this.menuDiffOpen) {
            this.HideDiffMenu();
        }

        if (this.menuSeqOpen) {
            let idx = Number(customEventData);
            if (idx == 1) {
                this.SeqMode = this.SeqMode == 0 ? 1 : 0;
            }

            this.HideSeqMenu();
            this.SyncSeqMenu();
            this.SaveUserData();
        }
        else{
            this.ShowSeqMenu();
        }
    }

    SyncSeqMenu(){
        this.Seq0.getComponent(cc.Sprite).spriteFrame = this.SeqSpriteFrames[this.SeqMode];
        let idx = this.SeqMode == 0 ? 1 : 0;
        this.Seq1.getComponent(cc.Sprite).spriteFrame = this.SeqSpriteFrames[idx];
    }

    TapDiffMenu(event, customEventData){
        if (this.IsBusy) {
            return;
        }

        if (this.menuSeqOpen) {
            this.HideSeqMenu();
        }
        if (this.menuDiffOpen) {
            let idx = Number(customEventData);
            if (idx > 0 && idx <= this.Difficulty) {
                this.Difficulty = idx - 1;
            }
            else if(idx > this.Difficulty){
                this.Difficulty = idx;
            }

            this.HideDiffMenu();
            this.SyncDiffMenu();
            this.ApplyDiffMenu();
            this.SaveUserData();
        }
        else{
            this.ShowDiffMenu();
        }
    }

    SyncDiffMenu(){
        this.Level0.getComponent(cc.Sprite).spriteFrame = this.LevelSpriteFrames[this.Difficulty];

        let idx = 1;
        while (idx < this.LevelButtons.length) {
            if (idx <= this.Difficulty) {
                this.LevelButtons[idx].getComponent(cc.Sprite).spriteFrame = this.LevelSpriteFrames[idx - 1];                
            }
            else{
                this.LevelButtons[idx].getComponent(cc.Sprite).spriteFrame = this.LevelSpriteFrames[idx];                                
            }
            idx ++;
        }
    }

    ApplyDiffMenu(){
        this.IsBusy = true;
        this.ShowTangramFullColor = this.Difficulty == 8 ? true : false;
        let appearCount = Math.min(this.Difficulty, 7);// this.Difficulty may go up to 8
        this.StartDraw(appearCount);
    }

    HideContextMenus(){
        if (this.menuDiffOpen) {
            this.HideDiffMenu();
        }
        if (this.menuSeqOpen) {
            this.HideSeqMenu();
        }
    }

    ShowSeqMenu(){
        this.animations.playAdditive("MenuSeqOpen");
        this.menuSeqOpen = true;
    }

    HideSeqMenu(){
        this.animations.playAdditive("MenuSeqClose");
        this.menuSeqOpen = false;
    }

    ShowDiffMenu(){
        this.animations.playAdditive("MenuDiffOpen");
        this.menuDiffOpen = true;
    }

    HideDiffMenu(){
        this.animations.playAdditive("MenuDiffClose");
        this.menuDiffOpen = false;
    }

    //#endregion

    //#region Test

    Test(){
        // console.log("xxx drawingList : " + this.drawingList);
        // console.log("xxx drawTimeList : " + this.drawTimeList);
        console.log("xxx UnvisitedList : " + this.UnvisitedList);
    }

    //#endregion

    //#region WX Data API

    EnsureUserDataAccess(){
        // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        // }
        let fs = wx.getFileSystemManager();
        let data = null;
        try {
            data = fs.readFileSync(`${wx.env.USER_DATA_PATH}/userdata.txt`, 'utf8');        
        }catch(error){
        }

        if (data == null) {
            fs.writeFileSync(`${wx.env.USER_DATA_PATH}/userdata.txt`, '0;0;0;0', 'utf8');
        }
    }

    SaveUserData(){
        let str = "";
        str += this.TangramIndex.toString() + ";";
        str += this.Difficulty.toString() + ";";
        str += this.SeqMode.toString() + ";";

        for (let i = 0; i < this.VisitedList.length; i++) {
            str += this.VisitedList[i].toString() + ",";
        }

        let fs = wx.getFileSystemManager();
        fs.writeFileSync(`${wx.env.USER_DATA_PATH}/userdata.txt`, str, 'utf8');
        console.log("xxx save user data : " + str);
    }

    GetUserData():string{
        let fs = wx.getFileSystemManager();
        let data = null;
        try {
            data = fs.readFileSync(`${wx.env.USER_DATA_PATH}/userdata.txt`, 'utf8');        
        }catch(error){
        }

        return data;
    }

    //#endregion

}
