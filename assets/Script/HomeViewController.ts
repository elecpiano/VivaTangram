import FrameCanvasController from "./FrameCanvasController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeViewController extends cc.Component {

    //#region Properties

    @property(FrameCanvasController)
    FrameController: FrameCanvasController = null;
    @property(cc.Node)
    ShapeCanvas: cc.Node = null;

    draw: cc.Graphics;

    NavigatedFromListView:boolean = false;
    ShapeCanvasAlphaMax = 150; // 0 is transparent, 255 is filled

    AppearQueue = Array<number>();
    ShownShpaes = Array<number>();
    UnshownShpaes = Array<number>();
    drawDuration: number = 0.3;
    drawInterval: number = 0.2;
    drawTimeList = new Array<number>();
    drawingList = new Array<number>();
    TANGRAM_INTERVAL: number = 0.9;
    IsBusy = false;

    TangramColors:string[] = ["#5faace","#3992bc","#287ca3","#19678b","#105778","#074561","#05354b"];
    //["#ffda4c","#52cad1","#ff493a","#3968bc","#ff8e2f","#ca4c89","#55d723"];
    ShowTangramFullColor:boolean = false;
    Difficulty = 7; // 0 is most difficult, 7 shows all shapes(without color), 8 shows all shapes with color
    HintColors:string[] = ["#5faace","#3992bc","#287ca3","#19678b","#105778","#074561","#05354b"];
    HintColorRemap = Array<number>();

    ParamData = Array<string>();
    Dots = Array<cc.Vec2>();
    Shapes = Array<string>();
    Frames = Array<string>();
    
    TangramIndex = 0;

    //#endregion

    //#region Navigation

    GoToListView(){
        cc.director.loadScene("ListView");
    }

    GoToGameBoard(){
        cc.director.loadScene("GameBoard");
    }

    //#endregion

    //#region Lifecycle

    onLoad () {
        this.LoadData();
    }

    start () {
        this.draw = this.ShapeCanvas.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.ShapeCanvas.addComponent(cc.Graphics);
        }

        //show tangram
        this.node.runAction(cc.sequence(
            cc.delayTime(this.TANGRAM_INTERVAL),
            cc.callFunc(()=>this.ShowNextTangram(),this)
        ));
    }

    update (dt) {
        if (this.drawingList.length > 0) {
            this.UpdateRender(dt);
        }
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
    }

    //#endregion

    //#region Tangram Render
    
    ShowNextTangram(){
        this.TangramIndex = Math.floor(Math.random() * this.ParamData.length);

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
            this.ShowNextTangram();
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
            
            // show next tangram
            this.node.runAction(cc.sequence(
                cc.delayTime(this.TANGRAM_INTERVAL),
                cc.callFunc(()=>this.ShowNextTangram(),this)
            ));
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
    }

    ClearTangram(){
        this.draw.clear();
        this.FrameController.ClearFrame();
    }

    //#endregion

}
