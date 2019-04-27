const socket = io()

// Elements
const $messageForm = document.querySelector('#chat');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   // Visible height
   const visibleHeight = $messages.offsetHeight

   // Height of messages container
   const containerHeight = $messages.scrollHeight

   // How far have I scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
   }


}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (position) => {
    console.log(position);
    const html = Mustache.render(locationTemplate, {
        username: position.username,
        url: position.url,
        createdAt: moment(position.createdAt).format('h:mm:a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    $messageFormButton.setAttribute('disabled', 'disabled');
    // Disable

    
    var input = e.target.elements.message.value;
    
    socket.emit('sendMessage', input, (error) => {
        $messageFormButton.removeAttribute('disabled'); 
        $messageFormInput.value = '';
        $messageFormInput.focus();
        // enable
        if (error) {
            return console.log(error);
        }
        
        console.log('Message delivered!');
    });
    
})

$sendLocation.addEventListener('click', () => {
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled');
            console.log('Location shared!')
        });
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});