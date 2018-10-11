import ListItemController from "./ListItemController";
import GlobalData from "./Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ListViewController extends cc.Component {

    //#region Properties

    @property(cc.Node)
    ProgressBar: cc.Node = null;
    @property(cc.Label)
    PageLabel: cc.Label = null;
    @property(cc.Node)
    UIPanel: cc.Node = null;

    @property(ListItemController)
    ListItemTemplate: ListItemController = null;
    
    ROW_COUNT = 7;
    COLUMN_COUNT = 4;
    ITEM_WIDTH = 240;
    ITEM_HEIGHT = 220;
    ITEM_MARGIN_L = 120;
    ITEM_MARGIN_T = 120;
    APPEAR_INTERVAL: number = 0.015;
    PRGRESS_DURATION = 0.7;

    ItemNodes = new Array<cc.Node>();
    Items = new Array<ListItemController>();

    ParamData = Array<string>();
    PageData = Array<string>();
    PageIndex = 0;

    AppearQueue = new Array<number>();

    ShowShape = false;

    //#endregion

    //#region Lifecycle

    onLoad () {
        this.InitItemList();
        this.LoadData();
        this.UIPanel.opacity = 0;
    }

    start () {
        // this.node.runAction(cc.sequence(
        //     cc.delayTime(0.3),
        //     cc.callFunc(()=>this.ShowList(),this)
        // ));

        this.ShowProgressBar();
    }

    // update (dt) {}

    DoThingsAfterProgress(){
        //hide progress bar
        this.ProgressBar.setScale(0,1);

        //show UI Panel
        this.UIPanel.opacity = 255;

        //set page
        this.SetPage();

        //show list
        this.ShowList();
    }

    //#endregion

    //#region Navigation

    NavigateToGameBoard(){
        cc.director.loadScene("GameBoard");
    }

    TapItem(event, customEventData){
        let index = 28*this.PageIndex + Number(customEventData);
        console.log("xxx item tap : " + index);

        let globalNode = cc.director.getScene().getChildByName('GlobalNode');       
        globalNode.getComponent(GlobalData).SelectedItemIndex = index;
        globalNode.getComponent(GlobalData).NavigatedFromListView = true;

        cc.director.loadScene("GameBoard");
    }

    //#endregion

    //#region Param Data

    LoadData(){
        //pick a param string
        cc.loader.loadRes(
            "param",
            (error, txt:string)=>{
                this.ParamData = txt.split("\n");
            }
        );
    }

    RenderItem(item:ListItemController, itemData:string){
        // // pick a random tangram
        // let rand = Math.floor(Math.random() * this.ParamData.length);
        // let itemData = this.ParamData[rand];

        // begin prepare
        let paramArray = itemData.split("/");

        // dots
        let dots = new Array<cc.Vec2>();
        let dotsPositonStr = paramArray[0].split(";");
        for (let i = 0; i < dotsPositonStr.length; i++) {
            let posStr = dotsPositonStr[i];
            let x = Math.round(Number(posStr.split(",")[0]));
            let y = Math.round(Number(posStr.split(",")[1]));
            let dotPosition = new cc.Vec2(x,512 - y);
            dots.push(dotPosition);
        }

        //shapes
        let shapes = Array<string>();
        let shapeListStr = paramArray[1].split(";");
        for (let i = 0; i < shapeListStr.length; i++) {
            let shapeStr = shapeListStr[i];
            shapes.push(shapeStr);
        }

        //frames
        let frames = Array<string>();
        let frameListStr = paramArray[2].split(";");
        for (let i = 0; i < frameListStr.length; i++) {
            let frameStr = frameListStr[i];
            frames.push(frameStr);
        }

        //draw item
        item.Show(dots, shapes, frames, this.ShowShape);
    }

    //#endregion

    //#region List Management

    InitItemList(){
        this.Items.splice(0,this.Items.length);
        this.ItemNodes.splice(0,this.ItemNodes.length);

        let target = this.ListItemTemplate.node;

        for (let row = 0; row < this.ROW_COUNT; row++) {
            for (let column = 0; column < this.COLUMN_COUNT; column++) {
                let itemNode = cc.instantiate(target);
                let btn = itemNode.getComponent(cc.Button);
                btn.clickEvents[0].customEventData = (row * this.COLUMN_COUNT + column).toString();
                itemNode.parent = target.parent;
                itemNode.setPosition(column * this.ITEM_WIDTH + this.ITEM_MARGIN_L, 0 - row * this.ITEM_HEIGHT - this.ITEM_MARGIN_T);
                this.ItemNodes.push(itemNode);

                let item = itemNode.getComponent<ListItemController>(ListItemController);
                this.Items.push(item);
            }
        }
    }

    // AppearIndex = 0;
    ShowList(){
        this.ClearItemList();

        // this.AppearIndex = 0;
        this.AppearQueue.splice(0,this.AppearQueue.length);

        let tempArr = new Array<number>();
        for (let i = 0; i < this.PageData.length; i++) {
            tempArr.push(i);
        }

        while (tempArr.length > 0) {
            let rand = Math.floor(Math.random() * tempArr.length);
            let data = tempArr.splice(rand,1)[0];
            this.AppearQueue.push(data);
        }

        this.ShowNextItem();
    }

    ShowNextItem(){
        // if (this.AppearIndex < this.COLUMN_COUNT * this.ROW_COUNT && this.AppearIndex < this.PageData.length) {
        if (this.AppearQueue.length > 0) {
            let index = this.AppearQueue.pop();
            this.RenderItem(this.Items[index], this.PageData[index]);
            // this.RenderItem(this.Items[this.AppearIndex], this.PageData[this.AppearIndex]);
            // this.AppearIndex++;

            this.node.runAction(cc.sequence(
                cc.delayTime(this.APPEAR_INTERVAL),
                cc.callFunc(()=>this.ShowNextItem(),this)
            ));
        }
    }

    ClearItemList(){
        for (let i = 0; i < this.Items.length; i++) {
            this.Items[i].FinishDraw();
            this.Items[i].ClearDraw();
        }
    }

    //#endregion

    //#region Page management

    NextPage(){
        let maxIndex = Math.ceil(this.ParamData.length/(this.COLUMN_COUNT * this.ROW_COUNT)) - 1;
        if (this.PageIndex < maxIndex) {
            this.PageIndex++;
        }
        else{
            this.PageIndex = 0;
        }
        this.SetPage();
        this.ShowList();
    }

    PreviousPage(){
        if (this.PageIndex > 0) {
            this.PageIndex--;    
        }
        else{
            let maxIndex = Math.ceil(this.ParamData.length/(this.COLUMN_COUNT * this.ROW_COUNT)) - 1;
            this.PageIndex = maxIndex;
        }
        this.SetPage();
        this.ShowList();
    }

    SetPage(){
        let pageLabelString = (this.PageIndex + 1).toString() + "/" + Math.ceil(this.ParamData.length/(this.COLUMN_COUNT * this.ROW_COUNT)).toString();
        this.PageLabel.string = pageLabelString;

        // console.log("xxx page " + pageLabelString);

        let itemCountPerPage = this.COLUMN_COUNT * this.ROW_COUNT;
        let idx = itemCountPerPage * this.PageIndex;
        this.PageData.splice(0,this.PageData.length);
        while (idx < (this.ParamData.length -1)) {
            if (this.PageData.length < itemCountPerPage) {
                this.PageData.push(this.ParamData[idx]);
            }
            else{
                break;
            }
            idx++
        }
    }

    //#endregion

    //#region Test

    Test(){
        // this.ShowShape = false;
        // this.ShowList();
    }

    Test2(){
        // this.ShowShape = true;
        // this.ShowList();
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

}
