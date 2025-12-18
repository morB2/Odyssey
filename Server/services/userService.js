import usersModel from '../models/userModel.js';

export async function getAllUsers(query = {}) {
    // If no pagination/search params are provided, return all users (Backward Compatibility)
    if (!query.page && !query.limit && !query.search && !query.role) {
        let result = await usersModel.find({});
        if (result.length == 0) {
            return []; // Return empty array instead of throwing error for better FE handling
        }
        return result;
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.search) {
        filter.$or = [
            { firstName: { $regex: query.search, $options: 'i' } },
            { lastName: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
        ];
    }

    if (query.role) {
        filter.role = query.role;
    }

    const total = await usersModel.countDocuments(filter);
    const users = await usersModel.find(filter)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit);

    return {
        users,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
}


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