const users=[];

const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    if(!username || !room){
        return{
            error:"Username and Room are required"
        }
    }

    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })

    if(existingUser){
        return{
            error:"Username already in use"
        }
    }

    const user={id,username,room}
    users.push(user)
    return {user}
}


const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id;
    })

    if(index!==-1){
        return users.splice(index,1)[0]
    }
}


const getUser=(id)=>{
   return users.find((user)=>user.id===id)
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase();
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}




// addUser({
//     id:12,
//     username:"safin",
//     room:"one"
// })
// addUser({
//     id:13,
//     username:"sheikh",
//     room:"two"
// })
// console.log(users)

// const user=getUser(12)
// console.log(user)

// const removedUser=removeUser(12)
// console.log(removedUser)
// console.log(users)

// const userInSameRoom=getUsersInRoom("name")
// console.log(userInSameRoom)