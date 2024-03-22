import GameData from "../strings/_gameData";

const NightOrders = {

  calculateOrder(playerArray, charArray, roleArray) {

    const ordering = [];

    playerArray.forEach((player, index) => {

      const char = charArray[player.rChar]
      if (char.orderType) {
        const order = GameData.nightOrder.indexOf(char.orderType);
        ordering.push({order: order, name: char.name, playerIndex: index, type: "char"});
      }

      const role = roleArray[player.rRole]
      if (role.orderType) {
        const order = GameData.nightOrder.indexOf(role.orderType);
        ordering.push({order: order, name: role.name, playerIndex: index, type: "role"});
      }

    })

    ordering.sort((a, b) => {

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

    })

    return ordering;

  },

  addOrderIndicators(ordering, playerArray) {

    ordering.forEach((nightOrder, index) => {
      playerArray[nightOrder.playerIndex].nightOrders.push(index + 1);
    })

    return [...playerArray];

  }

} 

export default NightOrders