# **Task Management API**

## **Overview:**
A simple RESTful API for managing tasks, developed using **Node.js and Express**. It provides full *CRUD (Create, Read, Update, Delete)* capabilities for tasks, with all task data residing in **in-memory storage** and *initialized from a tasks.json file on startup*. Key features include **automatic assignment** of *createdAt* and *priority* defaults, robust task data validation, and advanced querying options such as *filtering by completion status, sorting by multiple fields (e.g., id, title, createdAt, priority) in ascending or descending order, and retrieving tasks by specific priority levels*.

---

## **Features:**
* *Task Management:* Add, retrieve, update, and delete tasks.
* *Data Persistence (Basic):* Tasks are loaded from a task.json file at startup (in-memory storage).
* *Task Validation:* Basic validation for incoming task data.
* *Automatic Defaults:* createdAt and priority are automatically assigned if missing during initial load or new task creation.
* *Filtering:* Filter tasks by completed status.
* *Sorting:* Sort tasks by various fields like id, title, createdAt, priority, etc., in ascending or descending order.
* *Specific Priority Retrieval:* Retrieve tasks based on a specific priority level.

## **Prerequisites:**
* Before you begin, ensure you have the following installed:
    * *Node.js:* Download & Install Node.js (LTS version recommended)
    * *npm:* Comes bundled with Node.js

## **Installation:**
* *Clone the repository:*
    ```sh 
        git clone https://github.com/your-repo/task-manager-api.git
        cd task-manager-api
    ```
    Replace `your-repo` with your actual repository link.
* *Install dependencies:*
    ```sh 
        npm install express
    ```
* *Start the server:*
    ```sh
        node app.js
    ```
* *To Test the Application:*
    ```sh
        npm run test
    ```

**The server will start on http://localhost:3000 by default since port specified in the file is 3000.**

## **API Endpoints:**
* *GET /tasks:* Retrieve all tasks.
    * *Query Parameters:* Return tasks based on the following query parameters:
        * *completed:* Filter tasks by completed status.
        * *sortBy:* Sort tasks by a specific field.
        * *sortOrder:* Sort order (asc or desc).
* *GET /tasks/:id:* Retrieve a specific task by ID.
* *GET /tasks/priority/:priority:* Retrieve tasks with a specific priority level.
* *POST /tasks:* Create a new task.
    * *Request Body:* JSON object with New task details.
* *PUT /tasks/:id:* Update a task by ID.
    * *Request Body:* JSON object with updated task details.
* *DELETE /tasks/:id:* Delete a task by ID.

## **JSON Data Format:** *All the fiels are mandatory for PUT requests*
    ```json
    {
        "id": 1, // Optional for POST requests, auto-generated if missing
        "title": "Task title",
        "description": "Task description",
        "completed": false, // Optional, default is false if missing in POST request
        "createdAt": "2023-10-01T12:00:00Z", // Optional, will be auto-generated if missing in POST request
        "priority": "low|medium|high", // Optional, will be assigned random between low, medium & high if missing in POST request
    }
    ```

## **Usage:**
* *Retrieve all tasks:*
    ```sh
        curl http://localhost:3000/tasks
    ```
* *Filter tasks by completed status:*
    ```sh
        curl http://localhost:3000/tasks?completed=true
    ```
* *Sort tasks by createdAt in descending order:*
    ```sh
        curl http://localhost:3000/tasks?sortBy=createdAt&sortOrder=desc
    ```
* *Retrieve a specific task:*
    ```sh
        curl http://localhost:3000/tasks/1
    ```
* *Retrieve tasks with a specific priority:*
    ```sh
        curl http://localhost:3000/tasks/priority/high
    ```
* *Create a new task:*
    ```sh
        curl -X POST -H "Content-Type: application/json" -d '{"title": "New Task", "description": "This is a new task."}' http://localhost:3000/tasks
    ```
* *Update a task:*
    ```sh
        curl -X PUT -H "Content-Type: application/json" -d '{"title": "Updated Task", "description": "This task has been updated."}' http://localhost:3000/tasks/1
    ```
* *Delete a task:*
    ```sh
        curl -X DELETE http://localhost:3000/tasks/1
    ```

## **Validation Rules:**
* *Title:* Required, must be a string.
* *Description:* Optional, must be a string.
* *Completed:* Optional, must be a boolean.
* *CreatedAt:* Optional, must be a string in the format "YYYY-MM-DD".
* *Priority:* Optional, must be a string (e.g., "low", "medium", "high").

## **Error Handling:**
* *400 Bad Request:* If the request body is missing or contains invalid data.
* *404 Not Found:* If the requested task is not found.
* *500 Internal Server Error:* If there's an internal server error.
