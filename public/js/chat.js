const socket = io()

//Elements 


const $messageForm = document.querySelector('#message_form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $LocationButton = document.querySelector('#send_location')

const $messages = document.querySelector('#messages')


//Templates

const messageTemplate = document.querySelector('#message_template').innerHTML
const locationMessage_template = document.querySelector('#locationMessage_template').innerHTML
const sidebar_template = document.querySelector('#sidebar_template').innerHTML

//Options


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New Message Element
    const $newMessage = $messages.lastElementChild

    //Height Of New Message
    const newMessaageStyles = getComputedStyle($newMessage)
    const newMessageMargin =parseInt(newMessaageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages Container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight 

    if (containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessage_template, { username: message.username, url: message.url, createdAt: moment(message.createdAt).format('h:mm a') })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebar_template, { room, users })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log("Message Delivered!")
    })
})

$LocationButton.addEventListener('click', () => {

    $LocationButton.setAttribute('disabled', 'disabled')

    // e.preventDefault()
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition(({ coords }) => {
        socket.emit('sendLocation', {
            Latitude: coords.latitude,
            Longitude: coords.longitude
        }, (Acknologment) => {
            $LocationButton.removeAttribute('disabled')
            console.log(Acknologment)
        })
    })
})
socket.emit('join', ({ username, room }), (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})