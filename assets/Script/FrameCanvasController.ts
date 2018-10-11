
const {ccclass, property} = cc._decorator;

@ccclass
export default class FrameCanvasController extends cc.Component {

    //#region Properties

    draw: cc.Graphics;
    drawDuration: number = 0.5;
    drawTime: number = 0;
    drawing: boolean = false;

    Frames = Array<string>();
    Dots = Array<cc.Vec2>();

    LINE_WIDTH = 8;
    LINE_COLOR = "#353535";

    //#endregion

    start () {
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }
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

    StartDraw(dots:Array<cc.Vec2>, frames:string[]){
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
    }

    UpdateDraw(dt: number){
        this.drawTime += dt;
        
        for (let i = 0; i < this.Frames.length; i++) {
            let frameStr = this.Frames[i];
            let pointList = frameStr.split(",");

            let index = 0;
            while (index < pointList.length) {
                let pointFrom = this.Dots[pointList[index]];
                let pointDest: cc.Vec2 = null;

                if (index == pointList.length - 1) {
                    pointDest = this.Dots[pointList[0]];
                }
                else{
                    pointDest = this.Dots[pointList[index+1]];
                }
                
                let pointTo = pointFrom.lerp(pointDest, this.drawTime/this.drawDuration);

                this.draw.moveTo(pointFrom.x,pointFrom.y);
                this.draw.lineTo(pointTo.x,pointTo.y);
                this.draw.stroke();
                index ++;
            }
        }

    }

    FinishDraw(){
        this.drawing = false;
        this.drawTime = 0;
    }

    ClearFrame(){
        this.draw.clear();
    }

    //#endregion

}
