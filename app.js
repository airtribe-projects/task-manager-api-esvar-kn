const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the path to the JSON file
const jsonFilePath = path.join(__dirname, 'task.json');

// Initialize an empty task list
let taskList = [];

// Read the JSON file and populate the taskList array
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return; // Stop execution if there's an error
    }
    try {
        const list = JSON.parse(data); // Parse the JSON string into a JavaScript array
        taskList = list.tasks;
        taskList = taskList.map(task => {
            // Create a shallow copy of the task object to avoid mutating the original
            let updatedTask = { ...task };
            // 1. Handle createdAt
            if (!updatedTask.createdAt) {
                updatedTask.createdAt = new Date(); // Set createdAt to current date if not present;
            }
            // 2. Handle priority
            if (!updatedTask.priority) {
                const priorityValues = ['low', 'medium', 'high'];
                // CORRECT WAY: Get a random NUMERIC index first
                const randomIndex = Math.floor(Math.random() * priorityValues.length);
                // Then use that numeric index to get the actual random VALUE
                updatedTask.priority = priorityValues[randomIndex];
            }
            return updatedTask; // Return the potentially updated task
        });
    } catch (parseError) {
        console.error('Error parsing JSON content:', parseError);
    }
});

// Function to validate task data
function validateTaskData(taskData, isNewTask = false) {
    if (Object.keys(taskData).length === 0) {
        return "Task data cannot be empty."; // Applies to both POST and PUT
    }

    if (isNewTask) {
        // For new tasks (POST), title and description are mandatory
        if (typeof taskData.title !== 'string' || taskData.title.trim() === '') {
            return "Title is required and must be a non-empty string.";
        }
        if (typeof taskData.description !== 'string' || taskData.description.trim() === '') {
            return "Description is required and must be a non-empty string.";
        }
        // 'completed' has a default, so it's not strictly required here
        if (taskData.completed !== undefined && typeof taskData.completed !== 'boolean') {
            return "Completed must be a boolean value if provided.";
        }
        if (taskData.priority !== undefined && !['low', 'medium', 'high'].includes(taskData.priority.toLowerCase())) {
            return "Priority must be 'low', 'medium', or 'high' if provided.";
        }

    } else {
        // For updates (PUT/PATCH), validate only if the field is provided
        if (taskData.title !== undefined) {
            if (typeof taskData.title !== 'string' || taskData.title.trim() === '') {
                return "Title must be a non-empty string if provided.";
            }
        }
        if (taskData.description !== undefined) {
            if (typeof taskData.description !== 'string' || taskData.description.trim() === '') {
                return "Description must be a non-empty string if provided.";
            }
        }
        if (taskData.completed !== undefined) {
            if (typeof taskData.completed !== 'boolean') {
                return "Completed must be a boolean value if provided.";
            }
        }
        if (taskData.priority !== undefined) {
            if (typeof taskData.priority !== 'string' || !['low', 'medium', 'high'].includes(taskData.priority.toLowerCase())) {
                return "Priority must be 'low', 'medium', or 'high' if provided.";
            }
        }
    }

    return null; // No validation errors
}

// Helper function to create a new task object (for POST)
function createNewTaskObject(body, newId) {
    return {
        id: newId,
        title: body.title,
        description: body.description,
        completed: body.completed !== undefined ? body.completed : false,
        createdAt: new Date(), // Always generate for new tasks
        priority: body.priority || 'low' // Default for new tasks
    };
}

// Helper function to update an existing task object (for PUT/PATCH)
// This applies updates to an EXISTING task, preserving fields not provided.
function updateExistingTaskObject(existingTask, updateBody) {
    
    const updatedTask = { ...existingTask }; // Start with a copy of the existing task
    
    // Update fields only if they are provided in the updateBody
    if (updateBody.title !== undefined) {
        updatedTask.title = updateBody.title;
    }
    if (updateBody.description !== undefined) {
        updatedTask.description = updateBody.description;
    }
    if (updateBody.completed !== undefined) {
        updatedTask.completed = updateBody.completed;
    }
    if (updateBody.priority !== undefined) {
        updatedTask.priority = updateBody.priority;
    }
    if (updateBody.startedAt !== undefined) {
        updatedTask.startedAt = updateBody.startedAt;
    }
    
    return updatedTask;
}

