
import { _decorator, Component, Node, instantiate, Sprite, Prefab } from 'cc'
const { ccclass } = _decorator

import { FieldMap , DataCell } from "./field-map"
import { FlowerController } from "./flower-controller"

import { Shuffle } from "./shuffle"

export enum EnumFlower {
  FRUIT,
  BONUS,
}

export type DataFlower = {
  id: string
  type: EnumFlower
  level: number
  cell: string
  node: Node
}


@ccclass('FlowerManager')
export class FlowerManager extends Component {

  // GENERATE FLOWERS
  public static async generateFlowers(parent: Node, flowerPrfb: Prefab) {
    let cellsIdList = await Shuffle.getShuffled(Object.keys(FieldMap.cells))

    for (let i = 0; i < 3; i++) {
      const cellID = cellsIdList[i]
      let cellData = FieldMap.cells[cellID] as DataCell

      const flowerData = {
        id: 'flower-' + i,
        type: i < 2 ? EnumFlower.FRUIT : EnumFlower.BONUS,
        level: 1,
        cell: cellID.slice(),
        node: instantiate(flowerPrfb)
      } as DataFlower

      cellData.flower = flowerData

      let { node } = flowerData

      const flowerController = node.getComponent('FlowerController') as FlowerController
      await flowerController.init(flowerData)
      
      const sprite = node.getComponent(Sprite)
      sprite.spriteFrame = sprite.spriteAtlas.spriteFrames[flowerData.type === EnumFlower.FRUIT ? 'flower_1' : 'bonus']
      
      parent.addChild(node)

      node.setPosition(cellData.position)
      node.setSiblingIndex(500)
    }
  }

  // START ACTION
  public static async startAction(activeNode: Node) {
    let { data: activeFlower } = activeNode.getComponent('FlowerController') as FlowerController
    const { x, y } = activeNode.position

    await FieldMap.clearCell(activeFlower.cell)

    let overlappingCellData = await FieldMap.getOverlappingCell(x, y)

    if (overlappingCellData) {
      const anotherFlower = overlappingCellData.flower as DataFlower

      if (anotherFlower) {
        if (activeFlower.type === anotherFlower.type && activeFlower.level === anotherFlower.level) {
          // merge
          await this.mergeFlowers(overlappingCellData.id, activeFlower, anotherFlower)
        } else {
          // replace
          await this.replaceFlowers(overlappingCellData.id, activeFlower, anotherFlower)
        }
      } else {
        // place here
        await this.placeIntoCell(overlappingCellData.id, activeFlower)
      }
    } else {
      // turn back
      await this.placeIntoCell(activeFlower.cell, activeFlower)
    }
  }

  // DROP DOWN
  public static async dropDown(activeNode: Node) {
    let { data: activeFlower } = activeNode.getComponent('FlowerController') as FlowerController
    await this.placeIntoCell(activeFlower.cell, activeFlower)
  }


  // MERGE FLOWERS
  private static async mergeFlowers(cellID: string, activeFlower: DataFlower, anotherFlower: DataFlower) {
    activeFlower.level++

    const sprite = activeFlower.node.getComponent(Sprite)
    sprite.spriteFrame = sprite.spriteAtlas.spriteFrames['flower_' + activeFlower.level]

    anotherFlower.node.destroy()
    await this.placeIntoCell(cellID, activeFlower)
  }

  // REPLACE FLOWERS
  private static async replaceFlowers(targetCellID: string, activeFlower: DataFlower, anotherFlower: DataFlower) {
    let anotherCell = await FieldMap.getEmptyBound(anotherFlower.cell) as DataCell

    await this.placeIntoCell(anotherCell ? anotherCell.id : activeFlower.cell, anotherFlower)
    await this.placeIntoCell(targetCellID, activeFlower)
  }
  
  // PLACE INTO CELL
  private static async placeIntoCell(cellID: string, flower: DataFlower) {
    let newCell = FieldMap.cells[cellID] as DataCell

    newCell.flower = flower
    flower.cell = cellID.slice()

    flower.node.setPosition(newCell.position)
  }
}
