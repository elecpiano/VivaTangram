import FrameCanvasController from "./FrameCanvasController";
import Dictionary from "./Dictionary";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DrawTangramController extends cc.Component {

    //#region Properties

    @property(cc.Label)
    DisplayNameCN: cc.Label = null;
    @property(cc.Label)
    DisplayNameEN: cc.Label = null;
    @property(cc.Node)
    ProgressBar: cc.Node = null;
    @property(cc.Node)
    UIPanel: cc.Node = null;
    @property(cc.Node)
    RootCanvas: cc.Node = null;
    
    @property(FrameCanvasController)
    FrameController: FrameCanvasController = null;

    draw: cc.Graphics;
    TangramColors:string[] = ["#ffda4c","#52cad1","#ff493a","#3968bc","#ff8e2f","#ca4c89","#55d723"];

    HintLevel = 7;
    ShowHintColor:boolean = true;
    HintColors:string[] = ["#5faace","#3992bc","#287ca3","#19678b","#105778","#074561","#05354b"];
    HintColorTable = Array<number>();

    ParamData = Array<string>();
    DictionaryData = Array<string>();
    DisplayNameDictionary: Dictionary<string,string[]>;
    DISPLAY_NAME_DURATION = 0.5;

    Dots = Array<cc.Vec2>();
    Shapes = Array<string>();
    Frames = Array<string>();
    CurrentDisplayNameKey = "";

    AppearQueue = Array<number>();
    drawDuration: number = 0.2;
    drawInterval: number = 0.05;
    drawTimeList = new Array<number>();
    drawingList = new Array<number>();

    PRGRESS_DURATION = 0.5;
    
    paramIndex = 0;

    //#endregion

    //#region Lifecycle

    onLoad () {
        this.LoadData();
        this.UIPanel.opacity = 0;
    }

    start () {
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
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

        //show UI Panel
        this.UIPanel.opacity = 255;

        //dictionary
        this.PrepareDictionary();

        // user data
        this.EnsureUserDataAccess();
        let data = this.GetUserData();
        this.paramIndex = Number(data);

        //show tangram
        this.ShowTangram();
    }

    //#endregion

    //#region Param Data & Dictionary

    LoadData(){
        cc.loader.loadRes(
            "param",
            (error, txt:string)=>{
                this.ParamData = txt.split("\n");
                // console.log("xxx: " + this.ParamList.length);
            }
        );

        cc.loader.loadRes(
            "dictionary",
            (error, txt:string)=>{
                this.DictionaryData = txt.split("\n");
                // console.log("xxx: " + this.DictionaryData);
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
        this.ClearTangram();
        this.PrepareParam();

        // this.FrameController.StartDraw(this.Dots, this.Frames);

        this.node.runAction(cc.sequence(
            cc.callFunc(()=>this.FrameController.StartDraw(this.Dots, this.Frames),this),
            cc.delayTime(0.5),
            cc.callFunc(()=>this.StartDraw(),this)
        ));

        this.ShowDisplayName();

        this.SaveUserData(this.paramIndex.toString());
    }

    PrepareParam(){
        let param = this.ParamData[this.paramIndex];
        
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

            // console.log("xxx: " + x + " , " + y);
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
            this.CurrentDisplayNameKey = paramArray[3];            
        }
        else{
            this.CurrentDisplayNameKey = "";
        }
    }

    StartDraw(){
        this.draw.clear();

        // randomize appear queue
        let tempQueue = [ 0, 1, 2, 3, 4, 5, 6 ];
        this.AppearQueue.splice(0,this.AppearQueue.length);
        while (this.AppearQueue.length < this.HintLevel) {
            let rand = Math.floor(Math.random() * tempQueue.length);
            let idx = tempQueue.splice(rand,1)[0];
            this.AppearQueue.push(idx);
        }

        // randomize hint color
        tempQueue = [ 0, 1, 2, 3, 4, 5, 6 ];
        this.HintColorTable.splice(0,this.HintColorTable.length);
        while (tempQueue.length > 0) {
            let rand = Math.floor(Math.random() * tempQueue.length);
            let idx = tempQueue.splice(rand,1)[0];
            this.HintColorTable.push(idx);
        }
        
        this.drawTimeList = new Array<number>();
        for (let i = 0; i < this.Shapes.length; i++) {
            this.drawTimeList.push(0);
        }

        this.ShowNextShape();
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

    UpdateRender(dt: number){
        let idx = 0;
        while (idx < this.drawingList.length) {
            if (this.drawTimeList[this.drawingList[idx]] > this.drawDuration) { 
                this.drawingList.splice(idx,1);
            }
            else{
                idx++;
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
            let alpha = 255 * Math.min(this.drawTimeList[i],this.drawDuration)/this.drawDuration;
            this.RenderShape(this.Shapes[i], i, alpha);
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

        if (this.ShowHintColor) {
            this.draw.fillColor = cc.hexToColor(this.HintColors[this.HintColorTable[colorIndex]]);
        }
        else{
            this.draw.fillColor = cc.hexToColor(this.TangramColors[colorIndex]);
        }
        this.draw.fillColor = this.draw.fillColor.setA(alpha);
        this.draw.fill();
    }

    ShowDisplayName(){
        let nameCN = "";
        let nameEN = "";
        if (this.CurrentDisplayNameKey != "") {
            let names = this.DisplayNameDictionary.TryGetValue(this.CurrentDisplayNameKey);
            if (names != null) {
                nameCN = names[0];
                nameEN = names[1];

                this.DisplayNameAnimate();
            }
        }

        this.DisplayNameEN.string = nameCN;
        this.DisplayNameCN.string = nameEN;
    }

    DisplayNameAnimate(){
        this.DisplayNameEN.node.opacity = 0;
        this.DisplayNameCN.node.opacity = 0;


        this.node.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(
                ()=>{
                    this.DisplayNameCN.node.runAction(cc.fadeIn(this.DISPLAY_NAME_DURATION));
                },this)
        ));

        this.node.runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(
                ()=>{
                    this.DisplayNameEN.node.runAction(cc.fadeIn(this.DISPLAY_NAME_DURATION));
                },this)
        ));
        
    }

    ClearTangram(){
        this.draw.clear();
        this.FrameController.ClearFrame();
    }

    //#endregion

    //#region Button Logic

    ShowNextTangram(){
        //pick next tangram in data
        if (this.paramIndex < this.ParamData.length-1 ) {
            this.paramIndex++;
        }
        else {
            this.paramIndex = 0;
        }

        this.ShowTangram();
    }

    //#endregion

    //#region Test

    Test_LoadData(){
        let data = this.GetUserData();
        this.DisplayNameCN.string = data;
    }

    Test_ShowAnswer(){
        this.ShowHintColor = false;
        this.ShowTangram();
    }

    Test_Show_Frame(){
        this.ClearTangram();
        this.PrepareParam();

        this.FrameController.StartDraw(this.Dots, this.Frames);
    }

    Test_Show_Shape(){
        this.ClearTangram();
        this.PrepareParam();

        this.StartDraw();
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
            fs.writeFileSync(`${wx.env.USER_DATA_PATH}/userdata.txt`, '0', 'utf8');
        }
    }

    SaveUserData(data:string){
        let fs = wx.getFileSystemManager();
        fs.writeFileSync(`${wx.env.USER_DATA_PATH}/userdata.txt`, data, 'utf8');
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

    //#region Progress Bar

    ShowProgressBar(){
        this.ProgressBar.setScale(0,1);
        this.ProgressBar.runAction(cc.sequence(
            cc.scaleTo(this.PRGRESS_DURATION, 1, 1),
            cc.callFunc(()=>this.DoThingsAfterProgress())
        ));
    }

    //#endregion

    //#region Context Menu

    animations:cc.Animation = null;
    ShowSeqMenu(){
        if (this.animations == null) {
            this.animations = this.RootCanvas.getComponent(cc.Animation);
        }
        this.animations.play("menuSeqOpen");
    }

    HideSeqMenu(){
        this.animations.play("menuSeqClose");
    }

    ShowDifficultyMenu(){
        if (this.animations == null) {
            this.animations = this.RootCanvas.getComponent(cc.Animation);
        }
        this.animations.play("menuDiffOpen");
    }

    HideDifficultyMenu(){
        this.animations.play("menuDiffClose");
    }

    //#endregion

}
