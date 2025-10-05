const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post("/register", async (req, res)=>{
    const {name,email,password,role} = req.body;
    try {
        let user = await User.findOne({email});
        if(user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.json({ message: "Registered successfully" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Server error" });
    }
})

router.post('/login', async (req,res)=>{
    const{email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({ message: "Invalid credentials" }); 

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign( 
            {userId: user._id, name: user.name, role:user.role, balance: user.balance}
            ,JWT_SECRET
            ,{expiresIn: "2h"});
        res.json({ message: "Login successful", token });
    } catch (e) {
        console.error(e);
         res.status(500).json({ message: "Server error" });
    }
})
module.exports = router