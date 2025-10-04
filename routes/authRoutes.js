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
module.exports = router