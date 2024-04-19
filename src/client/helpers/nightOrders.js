import GameData from "../strings/_gameData";

const NightOrders = {

  // sorts by order number and then name
  sortOrder(a ,b) {

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

  calculateOrder(playerArray, charArray, roleArray) {

    const ordering = [];

    playerArray.forEach((player, index) => {

      const char = charArray[player.rChar]
      if (char && char.orderType) {
        const target = GameData.nightOrder.find(ele => ele.id === char.orderType);
        const order = GameData.nightOrder.indexOf(target);
        ordering.push({order: order, name: char.name, playerIndex: index, type: "char"});
      }

      const role = roleArray[player.rRole]
      if (role && role.orderType) {
        const target = GameData.nightOrder.find(ele => ele.id === role.orderType);
        const order = GameData.nightOrder.indexOf(target);
        ordering.push({order: order, name: role.name, playerIndex: index, type: "role"});
      }

    })

    ordering.sort(this.sortOrder);

    return ordering;

  },

  addOrderIndicators(ordering, playerArray, purgedOrders) {

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

  calculateFullOrder(charArray, roleArray) {

    const filter = ele => ele.orderType !== "";

    const ordering = charArray
    .concat(roleArray)
    .filter(filter)
    .map(ele => {
      const target = GameData.nightOrder.find(order => order.id === ele.orderType);
      const order = GameData.nightOrder.indexOf(target);
      return {order: order, name: ele.name}
    })

    ordering.sort(this.sortOrder);

    return ordering;

  }

} 

export default NightOrders