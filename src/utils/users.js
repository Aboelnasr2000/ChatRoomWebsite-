const users = []


export const addUser = ({ id, username, room }) => {
    //Clean the Data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and Room are Required! '
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is in use! '
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }



}

export const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

export const getUser = (id) => {
    return users.find((user) => user.id === id)

}


export const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

