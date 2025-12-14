import { getAllUsers, updateUser } from '../services/userService.js';

export async function getAll(query) {
    const data = await getAllUsers(query);
    return data;
}

// export async function create(query) {
//     const userData = query; 
//     const newUser = await addUser(userData);
//     return newUser;
// }

export async function update(id, updateData) {
    const updatedUser = await updateUser(id, updateData);
    return updatedUser;
}