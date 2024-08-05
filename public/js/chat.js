const socket =io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLoc=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

const msgTemplate=document.querySelector('#message-template').innerHTML
const locmsgTemplate=document.querySelector('#location-message-template').innerHTML
const sideBarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //New message Element
    const $newMessage=$messages.lastElementChild

    //height of the new message
    const newMessageStyles=getComputedStyle($newMessage)//made available to us by browser
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight +newMessageMargin

    //visible Height
    const visibleHeight=$messages.offsetHeight

    //height of messages container
    const containerHeight=$messages.scrollHeight


    //How far have i scrolled? to perform correct calculations
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <=scrollOffset){
        $messages.scrollTop= $messages.scrollHeight

    }

    // console.log(newMessageStyles)
    // console.log(newMessageMargin)
}

socket.on('message',(message)=>{
    // console.log(msg)
    const html=Mustache.render(msgTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locmsgTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    // console.log(html)
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
     const html=Mustache.render(sideBarTemplate,{
        room,
        users
     })
     document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //disabling
    $messageFormButton.setAttribute('disabled','disabled')


    const message=e.target.elements.message.value
    // const message=document.querySelector('message').value
    socket.emit('sendMessage',message,(err)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(err){
            return console.log("not allowed")
        }
        console.log("Delievered")
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    $sendLoc.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
       const location={
        latitude:position.coords.latitude,
        longitude:position.coords.longitude
       }
       socket.emit('sendLocation',location,()=>{
        $sendLoc.removeAttribute('disabled')
            console.log("Location shared")
       })
      })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }

})