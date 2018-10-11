import FrameCanvasController from "./FrameCanvasController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DrawTangramController extends cc.Component {

    //#region Properties

    // xxx for debug
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;
    
    @property(FrameCanvasController)
    FrameController: FrameCanvasController = null;

    draw: cc.Graphics;
    TangramColors:string[] = ["#ffda4c","#52cad1","#ff493a","#3968bc","#ff8e2f","#ca4c89","#55d723"];

    drawDuration: number = 0.3;
    drawInterval: number = 0.07;
    drawTimeList = new Array<number>();
    drawingList = new Array<number>();

    Dots = Array<cc.Vec2>();
    Shapes = Array<string>();
    Frames = Array<string>();
    AppearQueue = Array<number>();

    ParamList = Array<string>();

    //#endregion

    // onLoad () {}

    start () {
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }

        // xxx for debug
        // this.LoadParam();
    }

    update (dt) {
        if (this.drawingList.length > 0) {
            this.UpdateDraw(dt);
        }
    }

    //#region Tangram Shapes
    
    // param1 = "225.125,31.75;141.875,114.75;308,114.875;182,115.375;265.375,115.875;182.25,198.375;265.625,198.25;106.5,198.625;341.375,198.5;268.125,272.375;223,315.625;149,390;383.875,389.5;66.875,472.875;150.25,473.625;233.75,390.125;300.75,390.125;382.875,472;467.25,472.5/9,11,12;7,10,8;0,1,2;13,14,15,11;12,17,18;16,17,12;3,5,6,4/0,1,3,5,7,10,13,14,15,16,17,18,9,8,6,4,2,0";
    // param2 = "240.625,18.125;181.5,76.25;240.375,135.25;299.625,77;158.125,149.375;324.75,150.125;158.375,315.375;256.125,218.125;255.75,336.5;374.375,336.375;88.625,384.875;6.375,467.875;89.875,468.125;172.5,384.75;255.625,467.625;256.125,384.625;410,371.5;410.875,454.5;494,454.125/4,6,5;10,15,7;8,9,7;12,13,10,11;17,16,18;14,15,13;1,2,3,0/0,1,2,3,0;4,6,11,12,13,14,8,9,7,5,4;16,17,18,16";
    // param3 = "228.25,502.5;311,502.625;311.375,419.5;269.75,460.375;387,342.75;353,307.25;436.5,139.25;353.25,222.625;269.5,224.125;185.625,340.5;67.625,223.125;185.5,105.875;186,139.875;269.875,139.75;352,80;293.75,138.875;235,80;293.375,21.625/11,10,9;8,3,4;13,7,6;13,8,5,7;12,8,13;0,1,2;17,16,15,14/17,16,15,12,11,10,9,12,8,3,0,1,2,4,5,7,6,15,14,17";
    paramIndex = 0;

    LoadParam(){
        //pick a param string
        cc.loader.loadRes(
            "param",
            (error, txt:string)=>{
                this.ParamList = txt.split("\n");
                // console.log("xxx: " + this.ParamList.length);

            }
        );
    }

    PrepareParam(){
        if (this.paramIndex < this.ParamList.length-1 ) {
            this.paramIndex++;
        }
        else {
            this.paramIndex = 0;
        }
        let param = this.ParamList[this.paramIndex];

        // xxx for debug
        param = this.EditBox.string;     
        console.log("xxx: " + param);


        // begin prepare
        let paramArray = param.split("/");

        // dots
        this.Dots.splice(0,this.Dots.length);
        let dotsPositonStr = paramArray[0].split(";");
        for (let i = 0; i < dotsPositonStr.length; i++) {
            let posStr = dotsPositonStr[i];
            let x = Math.round(Number(posStr.split(",")[0]));
            let y = Math.round(Number(posStr.split(",")[1]));
            let dotPosition = new cc.Vec2(x,512 - y);
            this.Dots.push(dotPosition);

            console.log("xxx: " + x + " , " + y);

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

    ShowTangram(){
        this.ClearTangram();
        this.PrepareParam();

        this.FrameController.StartDraw(this.Dots, this.Frames);

        this.node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(()=>this.StartDraw(),this)
        ));
    }

    Debug_Show_Frame(){
        this.ClearTangram();
        this.PrepareParam();

        this.FrameController.StartDraw(this.Dots, this.Frames);
    }

    Debug_Show_Shape(){
        this.ClearTangram();
        this.PrepareParam();

        this.StartDraw();
    }

    StartDraw(){
        this.draw.clear();

        // appear queue
        this.AppearQueue = [ 0, 1, 2, 3, 4, 5, 6 ];
        
        this.drawTimeList = new Array<number>();
        for (let i = 0; i < this.Shapes.length; i++) {
            this.drawTimeList.push(0);
        }

        this.ShowNext();
    }

    UpdateDraw(dt: number){
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
            this.DrawSahpe(this.Shapes[i], i, alpha);
        }
    }

    DrawSahpe(shapeString:string, colorIndex:number, alpha: number){
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
        this.draw.fillColor = cc.hexToColor(this.TangramColors[colorIndex]);
        this.draw.fillColor = this.draw.fillColor.setA(alpha);
        this.draw.fill();
    }

    ShowNext(){
        if (this.AppearQueue.length>0) {
            let rand = Math.floor(Math.random() * this.AppearQueue.length);
            let idx = this.AppearQueue.splice(rand,1)[0];
            this.drawingList.push(idx); /* this will trigger corresponding drawtime begin to tick */

            this.node.runAction(cc.sequence(
                cc.delayTime(this.drawInterval),
                cc.callFunc(()=>this.ShowNext(),this)
            ));
        }
    }

    ClearTangram(){
        if (this.draw) {
            this.draw.clear();
        }
        this.FrameController.ClearFrame();
    }

    //#endregion
    

}
