self.addEventListener('message', ()=>{
    interval = setInterval(()=>{
        postMessage('')
    }, 1000)
}) 

