import api from "./httpService";

import type { Collection } from "../components/user/types";

export type CollectionInput = Omit<Partial<Collection>, 'trips'> & {
    trips?: string[];
};


export const createCollection = async (collectionData: CollectionInput) => {
    const response = await api.post("/collections", collectionData);
    return response.data.collection;
};

export const getCollectionsByUser = async (userId: string) => {
    const response = await api.get(`/collections/user/${userId}`);
    return response.data; // { success: true, collections: [] }
};

export const getCollectionById = async (collectionId: string) => {
    const response = await api.get(`/collections/${collectionId}`);
    return response.data.collection;
};

export const updateCollection = async (collectionId: string, updates: CollectionInput) => {
    const response = await api.put(`/collections/${collectionId}`, updates);
    return response.data.collection;
};

export const deleteCollection = async (collectionId: string) => {
    const response = await api.delete(`/collections/${collectionId}`);
    return response.data;
};
