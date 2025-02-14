


export const catchError=(controller)=>
    async(req,res,next)=>
{
     try{
        await controller(req,res,next)
     }
     catch(error){
        next(error);
     }
}