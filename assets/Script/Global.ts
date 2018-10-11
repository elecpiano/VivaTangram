
const {ccclass, property} = cc._decorator;

@ccclass
export default class GlobalData extends cc.Component{
    SelectedItemIndex:number = 0;
    NavigatedFromListView:boolean = false;

    onLoad () {
        cc.game.addPersistRootNode(this.node);
    }
}
