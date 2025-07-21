import jwt from 'jsonwebtoken';

const genToken = async (userId) => {
    try {
        const token = await jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "10y"})

        return token;
    } catch (error) {
        return resizeBy.staus(500).json({ message: "Token generation failed" });
    }
}

export default genToken;