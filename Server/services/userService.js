import usersModel from '../models/userModel.js';

export async function getAllUsers() {
        let result = await usersModel.find({})
        if (result.length == 0) {
            throw new Error('Users Not found')
        }
        return result;
}

// export async function addUser(userData) {
//     try {
//         const newUser = new usersModel(userData);
//         const savedUser = await newUser.save();
//         return savedUser;
//     } catch (err) {
//         throw new Error('Failed to add user: ' + err.message);
//     }
// }

export async function updateUser(userId, updateData) {
    try {
        const updatedUser = await usersModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    } catch (err) {
        throw new Error('Failed to update user: ' + err.message);
    }
}