// Endpoint to retrive all the tasks in the list
app.get('/tasks', (req, res) => {

    let copyTaskList = [...taskList]; // Create a shallow copy to avoid mutating the original list

    const { completed, sortBy, sortOrder } = req.query;

    // If the completed query parameter is provided, filter tasks by completion status
    if (completed !== undefined) {
        const lowerCaseCompleted = completed.toLowerCase(); // Standardize input
        if (lowerCaseCompleted !== 'true' && lowerCaseCompleted !== 'false') {
            return res.status(400).json({ error: "Invalid 'completed' query parameter. Must be 'true' or 'false'." });
        }
        const isCompletedBoolean = lowerCaseCompleted === 'true';
        const filteredTasks = copyTaskList.filter(task => task.completed === isCompletedBoolean);
        return res.status(200).json(filteredTasks);
    }

    // mutating the original task list
    const validSortFields = ['id', 'title', 'description', 'completed', 'createdAt', 'priority'];
    if (sortBy !== undefined) {
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({ error: `Invalid 'sortBy' parameter. Must be one of: ${validSortFields.join(', ')}.` });
        }
        const effectiveSortOrder = (!sortOrder ? 'asc' : sortOrder).toLowerCase(); // Default to 'asc'
        if (effectiveSortOrder !== 'asc' && effectiveSortOrder !== 'desc') {
            return res.status(400).json({ error: "Invalid 'sortOrder' parameter. Must be 'asc' or 'desc'." });
        }
        // Sort the task list based on the specified field and order
        const sortedList = copyTaskList.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (aValue < bValue) {
                return effectiveSortOrder === 'asc' ? -1 : 1; // a comes before b (asc) or b comes before a (desc)
            }
            if (aValue > bValue) {
                return effectiveSortOrder === 'asc' ? 1 : -1; // a comes after b (asc) or b comes after a (desc)
            }
            return 0; // Values are equal, maintain original relative order
        });
        return res.status(200).json(sortedList);
    }

    res.status(200).json(copyTaskList);
});

// Endpoint to retrieve tasks by their priority
app.get('/tasks/priority/:priority', (req, res) => {

    let copyTaskList = [...taskList]; // Create a shallow copy to avoid mutating the original list

    // Extract the priority from the request parameters
    const priority = req.params.priority.toLowerCase();
    // Validate the priority value
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: "Invalid priority value. Must be 'low', 'medium', or 'high'." });
    }
    // Filter the task list by the specified priority
    const priorityFilteredTasks = copyTaskList.filter(task => task.priority === priority);
    // If no tasks match the specified priority, return a 404 status code
    if (priorityFilteredTasks.length === 0) {
        return res.status(404).json({ error: `No tasks found with priority '${priority}'.` });
    }
    // Return the filtered tasks with a 200 status code
    res.status(200).json(priorityFilteredTasks);
});

// Endpoint to retrive a specific task bcleay its ID
app.get('/tasks/:id', (req, res) => {

    let copyTaskList = [...taskList]; // Create a shallow copy to avoid mutating the original list

    // Extract the task ID from the request parameters
    const taskId = req.params.id;
    // Find the task in the task list by its ID
    const task = copyTaskList.find(task => task.id === parseInt(taskId));
    // If the task is not found, return a 404 status code
    // and a message indicating that the task is not listed
    if (!task) {
        return res.status(404).json({ error: `Task with ID '${taskId}' not found.` });
    }
    // If the task is found, return the task details
    res.status(200).json(task);
});

// Endpoint to add a new task to the list
app.post('/tasks', (req, res) => {

    let copyTaskList = [...taskList]; // Create a shallow copy to avoid mutating the original list

    const newTask = req.body;
    const validationError = validateTaskData(newTask, true);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    const maxId = copyTaskList.reduce((max, task) => { return Math.max(max, task.id); }, 0);
    const newTaskId = maxId + 1; // Generate a new ID for the task
    // Assign the new task an ID and add it to the task list
    const newTaskAdded = createNewTaskObject(newTask, newTaskId);
    // Add the new task to the task list
    copyTaskList.push(newTaskAdded);
    // Return the updated task list with a 201 status code
    res.status(201).json(newTaskAdded);
});

// Endpoint to update an existing task by its ID
app.put('/tasks/:id', (req, res) => {

    let copyTaskList = [...taskList]; // Create a shallow copy to avoid mutating the original list

    const taskId = req.params.id;
    const taskUpdate = req.body;
    const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));
    // If the task is not found, return a 404 status code
    if (taskIndex === -1) {
        return res.status(404).json({ error: `Task with ID '${taskId}' not found.` });
    }
    const validationError = validateTaskData(taskUpdate);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Create a new task object with the updated details
    const updatesTask = updateExistingTaskObject(copyTaskList[taskIndex], taskUpdate);
    // Return the updated task list
    res.status(200).json(updatesTask);
});

// Endpoint to delete a task by its ID
app.delete('/tasks/:id', (req, res) => {
    
    let copyTaskList = [...taskList]; // Create a shallow copy to avoid mutating the original list

    const taskId = req.params.id;
    const taskIndex = copyTaskList.findIndex((task) => task.id === parseInt(taskId));
    // If the task is not found, return a 404 status code
    if (taskIndex === -1) {
        return res.status(404).json({ error: `Task with ID '${taskId}' not found.` });
    }
    // Remove the task from the list
    copyTaskList.splice(taskIndex, 1);
    // Return the updated task list
    res.status(200).json(copyTaskList);

});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

module.exports = app;