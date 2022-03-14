import { _decorator, Component, Node, Prefab, instantiate, UITransform, Size } from 'cc'
const { ccclass, property } = _decorator

import { FieldMap, DataMap } from "./field-map"
import { FlowerManager } from "./flower-manager"


import { DragDrop } from "./drag-n-drop"


@ccclass('FieldManager')
export class FieldManager extends Component {
  @property({type: Prefab})
  public tilePrfb: Prefab | null = null

  @property({type: Prefab})
  public flowerPrfb: Prefab | null = null

  private _rows: number = 2
  private _columns: number = 3
  private _step: number = 90

  private _startX: number = 0
  private _startY: number = 0

  private _width: number = 0
  private _height: number = 0

  // ON LOAD
  onLoad () {
    this._width = this._step * this._columns + 10
    this._height = this._step * this._rows + 10

    this._startX = -this._width * 0.5 + 50
    this._startY = -this._height * 0.5 + 50

    let tranform = this.node.getComponent(UITransform)
    tranform.setContentSize(new Size(this._width, this._height))

    this.node.on(Node.EventType.MOUSE_MOVE, (event) => {
      if (event.getButton() === 0) {
        DragDrop.move(event)
      }
    })

    this.node.on(Node.EventType.MOUSE_UP, (event) => {
      if (event.getButton() === 0) {
        DragDrop.drop()
      }
    })
  }

  // START
  start () {
    this.init()
  }

  // INIT
  async init() {
    await DragDrop.init(this._step, this._width, this._height)

    await FieldMap.generateMap({
      rows: this._rows,
      columns: this._columns,
      step: this._step,
      startX: this._startX,
      startY: this._startY
    } as DataMap)

    await this.generateTiles()

    await FlowerManager.generateFlowers(this.node, this.flowerPrfb)
  }

  // GENERATE TILES
  async generateTiles() {
    for (let id in FieldMap.cells) {
      let tile: Node = instantiate(this.tilePrfb)
      
      if (tile) {
        this.node.addChild(tile)
        tile.setPosition(FieldMap.cells[id].position)
      }
    }
  }

  // ON DESTROY
  onDestroy() {
    this.node.off(Node.EventType.MOUSE_MOVE)
    this.node.off(Node.EventType.MOUSE_UP)
  }
}
