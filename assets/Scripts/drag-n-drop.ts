
import { _decorator, Component, Node } from 'cc'
const { ccclass } = _decorator

import { FlowerManager } from "./flower-manager"

 
@ccclass('DragDrop')
export class DragDrop extends Component {
  private static _dragIndex: number = 1000
  private static _dropIndex: number = 500

  private static _xMin: number = 0
  private static _xMax: number = 0
  private static _yMin: number = 0
  private static _yMax: number = 0

  private static _dragingNode: Node = null


  // INIT
  public static async init(step: number, fieldWidth: number, fieldHeight: number) {
    this._dragingNode = null

    const halfWidth = fieldWidth * 0.5
    const halfHeight = fieldHeight * 0.5
    
    this._xMin = -halfWidth + 20
    this._xMax = halfWidth - 20

    this._yMin = -halfHeight + 20
    this._yMax = halfHeight - 20
  }

  // TAKE
  public static async take(node: Node) {
    if (this._dragingNode !== null) return

    this._dragingNode = node
    this._dragingNode.setSiblingIndex(this._dragIndex)
  }

  // MOVE
  public static async move(event: any) {
    if (this._dragingNode === null) return

    let delta = event.getDelta()
    const { x, y } = this._dragingNode.position

    this._dragingNode.setPosition(x + delta.x, y + delta.y, 0)
    const { x: newX, y: newY } = this._dragingNode.getPosition()

    if (newX <= this._xMin || newX >= this._xMax || newY <= this._yMin || newY >= this._yMax) {
      await FlowerManager.dropDown(this._dragingNode)
      this._dragingNode = null
    }
  }

  // DROP
  public static async drop() {
    if (this._dragingNode === null) return

    await FlowerManager.startAction(this._dragingNode)

    this._dragingNode.setSiblingIndex(this._dropIndex)
    this._dragingNode = null
  }
}
