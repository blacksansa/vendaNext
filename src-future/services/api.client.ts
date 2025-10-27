import axios from 'axios';

const API_BASE_URL = 'https://your-api-url.com/api'; // Replace with your actual API base URL

// Function to fetch all groups
export const fetchAllGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/grupos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

// Function to create a new group
export const createGroup = async (groupData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/grupos`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Function to update an existing group
export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/grupos/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

// Function to delete a group
export const deleteGroup = async (groupId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/grupos/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};