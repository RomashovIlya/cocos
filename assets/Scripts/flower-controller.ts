
import { _decorator, Component, Node } from 'cc'
const { ccclass } = _decorator

import { DataFlower } from "./flower-manager"
import { DragDrop } from "./drag-n-drop"


@ccclass('FlowerController')
export class FlowerController extends Component {
  public data: DataFlower = null

  public async init(flowerData: DataFlower) {
    this.data = flowerData
  }

  // ON LOAD
  onLoad () {
    let { node } = this

    node.on(Node.EventType.MOUSE_DOWN, (event) => {
      if (event.getButton() === 0) {
        DragDrop.take(node)
      }
    })
  }

  // ON DESTROY
  onDestroy() {
    this.node.off(Node.EventType.MOUSE_DOWN)
  }
}
