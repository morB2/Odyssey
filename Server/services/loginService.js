import usersModel from '../models/userModel.js';


export async function loginUserS(email) {
    const user = await usersModel.findOne({ email });
    console.log("user", user)
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    // const validPassword = await bcrypt.compare(password, user.password);
    // if (!validPassword) {
    //   throw new Error('Invalid password');
    // }

    // const token = jwt.sign({ userId: user._id }, this.secretKey, { expiresIn: '1h' });
    return { success: true, user };
};

export async function registerUserS(firstName, lastName, email, password, birthdate) {
    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
        const error = new Error('User already exists');
        error.status = 409;
        throw error;
    }
    const newUser = new usersModel({ firstName, lastName, email, password, birthdate });
    await newUser.save();
    //לבקש פה תוקן ולשלוח 
    // const token = jwt.sign({ userId: user._id }, this.secretKey, { expiresIn: '1h' });
    // return { success: true, token: token, user: newUser };
    return { success: true, user: newUser };
}

export async function googleLoginS(ticket) {
    const payload = ticket.getPayload();
    if (!payload) {
        const error = new Error("Invalid Google payload");
        error.status = 400;
        throw error;
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await usersModel.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
        const nameParts = name ? name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        user = new usersModel({
            firstName,
            lastName,
            email,
            googleId,
            avatar: picture,
            role: 'user',
        });

        await user.save();

        return { isNewUser: true, user };
    }

    return { isNewUser: false, user };
}
