import getPrismaInstance from "../utils/PrismaClient.js";

export const checkUser = async (req, res, next)=>{
    try {
        const {email} = req.body;
        if(!email){
            return res.json({msg:`Email is required`,status:false})
        }
        
        const prisma = getPrismaInstance();
        const user = await prisma.user.findUnique({
            where:{
                email:email
            }
        });

        if(!user){
            return res.json({msg:"User not found",status:false})
        }else{
            return res.json({msg:"User found",status:true, data:user})
        }
    } catch (error) {
        next(error)
    }
    
};

export const onBoardUser = async (req, res, next)=>{
    try {
        const { name, email, about, image:profilePicture} = req.body
        if(!email || !name || !profilePicture){
            return res.send("Email, name and image required!");
        }
        const prisma = getPrismaInstance()
        const user = await prisma.user.create({
            data:{name, email, about, profilePicture}
        });
        return res.json({msg:"Success", status:true,data:user});
    } catch (error) {
        next(error)
    }
};
export const getAllUsers = async (req, res, next)=>{
    try {
        const prisma = getPrismaInstance();
        const users = await prisma.user.findMany({
            orderBy:{name:"asc"},
            select:{
                id:true,
                name:true,
                email:true,
                about:true,
                profilePicture:true
            }
        });
        const usersGroupedByInititalLetter = {};
        users.forEach((user)=>{
            const initiaLetter = user.name.charAt(0).toUpperCase();
            if(!usersGroupedByInititalLetter[initiaLetter]){
                usersGroupedByInititalLetter[initiaLetter] = []; 
            }
            usersGroupedByInititalLetter[initiaLetter].push(user);

        });
        return res.status(200).send({users:usersGroupedByInititalLetter});

    } catch (error) {
        next(error)
    }
}