
const {ccclass, property} = cc._decorator;

@ccclass
export default class FrameCanvasController extends cc.Component {

    //#region Properties

    draw: cc.Graphics;
    drawDuration: number = 0.5;
    drawTime: number = 0;
    drawing: boolean = false;

    pointList: Array<cc.Vec2> = null;

    //#endregion

    start () {
        // this.DrawFrame();
    }

    update (dt) {
        if (this.drawing) {
            if (this.drawTime > this.drawDuration) {
                this.FinishDraw();
            }
            else{
                this.UpdateDraw(dt);
            }
        }
    }

    //#region Frame

    DrawFrame(){
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }

        this.draw.lineWidth = 3;
        this.draw.strokeColor =  cc.color(225,225,225);

        // this.draw.moveTo(0,0);
        // this.draw.lineTo(0,200);
        // this.draw.lineTo(200,200);

        //points
        let points = "304,79/304,214/245,155/186,214/162,190/79,273/79,440/186,332/304,450/304,313/363,254/363,137/421,79";
        let pointArray = points.split("/");
        let index = 0;
        while (index < pointArray.length) {
            let pointX = Number(pointArray[index].split(",")[0]);
            let pointY = 512 - Number(pointArray[index].split(",")[1]);
            if (index == 0) {
                this.draw.moveTo(pointX,pointY);
            }
            else{
                this.draw.lineTo(pointX,pointY);
            }
            index ++;
        }

        this.draw.close();
        this.draw.stroke();

        this.draw.fillColor = cc.color(32,32,32);
        this.draw.fill();
    }

    StartDraw(){
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }

        this.draw.clear();

        this.draw.lineWidth = 2;
        this.draw.strokeColor =  cc.color(225,225,225);

        //points
        let points = "304,79/304,214/245,155/186,214/162,190/79,273/79,440/186,332/304,450/304,313/363,254/363,137/421,79";
        let pointArray = points.split("/");
        this.pointList = new Array<cc.Vec2>();

        for (let index = 0; index < pointArray.length; index++) {
            let x = Number(pointArray[index].split(",")[0]);
            let y = 512 - Number(pointArray[index].split(",")[1]);
            this.pointList.push(new cc.Vec2(x,y));
        }

        // this.DrawBackground();

        this.drawTime = 0;
        this.drawing = true;
    }

    UpdateDraw(dt: number){
        this.drawTime += dt;
        
        let index = 0;
        while (index < this.pointList.length) {
            let pointFrom = this.pointList[index];
            let pointDest: cc.Vec2 = null;

            if (index == this.pointList.length - 1) {
                pointDest = this.pointList[0];
            }
            else{
                pointDest = this.pointList[index+1];
            }
            
            let pointTo = pointFrom.lerp(pointDest, this.drawTime/this.drawDuration);

            this.draw.moveTo(pointFrom.x,pointFrom.y);
            this.draw.lineTo(pointTo.x,pointTo.y);
            this.draw.stroke();
            index ++;
        }

    }

    DrawBackground(){
        let index = 0;
        while (index < this.pointList.length) {
            if (index == 0) {
                this.draw.moveTo(this.pointList[0].x,this.pointList[0].y);
            }
            else{
                this.draw.lineTo(this.pointList[index].x,this.pointList[index].y);
            }
            index ++;
        }

        this.draw.close();
        this.draw.fillColor = cc.color(32,32,32);
        this.draw.fill();
    }

    FinishDraw(){
        // this.DrawBackground();
        
        this.drawing = false;
        this.drawTime = 0;
    }

    ClearFrame(){
        this.draw.clear();
    }

    //#endregion

}
