const generateMessage = (username, text) => {
    return {
        username: username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, lat, long) => {
    return {
        username: username,
        url: `https://www.google.com/maps?q=${lat},${long}`,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}