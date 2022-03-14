
import { _decorator, Component } from 'cc'
const { ccclass } = _decorator


@ccclass('Shuffle')
export class Shuffle extends Component {

  // GET SHUFFLED
  public static async getShuffled(array: string[]) : Promise<string[]> {   
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1))

      let temp: string = array[i]
      array[i] = array[j]
      array[j] = temp
    }

    return array
  }
}
