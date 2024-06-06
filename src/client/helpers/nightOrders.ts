import Char from "../classes/char.ts";
import Player from "../classes/player.ts";
import Role from "../classes/role.ts";
import GameData from "../strings/_gameData.ts";

export interface OrderItem {
  order: number;
  name: string
}

export interface PlayerOrderItem extends OrderItem {
  playerIndex: number;
  type: "char" | "role";
}

const NightOrders = {

  /**
   * sorts by order number and then name
   * @param a 
   * @param b 
   * @returns 
   */
  sortOrder(a: PlayerOrderItem | OrderItem, b: PlayerOrderItem | OrderItem): number {

    if (a.order > b.order) {
      return 1;
    } else if (a.order < b.order) {
      return -1;
    } else {

      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else {
        return 0;
      }

    }

  },

  /**
   * calculates the night order for the current players in the session
   * @param playerArray 
   * @param charArray 
   * @param roleArray 
   * @returns 
   */
  calculateOrder(playerArray: Player[], charArray: Char[], roleArray: Role[]): PlayerOrderItem[] {

    const ordering: PlayerOrderItem[] = [];

    playerArray.forEach((player, index) => {

      const char = charArray[player.rChar]
      if (char && char.orderType) {
        const target = GameData.nightOrder.find(ele => ele.id === char.orderType);
        if (!target) throw new Error("failed to calculate night order no orderType found for char");
        const order = GameData.nightOrder.indexOf(target);
        ordering.push({order: order, name: char.name, playerIndex: index, type: "char"});
      }

      const role = roleArray[player.rRole]
      if (role && role.orderType) {
        const target = GameData.nightOrder.find(ele => ele.id === role.orderType);
        if (!target) throw new Error("failed to calculate night order no orderType found for role");
        const order = GameData.nightOrder.indexOf(target);
        ordering.push({order: order, name: role.name, playerIndex: index, type: "role"});
      }

    })

    ordering.sort(this.sortOrder);

    return ordering;

  },

  /**
   * adds night order indicators to the players in the current session
   * @param ordering 
   * @param playerArray 
   * @param purgedOrders 
   * @returns 
   */
  addOrderIndicators(ordering: PlayerOrderItem[], playerArray: Player[], purgedOrders: string[]): Player[] {

    playerArray = playerArray.map(player => {
      player.nightOrders = [];
      return {...player};
    })

    if (purgedOrders) {
      ordering = ordering.filter(order => purgedOrders.includes(JSON.stringify(order)) === false);
    }
  
    ordering.forEach((nightOrder, index) => {
      playerArray[nightOrder.playerIndex].nightOrders.push(index + 1);
    })

    return [...playerArray];

  },

  /**
   * calculates the ordering for all roles and characteristics in the current session
   * @param charArray 
   * @param roleArray 
   * @returns 
   */
  calculateFullOrder(charArray: Char[], roleArray: Role[]): OrderItem[] {

    const filter = (ele: Char | Role) => ele.orderType !== "";

    const ordering = charArray
    .concat(roleArray)
    .filter(filter)
    .map(ele => {
      const target = GameData.nightOrder.find(order => order.id === ele.orderType);
      if (!target) throw new Error("failed to calculate full night order no matching orderType found");
      const order = GameData.nightOrder.indexOf(target);
      return {order: order, name: ele.name} as OrderItem;
    })

    ordering.sort(this.sortOrder);

    return ordering;

  }

} 

export default NightOrders