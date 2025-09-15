async function a (){
    async function b(){
        console.log("b");
        await Promise.resolve(setTimeout(()=>{},5000))
        console.log("c-2");
        
    }
    
    async function c(){
        console.log("c");
        setTimeout(()=>{
            console.log("c ke liye ruk gya tha");
            
        },5000)
    }

    await b()
    await c()
}

a()