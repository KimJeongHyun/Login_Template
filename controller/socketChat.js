module.exports={
    connectSocket : function(server){
        const appSocket = require('socket.io')(server);
        let count = 1;
        appSocket.on('connection',(socket)=>{
            console.log('User connected',socket.id);
            
            socket.on('disconnect',()=>{
                console.log('User disconnected', socket.id)
            });
        
            socket.on('send message',(name,text)=>{
                let msg = name+' : '+text;
                console.log(msg);
                appSocket.emit('receive message',msg);
            })
        })
    }   
}