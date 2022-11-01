exports.findUserByUserID = (usersSocket,userID)=>{
      return usersSocket.find((element)=> element.userID === userID);
}
exports.findIndexBySocketID = (usersSocket,socketID)=>{
      return usersSocket.findIndex((element)=> element.socketID == socketID);
}