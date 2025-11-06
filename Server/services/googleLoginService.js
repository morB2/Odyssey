import usersModel from '../models/userModel.js';

export async function googleLoginS(ticket) {
    const payload = ticket.getPayload();
    if (!payload) return { error: "Invalid payload" };

    const { sub: googleId, email, name, picture } = payload;
    console.log("Google Payload:", payload);

    // חיפוש משתמש קיים לפי email או googleId
    let user = await usersModel.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
        // אם המשתמש לא קיים – ליצור חדש
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
