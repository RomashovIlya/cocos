import { _decorator, Component, Vec3 } from 'cc'
const { ccclass } = _decorator

import { DataFlower } from "./flower-manager"
import { Shuffle } from "./shuffle"

export type DataCell = {
  id: string
  position: Vec3
  bounds: string[]
  flower: DataFlower | null
}

export type DataMap = {
  rows: number
  columns: number
  step: number
  startX: number
  startY: number
}


@ccclass('FieldMap')
export class FieldMap extends Component {
  public static cells: object = Object.create(null)

  private static _mapData: DataMap = null
  private static _coverlappingRadius: number = 0

  // GENERATE MAP
  public static async generateMap(mapData: DataMap) {
    this._mapData = mapData
    this._coverlappingRadius = this._mapData.step * 0.4

    for (let row = 0; row < this._mapData.rows; row++ ) {
      const posY: number = this._mapData.startY + row * this._mapData.step

      for (let column = 0; column < this._mapData.columns; column++ ) {
        const id: string = column + '-' + row
        const posX: number = this._mapData.startX + column * this._mapData.step

        this.cells[id] = {
          id: id,
          position: new Vec3(posX, posY, 0),
          bounds: await this.getBounds(column, row),
          flower: null,
        } as DataCell
      }
    }
  }

  // GET FREE BOUND
  public static async getEmptyBound(targetId: string): Promise<DataCell | null> {
    let { bounds } : { bounds : string[] } = this.cells[targetId]
    bounds = await Shuffle.getShuffled(bounds)

    let cellData: DataCell = null

    for (let id of bounds) {
      cellData = this.cells[id]

      if (!cellData?.flower) {
        return cellData
      }
    }

    return null
  }

  // GET OVERLAPING CELL
  public static async getOverlappingCell(x: number, y: number): Promise<DataCell | null> {
    const xMin = x - this._coverlappingRadius
    const xMax = x + this._coverlappingRadius
    const yMin = y - this._coverlappingRadius
    const yMax = y + this._coverlappingRadius

    let cellData: DataCell = null

    for (let key in this.cells) {
      cellData = this.cells[key]
      const { x, y } = cellData.position as Vec3

      if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
        return cellData
      }
    }

    return null
  }

  // CLEAR CELL
  public static async clearCell(id: string) {
    let oldCell = this.cells[id] as DataCell
    oldCell.flower = null
  }

  // GET BOUNDS
  private static async getBounds(targetColumn: number, targetRow: number): Promise<string[]> {
    let bounds: string[] = []

    for (let row = targetRow - 1; row <= targetRow + 1; row++ ) {
      for (let column = targetColumn - 1; column <= targetColumn + 1; column++ ) {
        if (row >= 0 && row < this._mapData.rows && column >= 0 && column < this._mapData.columns) {
          bounds.push(row + '-' + column)
        }
      }
    }

    const targetID: string = targetColumn + '-' + targetRow
    bounds = bounds.filter(item => item !== targetID)

    return bounds
  }
}
