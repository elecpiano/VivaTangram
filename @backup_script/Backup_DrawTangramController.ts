
const {ccclass, property} = cc._decorator;

@ccclass
export default class DrawTangramController_Backup extends cc.Component {

    //#region Properties

    draw: cc.Graphics;

    //#endregion

    // onLoad () {}

    start () {

        // this.ArrangeTangram(
        //     547,618,270,
        //     621,692,90,
        //     620,808,135,
        //     390,618,0,
        //     638,1029,45,
        //     472,1029,225,
        //     555,946,45,
        //     );
    }

    // update (dt) {}

    //#region Tangram Position

    Arrange(){
        this.Shapes.splice(0,this.Shapes.length);

        let array = "79,273,90/187,332,45/304,80,90/A361,141,90/162,273,270/163,273,0/187,214,45";
        let arrangements = array.split("/");
        for (let index = 0; index < arrangements.length; index++) {
            let shape: cc.Node = null;
            if (arrangements[index][0] == "A") {
                shape = this.node.getChildByName("T4A");
            }
            else{
                shape = this.node.getChildByName("T"+(index+1).toString());
            }
            // console.log("xxx" + "T" + (index+1).toString() );
            let x = Number(arrangements[index].split(",")[0].replace("A",""));
            let y = 512 - Number(arrangements[index].split(",")[1]);
            let r = Number(arrangements[index].split(",")[2]);

            shape.opacity = 0;
            shape.setPosition(x,y);
            shape.rotation = r;

            this.Shapes.push(shape);
            this.AppearLater(shape);
        }
    }

    Appear(shape: cc.Node){
        shape.opacity = 0;
        let duration = (cc.random0To1()+0.5)*0.5;
        shape.runAction(cc.sequence(
            cc.delayTime(0.6),
            cc.fadeIn(duration)
        ));
        // shape.runAction(
        //     cc.fadeIn(duration)
        // );
    }

    Shapes = Array<cc.Node>();
    AppearQueue = Array<cc.Node>();
    AppearLater(shape: cc.Node){
        this.AppearQueue.push(shape);
        if (this.AppearQueue.length == 7) {
            this.node.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(()=>this.AppearNext(),this)
            ));
            // this.AppearNext();            
        }
    }

    AppearNext(){
        if (this.AppearQueue.length>0) {
            let idx = Math.floor(Math.random() * this.AppearQueue.length);
            let shape = this.AppearQueue.splice(idx,1)[0];
            shape.runAction(cc.sequence(
                cc.delayTime(0.07),
                cc.callFunc(()=>this.AppearNext(),this)
            ));

            shape.runAction(
                cc.fadeIn(0.3)
            );
        }
    }

    Clear(){
        for (var shape of this.Shapes) {
            shape.opacity = 0;
        }
    }

    // ArrangeTangram(
    //     p1x:number, p1y:number, r1:number, 
    //     p2x:number, p2y:number, r2:number, 
    //     p3x:number, p3y:number, r3:number, 
    //     p4x:number, p4y:number, r4:number, 
    //     p5x:number, p5y:number, r5:number, 
    //     p6x:number, p6y:number, r6:number, 
    //     p7x:number, p7y:number, r7:number, ){

    //         this.T1.node.setPosition(p1x,p1y);
    //         this.T1.node.rotation = r1;

    //         this.T2.node.setPosition(p2x,p2y);        
    //         this.T2.node.rotation = r2;

    //         this.T3.node.setPosition(p3x,p3y);
    //         this.T3.node.rotation = r3;

    //         this.T4.node.setPosition(p4x,p4y);
    //         this.T4.node.rotation = r4;

    //         this.T5.node.setPosition(p5x,p5y);
    //         this.T5.node.rotation = r5;

    //         this.T6.node.setPosition(p6x,p6y);
    //         this.T6.node.rotation = r6;

    //         this.T7.node.setPosition(p7x,p7y);
    //         this.T7.node.rotation = r7;
    // }

    // Blink(shape: cc.Node){
    //     shape.opacity = 0;
    //     shape.runAction(
    //         cc.sequence(
    //             cc.fadeIn(1),
    //             cc.fadeOut(1)
    //         )
    //     );
    // }

    //#endregion
    

}
