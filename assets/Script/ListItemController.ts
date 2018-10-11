
const {ccclass, property} = cc._decorator;

@ccclass
export default class ListItemController extends cc.Component {

    //#region Properties

    draw: cc.Graphics;
    DRAW_DURATION: number = 0.4;
    drawTime: number = 0;
    drawing: boolean = false;

    Dots = Array<cc.Vec2>();
    Shapes = Array<string>();
    Frames = Array<string>();

    Route = Array<string>();

    LINE_WIDTH = 15;
    STROKE_COLOR = "#353535";
    FILL_COLOR = "#ffda4c";
    TangramColors:string[] = ["#ffda4c","#52cad1","#ff493a","#3968bc","#ff8e2f","#ca4c89","#55d723"];

    ShowShape = false;

    //#endregion

    //#region Lifecycle

    start () {
        this.draw = this.getComponent(cc.Graphics);
        if (!this.draw) {
            this.draw = this.addComponent(cc.Graphics);
        }

        this.draw.fillColor = cc.hexToColor(this.FILL_COLOR);
        this.draw.lineWidth = this.LINE_WIDTH;
        this.draw.strokeColor =  cc.hexToColor(this.STROKE_COLOR);
    }

    update (dt) {
        if (this.drawing) {
            if (this.drawTime > this.DRAW_DURATION) {
                this.FinishDraw();
            }
            else{
                this.UpdateDraw(dt);
            }
        }
    }

    //#endregion

    //#region Frame

    Show(dots:Array<cc.Vec2>, shapes: Array<string>, frames: Array<string>, showShape){
        this.Dots = dots;
        this.Shapes = shapes;
        this.Frames = frames;
        this.ShowShape = showShape;
        this.StartDraw();
    }

    StartDraw(){
        this.draw.clear();

        this.drawTime = 0;
        this.drawing = true;

        //scale animation
        this.node.setScale(0.2,0.2);
        this.node.runAction(cc.sequence(
            cc.scaleTo(this.DRAW_DURATION * 0.5, 0.38, 0.38),
            cc.scaleTo(this.DRAW_DURATION * 0.5, 0.3, 0.3)
        ));
    }

    UpdateDraw(dt: number){
        this.drawTime += dt;
        
        this.draw.clear();

        /* if alpha is greater than 255, it will re-count from 256 */
        let alpha = 255 * Math.min(this.drawTime,this.DRAW_DURATION)/this.DRAW_DURATION;
        this.DrawFrame(alpha);

        if (this.ShowShape) {
            this.DrawSahpe(alpha);
        }
    }

    DrawFrame(alpha: number){
        for (let i = 0; i < this.Frames.length; i++) {
            let frameStr = this.Frames[i];
            let pointList = frameStr.split(",");

            let index = 0;
            let pointFrom = this.Dots[pointList[index]];
            this.draw.moveTo(pointFrom.x,pointFrom.y);

            while (index < pointList.length - 1) {
                // let pointFrom = this.Dots[pointList[index]];
                let pointDest = this.Dots[pointList[index+1]];
                // this.draw.moveTo(pointFrom.x,pointFrom.y);
                this.draw.lineTo(pointDest.x,pointDest.y);
                index ++;
            }
            this.draw.strokeColor = this.draw.strokeColor.setA(alpha);
            this.draw.stroke();
        }
    }

    DrawSahpe(alpha: number){
        for (let i = 0; i < 7; i++) {
            let shapeString = this.Shapes[i];
            let dots = shapeString.split(",");

            let startX = 0;
            let startY = 0;
    
            let idx = 0;
            while (idx < dots.length) {
                let x = this.Dots[Number(dots[idx])].x;
                let y = this.Dots[Number(dots[idx])].y;
                if (idx == 0) {
                    this.draw.moveTo(x,y);
                    startX = x;
                    startY = y;
                }
                else if(idx == (dots.length/ - 2)){
                    this.draw.lineTo(startX,startY);
                }
                else{
                    this.draw.lineTo(x,y);
                }
                idx ++;
            }
    
            this.draw.close();
            this.draw.fillColor = cc.hexToColor(this.TangramColors[i]);
            this.draw.fillColor = this.draw.fillColor.setA(alpha);
            this.draw.fill();
        }
    }

    DrawFrame2(dots:Array<cc.Vec2>, frames:string[]){
        this.Dots = dots;

        this.draw.clear();

        this.draw.lineWidth = this.LINE_WIDTH;
        this.draw.strokeColor =  cc.color(225,225,225);

        //frame list
        this.Frames = frames;

        this.drawTime = 0;
        this.drawing = true;
    }

    UpdateDraw2(dt: number){
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
                
                let pointTo = pointFrom.lerp(pointDest, this.drawTime/this.DRAW_DURATION);

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

    ClearDraw(){
        this.draw.clear();
    }

    //#endregion

    //#region Test


    //#endregion
}
